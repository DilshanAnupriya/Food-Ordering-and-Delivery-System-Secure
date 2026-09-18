package com.Food.Review.dto.request;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ReviewRequestDto {


    private String customer_id;
    private String customer_name;
    private String restaurant_id;
    private String review_content;
    private int rating;

}
