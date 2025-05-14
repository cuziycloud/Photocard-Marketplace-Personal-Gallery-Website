// src/main/java/com/kpop/Clz/service/ProductService.java
package com.kpop.Clz.service;

import com.kpop.Clz.model.Product;
import com.kpop.Clz.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Lấy sản phẩm theo group ID
    public List<Product> getProductsByGroupId(Integer groupId) {
        return productRepository.findByGroupId(groupId);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}