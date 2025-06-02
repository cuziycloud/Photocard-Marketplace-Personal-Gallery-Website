package com.kpop.Clz.dto;

import com.kpop.Clz.model.Order;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {
    private Integer id;
    private LocalDateTime orderDate;
    private BigDecimal subTotalProducts;
    private BigDecimal shippingFee;
    private BigDecimal grandTotal;
    private Order.OrderStatus status;
    private String shippingAddress;
    private String phoneNumber;
    private List<OrderItemDTO> items;
    private String orderCode;

    public OrderDTO() {}

    public OrderDTO(Integer id,
                    LocalDateTime orderDate,
                    String orderCode,
                    BigDecimal subTotalProducts,
                    BigDecimal shippingFee,
                    BigDecimal grandTotal,
                    Order.OrderStatus status,
                    String shippingAddress,
                    String phoneNumber,
                    List<OrderItemDTO> items) {
        this.id = id;
        this.orderDate = orderDate;
        this.orderCode = orderCode;
        this.subTotalProducts = subTotalProducts;
        this.shippingFee = shippingFee;
        this.grandTotal = grandTotal;
        this.status = status;
        this.shippingAddress = shippingAddress;
        this.phoneNumber = phoneNumber;
        this.items = items;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public BigDecimal getSubTotalProducts() { return subTotalProducts; }
    public void setSubTotalProducts(BigDecimal subTotalProducts) { this.subTotalProducts = subTotalProducts; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }
    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }
    public Order.OrderStatus getStatus() { return status; }
    public void setStatus(Order.OrderStatus status) { this.status = status; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }
    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
}