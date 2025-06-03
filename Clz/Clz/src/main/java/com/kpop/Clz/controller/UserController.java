package com.kpop.Clz.controller;

import com.kpop.Clz.dto.UserDto;
import com.kpop.Clz.model.User;
import com.kpop.Clz.service.UserService;
import com.kpop.Clz.dto.UserProfileUpdateRequestDto;
import com.kpop.Clz.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            logger.warn("/me endpoint called without proper authentication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        String userIdentifier;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            userIdentifier = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            userIdentifier = (String) principal;
        } else {
            logger.error("/me endpoint: Could not determine user identifier from principal of type {}", principal.getClass().getName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Could not determine user identifier"));
        }

        logger.info("/me endpoint: Fetching details for user identifier: {}", userIdentifier);
        Optional<User> userOptional = userService.findByEmail(userIdentifier);

        if (userOptional.isPresent()) {
            UserDto userDto = UserDto.fromUser(userOptional.get());
            logger.info("/me endpoint: Returning user details for: {}", userIdentifier);
            return ResponseEntity.ok(userDto);
        } else {
            logger.warn("/me endpoint: User details not found for identifier: {}", userIdentifier);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User details not found"));
        }
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Integer userId,
            @RequestBody UserProfileUpdateRequestDto requestDto,
            Authentication authentication) {

        logger.info("--- UserController.updateUserProfile ---");
        logger.info("Received request for userId: {}", userId);
        logger.info("DTO from request body - Username: '{}'", requestDto.getUsername());
        logger.info("DTO from request body - PhoneNumber: '{}'", requestDto.getPhonenumber());

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        Object principal = authentication.getPrincipal();
        String currentUsername;

        if (principal instanceof UserDetails) {
            currentUsername = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            currentUsername = (String) principal;
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Could not determine user identifier"));
        }

        Optional<User> currentUserOptional = userService.findByEmail(currentUsername);
        if (currentUserOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authenticated user not found in database."));
        }

        User authenticatedUser = currentUserOptional.get();

        if (!authenticatedUser.getId().equals(userId)) {
            logger.warn("User {} (ID: {}) attempted to update profile of user ID {} without permission.",
                    authenticatedUser.getEmail(), authenticatedUser.getId(), userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You do not have permission to update this profile."));
        }

        try {
            User updatedUser = userService.updateUserProfile(userId, requestDto);
            UserDto updatedUserDto = UserDto.fromUser(updatedUser);
            logger.info("Profile updated successfully for user ID: {}", userId);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully.", "user", updatedUserDto));
        } catch (ResourceNotFoundException e) {
            logger.warn("Attempted to update profile for non-existent user ID {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) { // Ví dụ: username đã tồn tại
            logger.warn("Invalid data for profile update for user ID {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error updating profile for user ID {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred while updating profile."));
        }
    }
}