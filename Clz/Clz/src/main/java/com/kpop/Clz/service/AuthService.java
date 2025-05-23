package com.kpop.Clz.service;

import com.kpop.Clz.dto.AuthResponse;
import com.kpop.Clz.dto.LoginRequest;
import com.kpop.Clz.dto.RegisterRequest;
import com.kpop.Clz.dto.UserDto;
import com.kpop.Clz.exception.ResourceNotFoundException;
import com.kpop.Clz.model.User;
import com.kpop.Clz.repository.UserRepository;
import com.kpop.Clz.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private UserDetailsService userDetailsService; // Cần tạo một implementation cho UserDetailsService

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
        // Cách 1: Sử dụng AuthenticationManager (khuyến nghị nếu đã cấu hình Spring Security đầy đủ)
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

        // Sử dụng email làm subject cho token vì UserDetailsService thường dùng username
        final String token = jwtUtil.generateToken(user.getEmail());
        UserDto userDto = new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
        return new AuthResponse(token, userDto);
    }
}