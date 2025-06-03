package com.kpop.Clz.service;

import com.kpop.Clz.dto.UserProfileUpdateRequestDto;
import com.kpop.Clz.model.User;
import com.kpop.Clz.repository.UserRepository;
import com.kpop.Clz.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (requestDto.getUsername() != null && !requestDto.getUsername().trim().isEmpty() && !requestDto.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsernameAndIdNot(requestDto.getUsername(), userId)) {
                throw new IllegalArgumentException("Username '" + requestDto.getUsername() + "' is already taken.");
            }
            user.setUsername(requestDto.getUsername().trim());
        }
        if (requestDto.getPhonenumber() != null) {
            if (requestDto.getPhonenumber().trim().isEmpty()) {
                user.setPhoneNumber(null);
            } else {
                user.setPhoneNumber(requestDto.getPhonenumber().trim());
            }
        }

        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
}