package com.kpop.Clz.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String username;
    private String email;
    private Integer phoneNumber;
    private String password;
    private String avatarUrl;
}