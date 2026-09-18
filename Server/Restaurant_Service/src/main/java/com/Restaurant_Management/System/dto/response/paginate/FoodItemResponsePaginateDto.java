package com.Restaurant_Management.System.dto.response.paginate;

import com.Restaurant_Management.System.dto.response.FoodItemResponseDto;
import com.Restaurant_Management.System.dto.response.RestaurantResponseDto;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Getter
@Setter
@Builder
public class FoodItemResponsePaginateDto {

    private long dataCount;
    private List<FoodItemResponseDto> dataList;
}
