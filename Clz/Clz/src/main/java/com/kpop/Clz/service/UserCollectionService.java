package com.kpop.Clz.service;

import com.kpop.Clz.exception.ResourceNotFoundException;
import com.kpop.Clz.model.Product;
import com.kpop.Clz.model.User;
import com.kpop.Clz.model.UserCollection;
import com.kpop.Clz.repository.ProductRepository;
import com.kpop.Clz.repository.UserCollectionRepository;
import com.kpop.Clz.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Date; // Hoặc java.time.LocalDateTime

@Service
public class UserCollectionService {

    private final UserCollectionRepository userCollectionRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Autowired
    public UserCollectionService(UserCollectionRepository userCollectionRepository,
                                 UserRepository userRepository,
                                 ProductRepository productRepository) {
        this.userCollectionRepository = userCollectionRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public List<Product> getCollectedProductsByUserId(Integer userId, boolean sortByDate) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        if (sortByDate) {
            return userCollectionRepository.findCollectedProductsByUserIdOrderByCollectedAtDesc(userId);
        }
        return userCollectionRepository.findCollectedProductsByUserId(userId);
    }

    @Transactional
    public Product addProductToCollection(Integer userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (userCollectionRepository.existsByIdUserIdAndIdProductId(userId, productId)) {
            return product;
        }

        UserCollection userCollection = new UserCollection(user, product);
        userCollectionRepository.save(userCollection);
        return product;
    }

    @Transactional
    public void removeProductFromCollection(Integer userId, Long productId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        if (!userCollectionRepository.existsByIdUserIdAndIdProductId(userId, productId)) {
            throw new ResourceNotFoundException("Product " + productId + " not found in collection of user " + userId);
        }
        userCollectionRepository.deleteByIdUserIdAndIdProductId(userId, productId);
    }

    public boolean isProductInCollection(Integer userId, Long productId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        return userCollectionRepository.existsByIdUserIdAndIdProductId(userId, productId);
    }
}