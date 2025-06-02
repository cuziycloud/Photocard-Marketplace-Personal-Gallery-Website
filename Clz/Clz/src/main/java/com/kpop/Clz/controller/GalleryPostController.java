package com.kpop.Clz.controller;

import com.kpop.Clz.model.GalleryPost;
import com.kpop.Clz.model.User;
import com.kpop.Clz.service.FileStorageService;
import com.kpop.Clz.service.GalleryPostService;
import com.kpop.Clz.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/gallery-posts")
@CrossOrigin(origins = "http://localhost:3000")
public class GalleryPostController {

    private final GalleryPostService galleryPostService;
    private final FileStorageService fileStorageService;
    private final UserService userService;

    @Autowired
    public GalleryPostController(GalleryPostService galleryPostService, FileStorageService fileStorageService, UserService userService) { // Inject UserService
        this.galleryPostService = galleryPostService;
        this.fileStorageService = fileStorageService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<GalleryPost>> getAllGalleryPosts() {
        List<GalleryPost> posts = galleryPostService.getAllGalleryPosts();
        return ResponseEntity.ok(posts);
    }

    // link URL
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GalleryPost> createGalleryPostWithJson(
            @RequestBody GalleryPost postRequest,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found for username: " + username));

        if (postRequest.getImageUrl() == null || postRequest.getImageUrl().trim().isEmpty() ||
                postRequest.getCaption() == null || postRequest.getCaption().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        try {
            GalleryPost createdPost = galleryPostService.createPost(postRequest, currentUser);
            return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("ERROR in service while creating post (JSON): " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // file
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GalleryPost> createGalleryPostWithFormData(
            @RequestParam("caption") String caption,
            @RequestPart("imageFile") MultipartFile imageFile,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found for username: " + username));

        if (imageFile == null || imageFile.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if (caption == null || caption.trim().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        GalleryPost postToCreate = new GalleryPost();
        postToCreate.setCaption(caption);

        String finalImageUrl;
        try {
            System.out.println("Processing imageFile...");
            finalImageUrl = fileStorageService.storeFile(imageFile);
        } catch (Exception e) {
            System.err.println("Error storing file: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (finalImageUrl == null || finalImageUrl.trim().isEmpty()) {
            System.out.println("BAD REQUEST: finalImageUrl is null or empty after storing file.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        postToCreate.setImageUrl(finalImageUrl);

        try {
            GalleryPost createdPost = galleryPostService.createPost(postToCreate, currentUser);
            return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("ERROR in service while creating post (FormData): " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}