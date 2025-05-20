package com.kpop.Clz.dto;

import com.kpop.Clz.model.OrderItem;
import com.kpop.Clz.model.Product;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class CartItemDTO {
    private Integer orderItemId;
    private Long productId;
    private String productName;
    private String imageUrl;
    private BigDecimal unitPrice;
    private int quantity;
    private int stockQuantity;

    public CartItemDTO(OrderItem orderItem) {
        this.orderItemId = orderItem.getId();
        Product product = orderItem.getProduct();
        if (product != null) {
            this.productId = product.getId();
            this.productName = product.getName();
            this.imageUrl = product.getImageUrl();
            this.stockQuantity = product.getStockQuantity();
        } else {
            this.productName = "Sản phẩm không còn tồn tại";
            this.stockQuantity = 0;
        }
        this.unitPrice = orderItem.getUnitPrice();
        this.quantity = orderItem.getQuantity();
    }
}