package com.Food.Review.service.impl;

import com.Food.Review.dto.request.ReviewRequestDto;
import com.Food.Review.dto.response.ReviewResponseDto;
import com.Food.Review.dto.response.paginate.ReviewResponsePaginateDto;
import com.Food.Review.entity.Reviews;
import com.Food.Review.exception.EntryNotFoundException;
import com.Food.Review.repo.ReviewRepo;
import com.Food.Review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class reviewServiceImpl implements ReviewService {

    private final ReviewRepo reviewRepo;

    @Override
    public void createReview(ReviewRequestDto dto) {
        reviewRepo.save(toReview(dto));
    }

    @Override
    public void updateReview(ReviewRequestDto dto,String id) {
        Reviews reviews = reviewRepo.findById(id).orElseThrow(()-> new EntryNotFoundException("not found"));

        reviews.setCustomer_name(dto.getCustomer_name());
        reviews.setReview_content(dto.getReview_content());
        reviews.setRating(dto.getRating());
        reviews.setUpdated_at(LocalDateTime.now());

        reviewRepo.save(reviews);
    }

    @Override
    public ReviewResponseDto getReviewById(String id) {
        return toReviewResponseDto(
                reviewRepo.findById(id).orElseThrow(()-> new EntryNotFoundException("not found"))
        );
    }

    @Override
    public void deleteReviewById(String id) {
        reviewRepo.deleteById(id);
    }

    @Override
    public ReviewResponsePaginateDto getAllReviewsByRestaurantId(String restaurantId, String searchText, int page, int size) {
        return ReviewResponsePaginateDto.builder()
                .dataCount(reviewRepo.countAllReviewsByRestaurantId(restaurantId,searchText))
                .dataList(
                        reviewRepo.findAllReviewsByRestaurantId(restaurantId,searchText, PageRequest.of(page,size))
                                .stream()
                                .map(this::toReviewResponseDto)
                                .collect(Collectors.toList())
                )
                .build();
    }

    public Reviews toReview(ReviewRequestDto dto) {
        if(dto == null) throw new NullPointerException("dto cannot be null");
        return Reviews.builder()
                .review_id(UUID.randomUUID().toString())
                .customer_id(dto.getCustomer_id())
                .customer_name(dto.getCustomer_name())
                .restaurant_id(dto.getRestaurant_id())
                .review_content(dto.getReview_content())
                .rating(dto.getRating())
                .created_at(LocalDateTime.now())
                .updated_at(LocalDateTime.now())
                .build();
    }

    public ReviewResponseDto toReviewResponseDto(Reviews reviews) {
        if(reviews == null) throw new NullPointerException("reviews cannot be null");
        return ReviewResponseDto.builder()
                .review_id(reviews.getReview_id())
                .customer_id(reviews.getCustomer_id())
                .customer_name(reviews.getCustomer_name())
                .restaurant_id(reviews.getRestaurant_id())
                .review_content(reviews.getReview_content())
                .rating(reviews.getRating())
                .created_at(reviews.getCreated_at())
                .updated_at(reviews.getUpdated_at())
                .build();
    }
}
