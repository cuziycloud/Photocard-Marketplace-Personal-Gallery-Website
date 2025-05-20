package com.kpop.Clz.dto;

import com.kpop.Clz.model.Order;
import com.kpop.Clz.model.OrderItem;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
public class CartDTO {
    private Integer orderId;
    private Integer userId;
    private List<CartItemDTO> items;
    private int totalQuantity;
    private BigDecimal totalAmount;
    private String status;

    public CartDTO(Order order) {
        if (order == null) {
            this.items = new ArrayList<>();
            this.totalQuantity = 0;
            this.totalAmount = BigDecimal.ZERO;
            this.status = Order.OrderStatus.PENDING.name();
            return;
        }
        this.orderId = order.getId();
        if (order.getUser() != null) {
            this.userId = order.getUser().getId();
        }
        this.items = (order.getOrderItems() != null)
                ? order.getOrderItems().stream()
                .map(CartItemDTO::new)
                .collect(Collectors.toList())
                : new ArrayList<>();

        this.totalQuantity = (order.getOrderItems() != null)
                ? order.getOrderItems().stream().mapToInt(OrderItem::getQuantity).sum()
                : 0;
        this.totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
        this.status = order.getStatus() != null ? order.getStatus().name() : Order.OrderStatus.PENDING.name();
    }

    public CartDTO(Integer userId) {
        this.userId = userId;
        this.items = new ArrayList<>();
        this.totalQuantity = 0;
        this.totalAmount = BigDecimal.ZERO;
        this.status = Order.OrderStatus.PENDING.name();
    }
}