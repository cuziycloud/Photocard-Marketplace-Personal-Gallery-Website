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
    private String phonenumber;
    private String avatarUrl;
    private User.Role role;

    public UserDto(Integer id, String username, String email, String phonenumber, String avatarUrl, User.Role role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phonenumber = phonenumber;
        this.avatarUrl = avatarUrl;
        this.role = role;
    }

    public UserDto(Integer id, String username, String email, User.Role role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public static UserDto fromUser(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAvatarUrl(),
                user.getRole()
        );
    }
}