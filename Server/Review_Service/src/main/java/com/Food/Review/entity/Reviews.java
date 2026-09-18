package com.Food.Review.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDateTime;
@Entity(name = "review")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Reviews {

    @Id
    private String review_id;

    private String customer_id;

    private String customer_name;

    private String restaurant_id;

    @Column(updatable = false)
    private LocalDateTime created_at;

    @Column(length = 1000)

    private String review_content;
    private int rating;
    private LocalDateTime updated_at;
}
