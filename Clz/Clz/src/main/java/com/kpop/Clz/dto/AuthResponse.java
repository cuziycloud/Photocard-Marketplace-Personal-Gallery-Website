package com.kpop.Clz.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private String token;
    private UserDto user;

    public AuthResponse(String token, UserDto user) {
        this.token = token;
        this.user = user;
    }
}