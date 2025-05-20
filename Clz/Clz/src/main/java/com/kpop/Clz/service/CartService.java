package com.kpop.Clz.service;

import com.kpop.Clz.dto.AddToCartRequest;
import com.kpop.Clz.dto.CartDTO;
import com.kpop.Clz.exception.InsufficientStockException;
import com.kpop.Clz.exception.ResourceNotFoundException;
import com.kpop.Clz.model.*;
import com.kpop.Clz.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CartDTO getCartByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Optional<Order> pendingOrderOpt = orderRepository.findByUserAndStatus(user, Order.OrderStatus.PENDING);

        if (pendingOrderOpt.isPresent()) {
            Order pendingOrder = pendingOrderOpt.get();
            return new CartDTO(pendingOrder);
        } else {
            return new CartDTO(userId);
        }
    }

    @Transactional
    public CartDTO addItemToCart(Integer userId, AddToCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new InsufficientStockException("Product " + product.getName() + " (ID: " + product.getId() + ") does not have enough stock. Requested: " + request.getQuantity() + ", Available: " + product.getStockQuantity());
        }

        Order pendingOrder = orderRepository.findByUserAndStatus(user, Order.OrderStatus.PENDING)
                .orElseGet(() -> createNewPendingOrderForUser(user));

        Optional<OrderItem> existingItemOpt = pendingOrder.getOrderItems().stream()
                .filter(item -> item.getProduct() != null && item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            OrderItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (product.getStockQuantity() < newQuantity) {
                throw new InsufficientStockException("Adding " + request.getQuantity() + " of " + product.getName() + " would exceed stock. Current in cart: " + existingItem.getQuantity() + ", Total requested: " + newQuantity + ", Available: " + product.getStockQuantity());
            }
            existingItem.setQuantity(newQuantity);
        } else {
            OrderItem newItem = new OrderItem();
            newItem.setOrder(pendingOrder);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            newItem.setUnitPrice(product.getPrice());
            pendingOrder.addOrderItem(newItem);
        }

        calculateOrderTotals(pendingOrder);
        orderRepository.save(pendingOrder);

        return new CartDTO(pendingOrder);
    }

    private Order createNewPendingOrderForUser(User user) {
        Order newOrder = new Order();
        newOrder.setUser(user);
        newOrder.setStatus(Order.OrderStatus.PENDING);
        newOrder.setOrderDate(new Timestamp(System.currentTimeMillis()));
        newOrder.setTotalAmount(BigDecimal.ZERO);
        return newOrder;
    }

    private void calculateOrderTotals(Order order) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                if (item.getUnitPrice() != null && item.getQuantity() > 0) {
                    totalAmount = totalAmount.add(item.getUnitPrice().multiply(new BigDecimal(item.getQuantity())));
                }
            }
        }
        order.setTotalAmount(totalAmount);
    }



    @Transactional
    public CartDTO updateItemQuantityInCart(Integer userId, Integer orderItemId, int newQuantity) {
        // 1. Xác thực User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 2. Tìm OrderItem dựa trên orderItemId
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem not found with id: " + orderItemId));

        // 3. Kiểm tra xem OrderItem này có thuộc về giỏ hàng (Order PENDING) của user không
        Order pendingOrder = orderRepository.findByUserAndStatus(user, Order.OrderStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("No pending cart found for user: " + userId));

        if (!orderItem.getOrder().getId().equals(pendingOrder.getId())) {
            throw new SecurityException("OrderItem " + orderItemId + " does not belong to the current user's pending cart.");
        }

        // 4. Kiểm tra Product và stock
        Product product = orderItem.getProduct();
        if (product == null) {
            throw new ResourceNotFoundException("Product associated with this cart item no longer exists.");
        }
        if (newQuantity > product.getStockQuantity()) {
            throw new InsufficientStockException("Requested quantity " + newQuantity + " for product " + product.getName() +
                    " exceeds available stock of " + product.getStockQuantity());
        }

        // 5. Cập nhật số lượng
        orderItem.setQuantity(newQuantity);

        // 6. Tính toán lại tổng tiền cho Order
        calculateOrderTotals(pendingOrder);
        orderRepository.save(pendingOrder);

        return new CartDTO(pendingOrder);
    }

    @Transactional
    public CartDTO removeItemFromCart(Integer userId, Integer orderItemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem not found with id: " + orderItemId));

        Order pendingOrder = orderRepository.findByUserAndStatus(user, Order.OrderStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("No pending cart found for user: " + userId));

        if (!orderItem.getOrder().getId().equals(pendingOrder.getId())) {
            throw new SecurityException("OrderItem " + orderItemId + " does not belong to the current user's pending cart.");
        }

        pendingOrder.getOrderItems().remove(orderItem);
        orderItemRepository.delete(orderItem);

        calculateOrderTotals(pendingOrder);
        orderRepository.save(pendingOrder);

        return new CartDTO(pendingOrder);
    }
}