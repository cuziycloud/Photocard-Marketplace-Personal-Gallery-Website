    package com.kpop.Clz.repository;

    import com.kpop.Clz.model.Product;
    import com.kpop.Clz.model.UserCollection;
    import com.kpop.Clz.model.UserCollectionId;
    import org.springframework.data.jpa.repository.JpaRepository;
    import org.springframework.data.jpa.repository.Query;
    import org.springframework.data.repository.query.Param;
    import org.springframework.stereotype.Repository;
    import org.springframework.transaction.annotation.Transactional;

    import java.util.List;
    import java.util.Optional;
    import java.util.Set;

    @Repository
    public interface UserCollectionRepository extends JpaRepository<UserCollection, UserCollectionId> {

        // Lấy tất cả các mục UserCollection của một user
        List<UserCollection> findByIdUserId(Integer userId);

        // Lấy danh sách Product đã được sưu tầm bởi một user, sắp xếp theo ngày thêm mới nhất
        @Query("SELECT uc.product FROM UserCollection uc WHERE uc.user.id = :userId ORDER BY uc.collectedAt DESC")
        List<Product> findCollectedProductsByUserIdOrderByCollectedAtDesc(@Param("userId") Integer userId);

        // Lấy danh sách Product đã được sưu tầm bởi một user (không sắp xếp hoặc sắp xếp mặc định)
        @Query("SELECT uc.product FROM UserCollection uc WHERE uc.user.id = :userId")
        List<Product> findCollectedProductsByUserId(@Param("userId") Integer userId);

        // Kiểm tra xem một sản phẩm đã có trong bộ sưu tập của user chưa
        boolean existsByIdUserIdAndIdProductId(Integer userId, Long productId);

        // Tìm một mục collection cụ thể
        Optional<UserCollection> findByIdUserIdAndIdProductId(Integer userId, Long productId);

        // Xóa một sản phẩm khỏi bộ sưu tập của user
        @Transactional
        void deleteByIdUserIdAndIdProductId(Integer userId, Long productId);


        @Query("SELECT wi.product FROM UserWishlistItem wi WHERE wi.id.userId = :userId")
        List<Product> findWishlistedProductsByUserId(@Param("userId") Integer userId);

        @Query("SELECT wi.product FROM UserWishlistItem wi WHERE wi.id.userId = :userId ORDER BY wi.addedAt DESC")
        List<Product> findWishlistedProductsByUserIdOrderByAddedAtDesc(@Param("userId") Integer userId);


        @Query("SELECT uw.id.productId FROM UserWishlistItem uw WHERE uw.id.userId = :userId AND uw.id.productId IN :productIds")
        Set<Long> findExistingProductIdsByUserIdAndProductIdsIn(
                @Param("userId") Integer userId,
                @Param("productIds") List<Long> productIds
        );
    }