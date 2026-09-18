package com.Restaurant_Management.System.api;


import com.Restaurant_Management.System.dto.request.FoodCartItemRequestDto;
import com.Restaurant_Management.System.dto.request.UpdateQuantityRequestDto;
import com.Restaurant_Management.System.dto.request.FoodCartRequestDto;
import com.Restaurant_Management.System.service.CartService;
import com.Restaurant_Management.System.util.StandardResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<StandardResponseDto> addToCart(
            @RequestBody FoodCartRequestDto dto
            ){
        cartService.addToCart(dto);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(201)
                        .message("  added to cart!")
                        .data(null)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<StandardResponseDto> getCartById( @PathVariable("id") String userId ) {

        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(200)
                        .message("Cart")
                        .data(cartService.getCartByUserId(userId))
                        .build(),
                HttpStatus.OK
        );
    }


    @PostMapping("/{userId}/items")
    public ResponseEntity<StandardResponseDto> addFoodItemsToExistingCart(
            @PathVariable("userId") String userId,
            @RequestBody List<FoodCartItemRequestDto> foodItems) {
        cartService.addFoodItemsToExistingCart(userId, foodItems);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(200)
                        .message("Food items added to existing cart successfully!")
                        .data(null)
                        .build(),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{userId}/{foodId}")
    public ResponseEntity<StandardResponseDto> deleteCartItem(
            @PathVariable("userId") String userId,
            @PathVariable("foodId") String foodId) {
        cartService.removeFromCart(userId, foodId);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(200)
                        .message("Item removed from cart successfully!")
                        .data(null)
                        .build(),
                HttpStatus.OK
        );
    }

    @PutMapping("/{userId}/{foodId}")
    public ResponseEntity<StandardResponseDto> updateCartItemQuantity(
            @PathVariable("userId") String userId,
            @PathVariable("foodId") String foodId,
            @RequestBody UpdateQuantityRequestDto requestDto) {
        cartService.updateCartItemQuantity(userId, foodId, requestDto.getQuantity(), requestDto.isIncrease());

        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(200)
                        .message("Item quantity updated successfully!")
                        .data(null)
                        .build(),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<StandardResponseDto> clearCart(
            @PathVariable("userId") String userId) {
        cartService.clearCart(userId);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(200)
                        .message("Cart cleared successfully!")
                        .data(null)
                        .build(),
                HttpStatus.OK
        );
    }



}
