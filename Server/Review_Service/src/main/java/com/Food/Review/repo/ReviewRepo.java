package com.Food.Review.repo;

import com.Food.Review.dto.response.ReviewResponseDto;
import com.Food.Review.entity.Reviews;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepo extends JpaRepository<Reviews,String> {

    @Query(
            value = "SELECT * FROM review WHERE restaurant_id = :id AND LOWER(customer_name) LIKE LOWER(CONCAT('%', :searchText, '%'))",
            countQuery = "SELECT COUNT(*) FROM review WHERE restaurant_id = :id AND LOWER(customer_name) LIKE LOWER(CONCAT('%', :searchText, '%'))",
            nativeQuery = true
    )
    Page<Reviews> findAllReviewsByRestaurantId(@Param("id") String id,
                                               @Param("searchText") String searchText,
                                               Pageable pageable);

    @Query(
            value = "SELECT COUNT(*) FROM review WHERE restaurant_id = :id AND LOWER(customer_name) LIKE LOWER(CONCAT('%', :searchText, '%'))",
            nativeQuery = true
    )
    long countAllReviewsByRestaurantId(@Param("id") String id,
                                       @Param("searchText") String searchText);






}
