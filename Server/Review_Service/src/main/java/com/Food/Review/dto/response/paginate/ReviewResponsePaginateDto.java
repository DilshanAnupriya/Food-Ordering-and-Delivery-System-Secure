package com.Food.Review.dto.response.paginate;

import com.Food.Review.dto.response.ReviewResponseDto;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Getter
@Setter
@Builder
public class ReviewResponsePaginateDto {
    private long dataCount;
    private List<ReviewResponseDto> dataList;
}
