package com.Food.Review.api;

import com.Food.Review.dto.request.ReviewRequestDto;
import com.Food.Review.service.ReviewService;
import com.Food.Review.util.StandardResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/restaurant-reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<StandardResponseDto> createReview(
            @RequestBody ReviewRequestDto dto
    ) {
        reviewService.createReview(dto);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(201)
                        .message("Review Created Successfully")
                        .data(null)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<StandardResponseDto> getReview( @PathVariable("id") String Id ) {

        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(200)
                        .message("Review Data")
                        .data(reviewService.getReviewById(Id))
                        .build(),
                HttpStatus.OK
        );
    }

    @GetMapping("/{id}/list")
    public ResponseEntity<StandardResponseDto> getAllReviewsByRestaurant(
            @PathVariable("id") String Id,
            @RequestParam String searchText,
            @RequestParam int page,
            @RequestParam int size
    ) {

        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(200)
                        .message("Review List")
                        .data(reviewService.getAllReviewsByRestaurantId(Id,searchText, page, size))
                        .build(),
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<StandardResponseDto> UpdateReview(
            @PathVariable("id") String reviewId,
            @RequestBody ReviewRequestDto dto
    ) {
        reviewService.updateReview(dto, reviewId);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(201)
                        .message(" Review updated successfully")
                        .data(null)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<StandardResponseDto> deleteReviews(@PathVariable("id") String reviewId) {
        reviewService.deleteReviewById(reviewId);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(204)
                        .message("Review deleted successfully")
                        .data(null)
                        .build(),
                HttpStatus.NO_CONTENT
        );
    }
}
