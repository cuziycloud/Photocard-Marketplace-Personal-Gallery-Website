package com.kpop.Clz.controller;

import com.kpop.Clz.model.GalleryPost;
import com.kpop.Clz.service.FileStorageService;
import com.kpop.Clz.service.GalleryPostService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/gallery-posts")
@CrossOrigin(origins = "http://localhost:3000")
public class GalleryPostController {

    private final GalleryPostService galleryPostService;
    private final FileStorageService fileStorageService;

    @Autowired
    public GalleryPostController(GalleryPostService galleryPostService, FileStorageService fileStorageService) {
        this.galleryPostService = galleryPostService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public ResponseEntity<List<GalleryPost>> getAllGalleryPosts() {
        List<GalleryPost> posts = galleryPostService.getAllGalleryPosts();
        return ResponseEntity.ok(posts);
    }

    //linkurl
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GalleryPost> createGalleryPostWithJson(@RequestBody GalleryPost postRequest) {
        if (postRequest.getImageUrl() == null || postRequest.getImageUrl().trim().isEmpty() ||
                postRequest.getCaption() == null || postRequest.getCaption().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        try {
            GalleryPost createdPost = galleryPostService.createPost(postRequest);
            return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("ERROR in service while creating post (JSON): " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //upload file
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GalleryPost> createGalleryPostWithFormData(
            @RequestParam("caption") String caption,
            @RequestPart("imageFile") MultipartFile imageFile,
            HttpServletRequest request
    ) {
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        postToCreate.setImageUrl(finalImageUrl);

        try {
            GalleryPost createdPost = galleryPostService.createPost(postToCreate);
            return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("ERROR in service while creating post (FormData): " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}