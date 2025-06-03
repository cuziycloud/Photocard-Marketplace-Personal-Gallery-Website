package com.kpop.Clz.config;

import com.kpop.Clz.service.CustomUserDetailsService;
import com.kpop.Clz.util.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.SignatureException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        System.out.println("JwtRequestFilter: Processing request for URI: " + request.getRequestURI());

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwtToken = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwtToken);
                System.out.println("JwtRequestFilter: Extracted username: " + username + " from token.");
            } catch (IllegalArgumentException e) {
                System.err.println("JwtRequestFilter: Unable to get JWT Token");
            } catch (ExpiredJwtException e) {
                System.err.println("JwtRequestFilter: JWT Token has expired");
            } catch (MalformedJwtException e) {
                System.err.println("JwtRequestFilter: Invalid JWT token.");
            }
        } else {
            System.out.println("JwtRequestFilter: JWT Token does not begin with Bearer String for URI: " + request.getRequestURI());
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.customUserDetailsService.loadUserByUsername(username);
            System.out.println("JwtRequestFilter: Loaded UserDetails for: " + userDetails.getUsername());

            if (jwtUtil.validateToken(jwtToken, userDetails)) {
                System.out.println("JwtRequestFilter: JWT Token is valid.");
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                System.out.println("JwtRequestFilter: Authentication set in SecurityContext for user: " + username);
            } else {
                System.err.println("JwtRequestFilter: JWT Token validation failed for user: " + username);
            }
        } else {
            if (username == null) System.out.println("JwtRequestFilter: Username is null (or already authenticated and context has auth).");
            // else if (SecurityContextHolder.getContext().getAuthentication() != null) System.out.println("JwtRequestFilter: Authentication already set in context.");
        }
        chain.doFilter(request, response);
    }
}