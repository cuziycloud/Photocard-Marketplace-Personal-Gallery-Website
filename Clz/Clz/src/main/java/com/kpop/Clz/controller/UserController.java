package com.kpop.Clz.controller;

import com.kpop.Clz.dto.UserDto;
import com.kpop.Clz.model.User;
import com.kpop.Clz.service.UserService;
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
}