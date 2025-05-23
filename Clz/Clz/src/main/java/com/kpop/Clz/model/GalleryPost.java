package com.kpop.Clz.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.sql.Timestamp;

@Entity
@Table(name = "gallery_posts")
@Getter
@Setter
@NoArgsConstructor
public class GalleryPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String caption;

    @Column(name = "likes_count")
    private Integer likesCount = 0;

    @Column(name = "comments_count")
    private Integer commentsCount = 0;

    @Column(name = "posted_by_username", nullable = false, length = 100)
    private String postedByUsername;

    @Column(name = "posted_by_avatar_url", length = 500)
    private String postedByAvatarUrl;

    @Column(name = "posted_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp postedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp updatedAt;

    public static class UserInfo {
        private String username;
        private String avatarUrl;
        public UserInfo(String username, String avatarUrl) { this.username = username; this.avatarUrl = avatarUrl; }
        public String getUsername() { return username; }
        public String getAvatarUrl() { return avatarUrl; }
    }

    @Transient
    public UserInfo getUser() {
        return new UserInfo(this.postedByUsername, this.postedByAvatarUrl);
    }

    @Transient
    public Integer getLikes() {
        return this.likesCount;
    }

    @Transient
    public Integer getComments() {
        return this.commentsCount;
    }

    @Transient
    public String getTimestamp() {
        if (this.postedAt != null) {
            long millis = System.currentTimeMillis() - this.postedAt.getTime();
            long seconds = millis / 1000;
            long minutes = seconds / 60;
            long hours = minutes / 60;
            long days = hours / 24;

            if (days > 0) return days + (days == 1 ? " day ago" : " days ago");
            if (hours > 0) return hours + (hours == 1 ? " hour ago" : " hours ago");
            if (minutes > 0) return minutes + (minutes == 1 ? " minute ago" : " minutes ago");
            if (seconds <= 1) return "just now";
            return seconds + " seconds ago";
        }
        return "A moment ago";
    }
}