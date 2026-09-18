package com.Food.Review.service;

import com.Food.Review.dto.request.ReviewRequestDto;
import com.Food.Review.dto.response.ReviewResponseDto;
import com.Food.Review.dto.response.paginate.ReviewResponsePaginateDto;

public interface ReviewService {

    public void createReview(ReviewRequestDto dto);
    public void updateReview(ReviewRequestDto dto,String customerId);
    public ReviewResponseDto getReviewById(String id);
    public void deleteReviewById(String id);
    public ReviewResponsePaginateDto
    getAllReviewsByRestaurantId(String restaurantId,String searchText,int page,int size);
}
