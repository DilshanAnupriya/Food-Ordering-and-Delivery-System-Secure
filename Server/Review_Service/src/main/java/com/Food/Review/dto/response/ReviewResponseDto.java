package com.Food.Review.dto.response;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@Builder
public class ReviewResponseDto {

    private String review_id;
    private String customer_id;
    private String customer_name;
    private String restaurant_id;
    private LocalDateTime created_at;
    private String review_content;
    private int rating;
    private LocalDateTime updated_at;
}
