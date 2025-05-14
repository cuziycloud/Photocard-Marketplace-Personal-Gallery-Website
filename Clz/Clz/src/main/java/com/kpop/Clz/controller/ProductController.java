package com.kpop.Clz.controller;

import com.kpop.Clz.model.Product;
import com.kpop.Clz.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // GET http://localhost:8080/api/products
    // GET http://localhost:8080/api/products?groupId={id}
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(@RequestParam(required = false) Integer groupId) {
        List<Product> products;
        if (groupId != null) {
            products = productService.getProductsByGroupId(groupId);
        } else {
            products = productService.getAllProducts();
        }
        return ResponseEntity.ok(products);
    }

    // ... các phương thức khác giữ nguyên ...
    // GET http://localhost:8080/api/products/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> productOptional = productService.getProductById(id);
        return productOptional.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST http://localhost:8080/api/products
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.saveProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    // PUT http://localhost:8080/api/products/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Optional<Product> productOptional = productService.getProductById(id);
        if (productOptional.isPresent()) {
            Product existingProduct = productOptional.get();
            existingProduct.setName(productDetails.getName());
            existingProduct.setGroup(productDetails.getGroup());
            existingProduct.setVersion(productDetails.getVersion());
            existingProduct.setDescription(productDetails.getDescription());
            existingProduct.setPrice(productDetails.getPrice());
            existingProduct.setImageUrl(productDetails.getImageUrl());
            existingProduct.setStockQuantity(productDetails.getStockQuantity());

            Product updatedProduct = productService.saveProduct(existingProduct);
            return ResponseEntity.ok(updatedProduct);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE http://localhost:8080/api/products/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (productService.getProductById(id).isPresent()) {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}