package com.kpop.Clz.controller;

import com.kpop.Clz.dto.AuthResponse;
import com.kpop.Clz.dto.LoginRequest;
import com.kpop.Clz.dto.RegisterRequest;
import com.kpop.Clz.model.User;

import com.kpop.Clz.dto.ForgotPasswordRequest;
import com.kpop.Clz.dto.ResetPasswordRequest;
import com.kpop.Clz.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam(name = "avatar", required = false) MultipartFile avatarFile) { // Key "avatar" matches frontend FormData

        try {
            User registeredUser = authService.registerUser(username, email, password, phoneNumber, avatarFile);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "User registered successfully",
                            "userId", registeredUser.getId()));
        } catch (IllegalArgumentException e) {
            // This exception should ideally be thrown by your authService for specific validation errors
            // (e.g., username/email already exists, password too weak - if you implement that)
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IOException e) { // Specifically catch IOException for file storage issues
            // Log this error server-side
            System.err.println("File storage error during registration: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error storing avatar file. Please try again."));
        }
        catch (Exception e) {
            // Log this error server-side
            System.err.println("Unexpected error during registration: " + e.getMessage());
            e.printStackTrace(); // For more details during development
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred during registration."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse authResponse = authService.loginUser(loginRequest);
            return ResponseEntity.ok(authResponse);
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password."));
        } catch (com.kpop.Clz.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred during login."));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        try {
            authService.requestPasswordReset(forgotPasswordRequest.getEmail());
            return ResponseEntity.ok("Nếu tài khoản với email này tồn tại, một liên kết đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư đến (và thư mục spam).");
        } catch (Exception e) {
            logger.error("Lỗi trong quá trình yêu cầu quên mật khẩu cho email {}: {}", forgotPasswordRequest.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        boolean success = authService.resetPassword(
                resetPasswordRequest.getToken(),
                resetPasswordRequest.getNewPassword()
        );

        if (success) {
            return ResponseEntity.ok("Mật khẩu đã được đặt lại thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.");
        } else {
            return ResponseEntity.badRequest().body("Token không hợp lệ, đã hết hạn hoặc việc đặt lại mật khẩu thất bại. Vui lòng yêu cầu một liên kết đặt lại mới.");
        }
    }

}