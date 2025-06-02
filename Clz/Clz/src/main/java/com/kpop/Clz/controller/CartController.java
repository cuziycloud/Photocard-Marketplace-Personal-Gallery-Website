package com.kpop.Clz.controller;

import com.kpop.Clz.dto.AddItemToCartRequestDTO;
import com.kpop.Clz.dto.CartDTO;
import com.kpop.Clz.dto.UpdateCartItemQuantityRequestDTO;
import com.kpop.Clz.model.User;
import com.kpop.Clz.service.CartService;
import com.kpop.Clz.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{userId}/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    private User getAuthenticatedUser(Integer userIdFromPath, org.springframework.security.core.userdetails.User springSecurityUser) {
        if (springSecurityUser == null) {
            throw new SecurityException("User not authenticated.");
        }
        User applicationUser = userService.getUserByUsernameOrEmail(springSecurityUser.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));

        if (!applicationUser.getId().equals(userIdFromPath)) {
            throw new SecurityException("User ID in path does not match authenticated user.");
        }
        return applicationUser;
    }

    @GetMapping
    public ResponseEntity<CartDTO> getCurrentUserCart(
            @PathVariable Integer userId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User springSecurityUser) {
        try {
            User currentUser = getAuthenticatedUser(userId, springSecurityUser);
            CartDTO cart = cartService.getCartByUserId(currentUser.getId());
            return ResponseEntity.ok(cart);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            // Log lỗi e
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addItemToCart(
            @PathVariable Integer userId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User springSecurityUser,
            @Valid @RequestBody AddItemToCartRequestDTO request) {
        try {
            User currentUser = getAuthenticatedUser(userId, springSecurityUser);
            CartDTO updatedCart = cartService.addItemToCart(currentUser.getId(), request);
            return ResponseEntity.ok(updatedCart);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDTO> updateCartItemQuantity(
            @PathVariable Integer userId,
            @PathVariable Integer  itemId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User springSecurityUser,
            @Valid @RequestBody UpdateCartItemQuantityRequestDTO request) {
        try {
            User currentUser = getAuthenticatedUser(userId, springSecurityUser);
            CartDTO updatedCart = cartService.updateItemQuantityInCart(currentUser.getId(), itemId.intValue(), request.getQuantity());
            return ResponseEntity.ok(updatedCart);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDTO> removeItemFromCart(
            @PathVariable Integer userId,
            @PathVariable Integer itemId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User springSecurityUser) {
        try {
            User currentUser = getAuthenticatedUser(userId, springSecurityUser);
            CartDTO updatedCart = cartService.removeItemFromCart(currentUser.getId(), itemId.intValue());
            return ResponseEntity.ok(updatedCart);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> clearUserCart(
            @PathVariable Integer userId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User springSecurityUser) {
        try {
            User currentUser = getAuthenticatedUser(userId, springSecurityUser);
            cartService.clearCartAfterCheckout(currentUser);
            //cartService.clearActiveCartForUser(currentUser);
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}