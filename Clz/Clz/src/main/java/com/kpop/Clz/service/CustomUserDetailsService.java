package com.kpop.Clz.service;

import com.kpop.Clz.model.User;
import com.kpop.Clz.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        if (user.getRole() == null) {
            System.err.println("Warning: User " + email + " has a NULL role. Assigning no authorities.");
            return new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPasswordHash(),
                    new ArrayList<>()
            );
        }

        String roleNameForAuthority = "ROLE_" + user.getRole().name().toUpperCase();
        GrantedAuthority authority = new SimpleGrantedAuthority(roleNameForAuthority);

        List<GrantedAuthority> authorities = Collections.singletonList(authority);

        System.out.println("CustomUserDetailsService: Loading user " + user.getEmail() + " with authorities: " + authorities);

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                authorities
        );
    }
}