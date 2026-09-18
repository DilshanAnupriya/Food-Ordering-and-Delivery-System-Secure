package com.Restaurant_Management.System.entity;

import com.Restaurant_Management.System.dto.response.SearchHistoryResponseDto;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Entity(name = "search_History")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class SearchHistory {

    @Id
    private String search_id;
    private  String restaurantName;
    private long searchCount;
    private LocalDateTime latestCountAt;
    private String url;
}
