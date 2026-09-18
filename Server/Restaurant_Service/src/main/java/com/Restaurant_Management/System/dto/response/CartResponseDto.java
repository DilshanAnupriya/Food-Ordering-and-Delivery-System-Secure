package com.Restaurant_Management.System.dto.response;

import com.Restaurant_Management.System.dto.request.FoodCartItemRequestDto;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartResponseDto {
    private String userId;
    private String cartId;
    private List<FoodCartItemRequestDto> cartItems;
    private double totalPrice;
    private LocalDateTime createdAt;


}
