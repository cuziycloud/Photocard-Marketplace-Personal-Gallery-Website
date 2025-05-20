package com.kpop.Clz.controller;

import com.kpop.Clz.dto.AddToCartRequest;
import com.kpop.Clz.dto.CartDTO;
import com.kpop.Clz.dto.UpdateCartItemQuantityRequest;
import com.kpop.Clz.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{userId}")
@RequiredArgsConstructor
@Validated
public class UserCartController {

    private final CartService cartService;

    @GetMapping("/cart")
    public ResponseEntity<CartDTO> getUserCart(@PathVariable Integer userId) {
        CartDTO cart = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/cart/items")
    public ResponseEntity<CartDTO> addItemToUserCart(
            @PathVariable Integer userId,
            @Valid @RequestBody AddToCartRequest request
    ) {
        CartDTO updatedCart = cartService.addItemToCart(userId, request);
        return ResponseEntity.ok(updatedCart);
    }

    @PutMapping("/cart/items/{orderItemId}")
    public ResponseEntity<CartDTO> updateCartItemQuantity(
            @PathVariable Integer userId,
            @PathVariable Integer orderItemId,
            @Valid @RequestBody UpdateCartItemQuantityRequest request
    ) {
        CartDTO updatedCart = cartService.updateItemQuantityInCart(userId, orderItemId, request.getQuantity());
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/cart/items/{orderItemId}")
    public ResponseEntity<CartDTO> removeItemFromUserCart(
            @PathVariable Integer userId,
            @PathVariable Integer orderItemId
    ) {
        CartDTO updatedCart = cartService.removeItemFromCart(userId, orderItemId);
        return ResponseEntity.ok(updatedCart);
    }
}