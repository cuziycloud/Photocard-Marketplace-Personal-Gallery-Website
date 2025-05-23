package com.kpop.Clz.repository;

import com.kpop.Clz.model.Product;
import com.kpop.Clz.model.UserWishlistItem;
import com.kpop.Clz.model.UserWishlistItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserWishlistRepository extends JpaRepository<UserWishlistItem, UserWishlistItemId> {

    // Lấy danh sách Product trong wishlist của một user, sắp xếp theo ngày thêm mới nhất
    @Query("SELECT uw.product FROM UserWishlistItem uw WHERE uw.user.id = :userId ORDER BY uw.addedAt DESC")
    List<Product> findWishlistedProductsByUserIdOrderByAddedAtDesc(@Param("userId") Integer userId);

    // Lấy danh sách Product trong wishlist của một user (không sắp xếp hoặc sắp xếp mặc định)
    @Query("SELECT uw.product FROM UserWishlistItem uw WHERE uw.user.id = :userId")
    List<Product> findWishlistedProductsByUserId(@Param("userId") Integer userId);

    // Kiểm tra xem một sản phẩm đã có trong wishlist của user chưa
    boolean existsByIdUserIdAndIdProductId(Integer userId, Long productId);

    // Tìm một mục wishlist cụ thể
    Optional<UserWishlistItem> findByIdUserIdAndIdProductId(Integer userId, Long productId);

    // Xóa một sản phẩm khỏi wishlist của user
    @Transactional
    void deleteByIdUserIdAndIdProductId(Integer userId, Long productId);


    @Query("SELECT uc.product FROM UserCollection uc WHERE uc.id.userId = :userId")
    List<Product> findCollectedProductsByUserId(@Param("userId") Integer userId);

    @Query("SELECT uc.product FROM UserCollection uc WHERE uc.id.userId = :userId ORDER BY uc.collectedAt Desc")
    List<Product> findCollectedProductsByUserIdOrderByCollectedAtDesc(@Param("userId") Integer userId);


    @Query("SELECT uc.id.productId FROM UserCollection uc WHERE uc.id.userId = :userId AND uc.id.productId IN :productIds")
    Set<Long> findExistingProductIdsByUserIdAndProductIdsIn(
            @Param("userId") Integer userId,
            @Param("productIds") List<Long> productIds
    );
}