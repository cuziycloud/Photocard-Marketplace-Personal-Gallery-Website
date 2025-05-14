package com.kpop.Clz.service;

import com.kpop.Clz.exception.ResourceNotFoundException;
import com.kpop.Clz.model.Product;
import com.kpop.Clz.model.User;
import com.kpop.Clz.model.UserWishlistItem;
import com.kpop.Clz.repository.ProductRepository;
import com.kpop.Clz.repository.UserRepository;
import com.kpop.Clz.repository.UserWishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserWishlistService {

    private final UserWishlistRepository userWishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Autowired
    public UserWishlistService(UserWishlistRepository userWishlistRepository,
                               UserRepository userRepository,
                               ProductRepository productRepository) {
        this.userWishlistRepository = userWishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public List<Product> getWishlistedProductsByUserId(Integer userId, boolean sortByDate) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        if (sortByDate) {
            return userWishlistRepository.findWishlistedProductsByUserIdOrderByAddedAtDesc(userId);
        }
        return userWishlistRepository.findWishlistedProductsByUserId(userId);
    }

    @Transactional
    public Product addProductToWishlist(Integer userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (userWishlistRepository.existsByIdUserIdAndIdProductId(userId, productId)) {
            return product;
        }

        UserWishlistItem wishlistItem = new UserWishlistItem(user, product);
        // addedAt được DB tự set
        userWishlistRepository.save(wishlistItem);
        return product;
    }

    @Transactional
    public void removeProductFromWishlist(Integer userId, Long productId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        if (!userWishlistRepository.existsByIdUserIdAndIdProductId(userId, productId)) {
            throw new ResourceNotFoundException("Product " + productId + " not found in wishlist of user " + userId);
        }
        userWishlistRepository.deleteByIdUserIdAndIdProductId(userId, productId);
    }

    public boolean isProductInWishlist(Integer userId, Long productId) {
        if (!userRepository.existsById(userId)) {
            return false;
        }
        if (!productRepository.existsById(productId)) {
            return false;
        }
        return userWishlistRepository.existsByIdUserIdAndIdProductId(userId, productId);
    }
}