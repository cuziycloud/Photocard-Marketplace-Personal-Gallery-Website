package com.kpop.Clz.dto;

import jakarta.validation.constraints.Min;

public class UpdateCartItemQuantityRequestDTO {
    @Min(value = 1, message = "New quantity must be at least 1. To remove, use delete endpoint.")
    private int quantity;

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}