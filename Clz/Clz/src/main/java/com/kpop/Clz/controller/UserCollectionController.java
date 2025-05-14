package com.kpop.Clz.controller;

import com.kpop.Clz.model.Product;
import com.kpop.Clz.service.UserCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/{userId}/collections")
@CrossOrigin(origins = "http://localhost:3000")
public class UserCollectionController {

    private final UserCollectionService userCollectionService;

    @Autowired
    public UserCollectionController(UserCollectionService userCollectionService) {
        this.userCollectionService = userCollectionService;
    }

    // GET http://localhost:8080/api/users/{userId}/collections
    // GET http://localhost:8080/api/users/{userId}/collections?sortBy=date_added_desc
    @GetMapping
    public ResponseEntity<List<Product>> getCollectedProducts(
            @PathVariable Integer userId,
            @RequestParam(required = false) String sortBy) {
        boolean sortByDate = "date_added_desc".equalsIgnoreCase(sortBy);
        List<Product> collectedProducts = userCollectionService.getCollectedProductsByUserId(userId, sortByDate);
        return ResponseEntity.ok(collectedProducts);
    }

    // POST http://localhost:8080/api/users/{userId}/collections/{productId}
    @PostMapping("/{productId}")
    public ResponseEntity<Product> addProductToCollection(
            @PathVariable Integer userId,
            @PathVariable Long productId) {
        Product addedProduct = userCollectionService.addProductToCollection(userId, productId);
        return new ResponseEntity<>(addedProduct, HttpStatus.CREATED);
    }

    // DELETE http://localhost:8080/api/users/{userId}/collections/{productId}
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeProductFromCollection(
            @PathVariable Integer userId,
            @PathVariable Long productId) {
        userCollectionService.removeProductFromCollection(userId, productId);
        return ResponseEntity.noContent().build();
    }

    // GET http://localhost:8080/api/users/{userId}/collections/check/{productId}
    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkProductInCollection(
            @PathVariable Integer userId,
            @PathVariable Long productId) {
        boolean isInCollection = userCollectionService.isProductInCollection(userId, productId);
        return ResponseEntity.ok(Map.of("isInCollection", isInCollection));
    }
}