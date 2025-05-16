package com.kpop.Clz.service;

import com.kpop.Clz.model.GalleryPost;
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
    public GalleryPost createPost(GalleryPost postDataFromRequest) {
        GalleryPost newPost = new GalleryPost();
        newPost.setImageUrl(postDataFromRequest.getImageUrl());
        newPost.setCaption(postDataFromRequest.getCaption());
        newPost.setPostedByUsername(postDataFromRequest.getPostedByUsername() != null ? postDataFromRequest.getPostedByUsername() : "Demo User");
        newPost.setPostedByAvatarUrl(postDataFromRequest.getPostedByAvatarUrl() != null ? postDataFromRequest.getPostedByAvatarUrl() : "https://i.pinimg.com/736x/fa/fa/06/fafa063bab258267192f667bb81c3040.jpg");

        newPost.setLikesCount(0);
        newPost.setCommentsCount(0);
        newPost.setPostedAt(new Timestamp(System.currentTimeMillis()));

        return galleryPostRepository.save(newPost);
    }
}