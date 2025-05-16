package com.kpop.Clz.repository;

import com.kpop.Clz.model.GalleryPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GalleryPostRepository extends JpaRepository<GalleryPost, Integer> {
    List<GalleryPost> findAllByOrderByPostedAtDesc();
}