package com.kpop.Clz.service;

import com.kpop.Clz.dto.UserProfileUpdateRequestDto;
import com.kpop.Clz.model.User;
import com.kpop.Clz.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserByUsernameOrEmail(String identifier) {
        Optional<User> user = userRepository.findByUsername(identifier);
        if (user.isPresent()) {
            return user;
        }
        return userRepository.findByEmail(identifier);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateUserProfile(Integer userId, UserProfileUpdateRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (requestDto.getUsername() != null && !requestDto.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(requestDto.getUsername())) {
                throw new RuntimeException("Username " + requestDto.getUsername() + " is already taken.");
            }
            user.setUsername(requestDto.getUsername());
        }

        if (requestDto.getPhoneNumber() != null) {
            user.setPhoneNumber(requestDto.getPhoneNumber());
        }

        return userRepository.save(user);
    }
}