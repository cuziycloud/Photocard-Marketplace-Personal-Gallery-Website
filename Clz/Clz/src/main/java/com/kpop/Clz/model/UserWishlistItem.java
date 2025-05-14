package com.kpop.Clz.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Date;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "user_wishlist")
@Getter
@Setter
@NoArgsConstructor
public class UserWishlistItem {

    @EmbeddedId
    private UserWishlistItemId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id", referencedColumnName = "id")
    private Product product;

    @CreationTimestamp 
    @Column(name = "added_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date addedAt;

    public UserWishlistItem(User user, Product product) {
        this.id = new UserWishlistItemId(user.getId(), product.getId());
        this.user = user;
        this.product = product;
    }
}