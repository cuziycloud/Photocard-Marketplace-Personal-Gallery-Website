package com.kpop.Clz.dto;

import com.kpop.Clz.model.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {
    private Integer id;
    private String username;
    private String email;
    private User.Role role;

    public UserDto(Integer id, String username, String email, User.Role role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }
}