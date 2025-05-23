package com.kpop.Clz.controller;

import com.kpop.Clz.model.Product;
import com.kpop.Clz.service.UserWishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kpop.Clz.dto.ProductIdsRequest;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/{userId}/wishlist")
public class UserWishlistController {

    private final UserWishlistService userWishlistService;

    @Autowired
    public UserWishlistController(UserWishlistService userWishlistService) {
        this.userWishlistService = userWishlistService;
    }

    // GET http://localhost:8080/api/users/{userId}/wishlist
    // GET http://localhost:8080/api/users/{userId}/wishlist?sortBy=date_added_desc
    @GetMapping
    public ResponseEntity<List<Product>> getWishlistedProducts(
            @PathVariable Integer userId,
            @RequestParam(required = false) String sortBy) {
        boolean sortByDate = "date_added_desc".equalsIgnoreCase(sortBy);
        List<Product> wishlistedProducts = userWishlistService.getWishlistedProductsByUserId(userId, sortByDate);
        return ResponseEntity.ok(wishlistedProducts);
    }

    // POST http://localhost:8080/api/users/{userId}/wishlist/{productId}
    @PostMapping("/{productId}")
    public ResponseEntity<Product> addProductToWishlist(
            @PathVariable Integer userId,
            @PathVariable Long productId) {
        Product addedProduct = userWishlistService.addProductToWishlist(userId, productId);
        return new ResponseEntity<>(addedProduct, HttpStatus.CREATED);
    }

    // DELETE http://localhost:8080/api/users/{userId}/wishlist/{productId}
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeProductFromWishlist(
            @PathVariable Integer userId,
            @PathVariable Long productId) {
        userWishlistService.removeProductFromWishlist(userId, productId);
        return ResponseEntity.noContent().build();
    }

    // GET http://localhost:8080/api/users/{userId}/wishlist/check/{productId}
    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkProductInWishlist(
            @PathVariable Integer userId,
            @PathVariable Long productId) {
        boolean isInWishlist = userWishlistService.isProductInWishlist(userId, productId);
        return ResponseEntity.ok(Map.of("isInWishlist", isInWishlist));
    }

    @PostMapping("/check-multiple")
    public ResponseEntity<Map<String, Boolean>> checkMultipleProductsInWishlist(
            @PathVariable Integer userId,
            @Valid @RequestBody ProductIdsRequest request) {

        Map<String, Boolean> result = userWishlistService.checkMultipleProductsInWishlist(userId, request.getProductIds());
        return ResponseEntity.ok(result);
    }
}