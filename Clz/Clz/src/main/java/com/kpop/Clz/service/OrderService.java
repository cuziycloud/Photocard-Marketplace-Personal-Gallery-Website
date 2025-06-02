package com.kpop.Clz.service;

import com.kpop.Clz.dto.CartItemDTO;
import com.kpop.Clz.dto.CreateOrderRequestDTO;
import com.kpop.Clz.dto.OrderDTO;
import com.kpop.Clz.dto.OrderItemDTO;
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

    private OrderDTO convertToOrderDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(this::convertToOrderItemDTO)
                .collect(Collectors.toList());


        LocalDateTime orderDateTime = (order.getOrderDate() != null) ? order.getOrderDate().toLocalDateTime() : null;

        return new OrderDTO(
            order.getId(),
            orderDateTime,
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

    @Transactional
    public Order createOrder(CreateOrderRequestDTO request, User currentUser) {
        Order newOrder = new Order();
        newOrder.setUser(currentUser);
        newOrder.setShippingAddress(request.getShippingAddress());
        newOrder.setPhoneNumber(request.getPhoneNumber());

        BigDecimal subtotalProducts = BigDecimal.ZERO;
        for (CartItemDTO itemInput : request.getCartItems()) {
            Product product = productRepository.findById(itemInput.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            // Kiểm tra tồn kho ở đây
            if (product.getStockQuantity() < itemInput.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemInput.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            newOrder.addOrderItem(orderItem);
            subtotalProducts = subtotalProducts.add(product.getPrice().multiply(new BigDecimal(itemInput.getQuantity())));

        }
        newOrder.setTotalAmount(subtotalProducts);

        BigDecimal actualShippingFee = calculateShippingFeeOnBackend(request.getSelectedProvince(), (Set<OrderItem>) newOrder.getOrderItems());
        newOrder.setShippingFee(actualShippingFee);

        newOrder.setGrandTotal(subtotalProducts.add(actualShippingFee));
        newOrder.setStatus(Order.OrderStatus.PENDING);

        return orderRepository.save(newOrder);
    }

    private BigDecimal calculateShippingFeeOnBackend(String province, Set<OrderItem> items) {
        if (province == null || province.isEmpty()) return BigDecimal.ZERO;

        if (province.equals("TP. Hồ Chí Minh")) return new BigDecimal("5.00");
        if (Arrays.asList("Đồng Nai", "Bình Dương", "Bà Rịa - Vũng Tàu", "Long An", "Tiền Giang", "Cần Thơ").contains(province)) {
            return new BigDecimal("7.00");
        }
        return new BigDecimal("10.00");
    }

}