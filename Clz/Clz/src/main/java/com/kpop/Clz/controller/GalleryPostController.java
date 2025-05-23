package com.kpop.Clz.controller;

import com.kpop.Clz.dto.GalleryPostRequestDto;
import com.kpop.Clz.model.GalleryPost;
import com.kpop.Clz.service.GalleryPostService;
import com.kpop.Clz.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.kpop.Clz.model.User;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/gallery-posts")
@CrossOrigin(origins = "http://localhost:3000")
public class GalleryPostController {

    private final GalleryPostService galleryPostService;
    private final UserService userService;

    @Autowired
    public GalleryPostController(GalleryPostService galleryPostService, UserService userService) {
        this.galleryPostService = galleryPostService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<GalleryPost>> getAllGalleryPosts() {
        List<GalleryPost> posts = galleryPostService.getAllGalleryPosts();
        return ResponseEntity.ok(posts);
    }

    // GalleryPostController.java

    @PostMapping
    public ResponseEntity<GalleryPost> createGalleryPost(
            Authentication authentication,
            @RequestBody GalleryPostRequestDto postRequestDto
    ) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found for username: " + username));

        GalleryPost postDetails = new GalleryPost();
        postDetails.setImageUrl(postRequestDto.getImageUrl());
        postDetails.setCaption(postRequestDto.getCaption());

        GalleryPost createdPost = galleryPostService.createPost(postDetails, currentUser);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }
}