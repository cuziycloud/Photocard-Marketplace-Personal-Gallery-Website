package com.kpop.Clz.dto;

import java.math.BigDecimal;
import java.util.List;

public class CreateOrderRequestDTO {
    private List<CartItemDTO> cartItems;
    private String shippingAddress;
    private String selectedProvince;
    private String phoneNumber;
    private BigDecimal frontendCalculatedShippingFee;

    public CreateOrderRequestDTO() {}

    public CreateOrderRequestDTO(List<CartItemDTO> cartItems, String shippingAddress, String selectedProvince, String phoneNumber, BigDecimal frontendCalculatedShippingFee) {
        this.cartItems = cartItems;
        this.shippingAddress = shippingAddress;
        this.selectedProvince = selectedProvince;
        this.phoneNumber = phoneNumber;
        this.frontendCalculatedShippingFee = frontendCalculatedShippingFee;
    }

    public List<CartItemDTO> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<CartItemDTO> cartItems) {
        this.cartItems = cartItems;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getSelectedProvince() {
        return selectedProvince;
    }

    public void setSelectedProvince(String selectedProvince) {
        this.selectedProvince = selectedProvince;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public BigDecimal getFrontendCalculatedShippingFee() {
        return frontendCalculatedShippingFee;
    }

    public void setFrontendCalculatedShippingFee(BigDecimal frontendCalculatedShippingFee) {
        this.frontendCalculatedShippingFee = frontendCalculatedShippingFee;
    }
}