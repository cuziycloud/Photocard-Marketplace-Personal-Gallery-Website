// src/main/java/com/kpop/Clz/repository/ProductRepository.java
package com.kpop.Clz.repository;

import com.kpop.Clz.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; // Import List

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByGroupId(Integer groupId); // tìm sp theo group

}