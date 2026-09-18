package com.Restaurant_Management.System.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;



@Data
@Getter
@Setter
@Builder
public class SearchHistoryResponseDto {


    private String restaurantName;
    private String search_id;
    private long searchCount;
    private String url;
}
