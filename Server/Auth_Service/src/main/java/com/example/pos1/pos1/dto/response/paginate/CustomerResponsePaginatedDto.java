package com.example.pos1.pos1.dto.response.paginate;

import com.example.pos1.pos1.dto.response.CustomerResponseDto;
import lombok.*;

import java.util.List;
@Data
@Getter
@Setter
@AllArgsConstructor
@Builder
public class CustomerResponsePaginatedDto {
    private Long dataCount;
    private List<CustomerResponseDto> dataList;
}
