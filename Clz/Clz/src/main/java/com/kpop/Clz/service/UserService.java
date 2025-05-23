package com.kpop.Clz.service;

import com.kpop.Clz.model.User;
import com.kpop.Clz.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> findByUsername(String email) {
        return userRepository.findByEmail(email);
    }
}