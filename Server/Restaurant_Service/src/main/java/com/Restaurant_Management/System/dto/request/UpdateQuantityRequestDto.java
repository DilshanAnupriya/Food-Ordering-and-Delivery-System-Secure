package com.Restaurant_Management.System.dto.request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class UpdateQuantityRequestDto {
    private int quantity;
    private boolean increase;
}
