package com.Restaurant_Management.System.service;

import com.Restaurant_Management.System.dto.request.FoodCartItemRequestDto;
import com.Restaurant_Management.System.dto.request.FoodCartRequestDto;
import com.Restaurant_Management.System.dto.request.FoodItemsRequestDto;
import com.Restaurant_Management.System.dto.response.CartResponseDto;
import com.Restaurant_Management.System.entity.Cart;

import java.util.List;

public interface CartService {
    public void addToCart(FoodCartRequestDto dto);
    public void removeFromCart(String userId,String foodId);
    public CartResponseDto getCartByUserId(String userId);
    void updateCartItemQuantity(String userId, String foodId, int quantity,boolean increase);
    void addFoodItemsToExistingCart(String userId, List<FoodCartItemRequestDto> foodItems);
    void clearCart(String userId);

}
