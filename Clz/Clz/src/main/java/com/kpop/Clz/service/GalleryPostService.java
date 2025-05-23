package com.kpop.Clz.service;

import com.kpop.Clz.model.GalleryPost;
import com.kpop.Clz.model.User;
import com.kpop.Clz.repository.GalleryPostRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class GalleryPostService {

    private final GalleryPostRepository galleryPostRepository;

    @Autowired
    public GalleryPostService(GalleryPostRepository galleryPostRepository) {
        this.galleryPostRepository = galleryPostRepository;
    }

    public List<GalleryPost> getAllGalleryPosts() {
        return galleryPostRepository.findAllByOrderByPostedAtDesc();
    }

    @Transactional
    public GalleryPost createPost(GalleryPost postDataFromRequest, User authenticatedUser) {
        GalleryPost newPost = new GalleryPost();
        newPost.setImageUrl(postDataFromRequest.getImageUrl());
        newPost.setCaption(postDataFromRequest.getCaption());
        newPost.setUserId(authenticatedUser.getId());
        newPost.setPostedByUsername(postDataFromRequest.getPostedByUsername() != null ? postDataFromRequest.getPostedByUsername() : "Duchin");
        newPost.setPostedByAvatarUrl(postDataFromRequest.getPostedByAvatarUrl() != null ? postDataFromRequest.getPostedByAvatarUrl() : "https://i.pinimg.com/736x/24/eb/1f/24eb1f32e2286d3251a2634adcf60592.jpg");

        newPost.setLikesCount(0);
        newPost.setCommentsCount(0);
        newPost.setPostedAt(new Timestamp(System.currentTimeMillis()));

        return galleryPostRepository.save(newPost);
    }
}