package com.kpop.Clz.service;

import com.kpop.Clz.dto.CartItemInputDTO;
import com.kpop.Clz.dto.CreateOrderRequestDTO;
import com.kpop.Clz.dto.OrderDTO;
import com.kpop.Clz.dto.OrderItemDTO;
import com.kpop.Clz.exception.InsufficientStockException;
import com.kpop.Clz.exception.ResourceNotFoundException;
import com.kpop.Clz.model.Order;
import com.kpop.Clz.model.OrderItem;
import com.kpop.Clz.model.Product;
import com.kpop.Clz.model.User;
import com.kpop.Clz.repository.OrderRepository;
import com.kpop.Clz.repository.ProductRepository;
import com.kpop.Clz.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersForCurrentUser() {
        System.out.println("OrderService: Entering getOrdersForCurrentUser");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            System.err.println("OrderService: User is not authenticated or authentication is anonymous.");
            throw new UsernameNotFoundException("User not authenticated for fetching orders.");
        }
        String currentPrincipalName = authentication.getName();
        System.out.println("OrderService: Current principal name: " + currentPrincipalName);

        User currentUser = userRepository.findByUsername(currentPrincipalName)
                .orElseGet(() -> userRepository.findByEmail(currentPrincipalName)
                        .orElseThrow(() -> {
                            System.err.println("OrderService: User not found with principal: " + currentPrincipalName);
                            return new UsernameNotFoundException("User not found with principal: " + currentPrincipalName);
                        })
                );
        System.out.println("OrderService: Found user with ID: " + currentUser.getId());

        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(currentUser.getId());
        System.out.println("OrderService: Fetched " + orders.size() + " orders from repository.");

        if (orders.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            return orders.stream()
                    .map(this::convertToOrderDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("OrderService: Error during DTO conversion - " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public OrderDTO convertToOrderDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(this::convertToOrderItemDTO)
                .collect(Collectors.toList());


        LocalDateTime orderDateTime = (order.getOrderDate() != null) ? order.getOrderDate().toLocalDateTime() : null;

        return new OrderDTO(
            order.getId(),
            orderDateTime,
            order.getOrderCode(),
            order.getTotalAmount(),
            order.getShippingFee(),
            order.getGrandTotal(),
            order.getStatus(),
            order.getShippingAddress(),
            order.getPhoneNumber(),
            itemDTOs
        );
    }

    private OrderItemDTO convertToOrderItemDTO(OrderItem orderItem) {
        String productName = (orderItem.getProduct() != null) ? orderItem.getProduct().getName() : "N/A";
        String imageUrl = (orderItem.getProduct() != null) ? orderItem.getProduct().getImageUrl() : null;
        Long productId = (orderItem.getProduct() != null) ? orderItem.getProduct().getId() : null;


        return new OrderItemDTO(
                productId,
                productName,
                imageUrl,
                orderItem.getQuantity(),
                orderItem.getUnitPrice()
        );
    }

    @Autowired
    private CartService cartService; // Inject CartService

    @Transactional
    public Order createOrder(CreateOrderRequestDTO request, User currentUser) {
        System.out.println("OrderService: Entering createOrder for user: " + currentUser.getEmail());

        Order newOrder = new Order();
        newOrder.setUser(currentUser);
        newOrder.setShippingAddress(request.getShippingAddress());
        newOrder.setPhoneNumber(request.getPhoneNumber());

        newOrder.setOrderCode(generateOrderCode());

        BigDecimal subtotalProducts = BigDecimal.ZERO;
        if (request.getCartItems() == null || request.getCartItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item.");
        }

        for (CartItemInputDTO itemInput : request.getCartItems()) {
            Product product = productRepository.findById(itemInput.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemInput.getProductId()));

            if (product.getStockQuantity() < itemInput.getQuantity()) {
                throw new InsufficientStockException("Not enough stock for product: " + product.getName() +
                        ". Requested: " + itemInput.getQuantity() + ", Available: " + product.getStockQuantity());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemInput.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setOrder(newOrder);
            newOrder.getOrderItems().add(orderItem);


            subtotalProducts = subtotalProducts.add(
                    product.getPrice().multiply(new BigDecimal(itemInput.getQuantity()))
            );

            product.setStockQuantity(product.getStockQuantity() - itemInput.getQuantity());
            productRepository.save(product);
        }
        newOrder.setTotalAmount(subtotalProducts);

        BigDecimal actualShippingFee = calculateShippingFeeOnBackend(request.getSelectedProvince(), newOrder.getOrderItems());
        newOrder.setShippingFee(actualShippingFee);

        newOrder.setGrandTotal(subtotalProducts.add(actualShippingFee)); // Tổng cuối cùng
        newOrder.setStatus(Order.OrderStatus.PENDING);

        Order savedOrder = orderRepository.save(newOrder);
        System.out.println("OrderService: Actual Order created successfully with ID: " + savedOrder.getId());

        cartService.clearCartAfterCheckout(currentUser);
        System.out.println("OrderService: Cart (Order with CART status) cleared for user after order creation.");

        return savedOrder;
    }

    private BigDecimal calculateShippingFeeOnBackend(String province, List<OrderItem> items) {
        if (province == null || province.isEmpty()) return BigDecimal.ZERO;
        if (province.equals("TP. Hồ Chí Minh")) return new BigDecimal("5.00");
        if (Arrays.asList("Đồng Nai", "Bình Dương", "Bà Rịa - Vũng Tàu", "Long An", "Tiền Giang", "Cần Thơ").contains(province)) {
            return new BigDecimal("7.00");
        }
        return new BigDecimal("10.00");
    }

    private BigDecimal calculateShippingFeeOnBackend(String province, Set<OrderItem> items) {
        if (province == null || province.isEmpty()) return BigDecimal.ZERO;

        if (province.equals("TP. Hồ Chí Minh")) return new BigDecimal("5.00");
        if (Arrays.asList("Đồng Nai", "Bình Dương", "Bà Rịa - Vũng Tàu", "Long An", "Tiền Giang", "Cần Thơ").contains(province)) {
            return new BigDecimal("7.00");
        }
        return new BigDecimal("10.00");
    }

    private String generateOrderCode() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String orderCode = "ORD-" + datePart + "-" + randomPart;
        return orderCode;
    }
}