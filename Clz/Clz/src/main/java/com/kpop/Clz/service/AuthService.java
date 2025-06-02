package com.kpop.Clz.service;

import com.kpop.Clz.controller.AuthController;
import com.kpop.Clz.dto.AuthResponse;
import com.kpop.Clz.dto.LoginRequest;
import com.kpop.Clz.dto.RegisterRequest;
import com.kpop.Clz.dto.UserDto;
import com.kpop.Clz.exception.ResourceNotFoundException;
import com.kpop.Clz.model.User;
import com.kpop.Clz.repository.UserRepository;
import com.kpop.Clz.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired(required = false)
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private EmailService emailService;

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;


    public void requestPasswordReset(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1)); // Token hết hạn sau 1h
            userRepository.save(user);

            String resetUrl = frontendBaseUrl + "/reset-password-confirm?token=" + token;
            String emailSubject = "K-Clz: Yêu cầu đặt lại mật khẩu";

            try {
                emailService.sendPasswordResetEmail(user.getEmail(), emailSubject, user.getUsername(), resetUrl);
                logger.info("Yêu cầu đặt lại mật khẩu cho email {}, token đã được gửi.", email);
            } catch (Exception e) {
                logger.error("Không thể gửi email đặt lại mật khẩu cho {}: {}", email, e.getMessage());
            }
        } else {
            logger.warn("Yêu cầu đặt lại mật khẩu cho email không tồn tại: {}", email);
        }
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<User> userOptional = userRepository.findByResetToken(token);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // check token
            if (user.getResetTokenExpiry() != null && user.getResetTokenExpiry().isAfter(LocalDateTime.now())) {
                user.setPasswordHash(passwordEncoder.encode(newPassword));
                user.setResetToken(null); // Xóa token sau khi sd
                user.setResetTokenExpiry(null);
                userRepository.save(user);
                logger.info("Mật khẩu đã được đặt lại thành công cho người dùng: {}", user.getUsername());
                return true;
            } else {
                logger.warn("Nỗ lực đặt lại mật khẩu với token đã hết hạn hoặc không hợp lệ cho người dùng: {}", user.getUsername());
                user.setResetToken(null);
                user.setResetTokenExpiry(null);
                userRepository.save(user);
                return false;
            }
        }
        logger.warn("Nỗ lực đặt lại mật khẩu với token không tìm thấy: {}", token);
        return false;
    }

    @Transactional
    public User registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new IllegalArgumentException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(User.Role.customer);

        return userRepository.save(user);
    }

    public AuthResponse loginUser(LoginRequest loginRequest) {
        // Cách 1: Sd AuthenticationManager (nếu đã cấu hình Spring Security)
        // try {
        //     authenticationManager.authenticate(
        //             new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        //     );
        // } catch (BadCredentialsException e) {
        //     throw new BadCredentialsException("INVALID_CREDENTIALS", e);
        // } catch (AuthenticationException e) {
        //      throw new RuntimeException("Authentication failed: " + e.getMessage(), e);
        // }
        //
        // final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());
        // final String token = jwtUtil.generateToken(userDetails);
        // User user = userRepository.findByEmail(loginRequest.getEmail())
        //        .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + loginRequest.getEmail()));
        // UserDto userDto = new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
        // return new AuthResponse(token, userDto);

        // Cách 2: Tự kiểm tra (đơn giản hơn nếu chưa cấu hình AuthenticationManager hoàn chỉnh)
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + loginRequest.getEmail()));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        final String token = jwtUtil.generateToken(user.getEmail());
        UserDto userDto = new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
        return new AuthResponse(token, userDto);
    }
}