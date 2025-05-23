package com.kpop.Clz.controller;

import com.kpop.Clz.model.GalleryPost;
import com.kpop.Clz.service.GalleryPostService;
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

import java.util.List;

@RestController
@RequestMapping("/api/gallery-posts")
@CrossOrigin(origins = "http://localhost:3000")
public class GalleryPostController {

    private final GalleryPostService galleryPostService;

    @Autowired
    public GalleryPostController(GalleryPostService galleryPostService) {
        this.galleryPostService = galleryPostService;
    }

    @GetMapping
    public ResponseEntity<List<GalleryPost>> getAllGalleryPosts() {
        List<GalleryPost> posts = galleryPostService.getAllGalleryPosts();
        return ResponseEntity.ok(posts);
    }

    @PostMapping
    public ResponseEntity<GalleryPost> createGalleryPost(@Validated @RequestBody GalleryPost postRequest) {
        GalleryPost createdPost = galleryPostService.createPost(postRequest);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }
}