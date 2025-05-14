package com.kpop.Clz.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*; // Import các annotation cần thiết

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "group")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", referencedColumnName = "id")
    @JsonBackReference
    private Group group;

    @Column(length = 100)
    private String version;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity;

}