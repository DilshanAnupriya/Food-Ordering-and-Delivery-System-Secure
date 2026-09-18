package com.example.pos1.pos1.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaginatedUserResponseDto {
    private List<UserResponseDto> content;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int size;
}