package com.Food.Review.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class ReviewRequestDto {

    @NotBlank(message = "Customer ID cannot be blank")
    private String customer_id;

    @NotBlank(message = "Customer name cannot be blank")
    @Size(min = 2, max = 100, message = "Customer name must be between 2 and 100 characters")
    private String customer_name;

    @NotBlank(message = "Restaurant ID cannot be blank")
    private String restaurant_id;

    @NotBlank(message = "Review content cannot be blank")
    @Size(min = 2, max = 1000, message = "Review content must be between 2 and 1000 characters")
    private String review_content;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private int rating;
}

