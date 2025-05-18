package com.kpop.Clz.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Entity
@Table(name = "user_collections")
@Getter
@Setter
@NoArgsConstructor
public class UserCollection {

    @EmbeddedId
    private UserCollectionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id", referencedColumnName = "id")
    private Product product;

    @CreationTimestamp
    @Column(name = "collected_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date collectedAt;

    public UserCollection(User user, Product product) {
        this.id = new UserCollectionId(user.getId(), product.getId());
        this.user = user;
        this.product = product;
    }
}