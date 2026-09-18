package com.Restaurant_Management.System.service.impl;

import com.Restaurant_Management.System.dto.request.FoodCartItemRequestDto;
import com.Restaurant_Management.System.dto.request.FoodCartRequestDto;
import com.Restaurant_Management.System.dto.response.CartItemResponseDto;
import com.Restaurant_Management.System.dto.response.CartResponseDto;
import com.Restaurant_Management.System.entity.Cart;
import com.Restaurant_Management.System.entity.CartItems;
import com.Restaurant_Management.System.entity.FoodItem;
import com.Restaurant_Management.System.exception.EntryNotFoundException;
import com.Restaurant_Management.System.repo.CartRepo;
import com.Restaurant_Management.System.repo.FoodItemRepo;
import com.Restaurant_Management.System.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final FoodItemRepo foodItemRepo;
    private final CartRepo cartRepo;

    @Override
    public void addToCart(FoodCartRequestDto dto) {
        Cart cart = cartRepo.findByUserId(dto.getUserId());
        if( cart == null ) {
           cart = createNewCart(dto);
        }else {
            updateCartItems(cart, dto);
        }
        cartRepo.save(cart);
    }

    @Override
    public void removeFromCart(String userId, String foodId) {
        Cart cart = cartRepo.findCartByUserId(userId)
                .orElseThrow(() -> new EntryNotFoundException("Cart not found for user: " + userId));


        CartItems itemToRemove = cart.getCartItems().stream()
                .filter(item -> item.getFoodItem().getFoodItemId().equals(foodId))
                .findFirst()
                .orElseThrow(() -> new EntryNotFoundException("Food item not found in cart"));


        cart.getCartItems().remove(itemToRemove);


        cart.setTotalPrice(calculateTotalPrice(cart));


        cartRepo.save(cart);
    }


    @Override
    public void addFoodItemsToExistingCart(String userId, List<FoodCartItemRequestDto> foodItems) {
        // Find existing cart by userId
        Cart cart = cartRepo.findCartByUserId(userId)
                .orElseThrow(() -> new EntryNotFoundException("Cart not found for user: " + userId));

        // Create a FoodCartRequestDto to reuse existing logic
        FoodCartRequestDto requestDto = FoodCartRequestDto.builder()
                .userId(userId)
                .cartItems(foodItems)
                .build();

        // Update the cart with new items
        updateCartItems(cart, requestDto);

        // Save the updated cart
        cartRepo.save(cart);
    }

    @Override
    public CartResponseDto getCartByUserId(String userId) {
        Cart cart = cartRepo.findCartByUserId(userId)
                .orElseThrow(() -> new EntryNotFoundException("Cart not found for user: " + userId));

        return toCartResponseDto(cart);
    }

    @Override
    public void clearCart(String userId) {
        Cart cart = cartRepo.findByUserId(userId);
        if (cart == null) {
            throw new RuntimeException("Cart not found for user: " + userId);
        }

        cart.getCartItems().clear();
        cart.setTotalPrice(0.0);
        cartRepo.save(cart);
    }
    @Override
    public void updateCartItemQuantity(String userId, String foodId, int quantity, boolean increase) {
        Cart cart = cartRepo.findCartByUserId(userId)
                .orElseThrow(() -> new EntryNotFoundException("Cart not found for user: " + userId));

        CartItems item = cart.getCartItems().stream()
                .filter(cartItem -> cartItem.getFoodItem().getFoodItemId().equals(foodId))
                .findFirst()
                .orElseThrow(() -> new EntryNotFoundException("Food item not found in cart"));

        int updatedQuantity;
        if (increase) {

            updatedQuantity = item.getQuantity() + quantity;
        } else {

            updatedQuantity = item.getQuantity() - quantity;
            if (updatedQuantity <= 0) {
                cart.getCartItems().remove(item);
            }
        }

        if (updatedQuantity > 0) {
            item.setQuantity(updatedQuantity);
        }

        cart.setTotalPrice(calculateTotalPrice(cart));
        cartRepo.save(cart);
    }

    private CartResponseDto toCartResponseDto(Cart cart) {
        List<FoodCartItemRequestDto> cartItems = cart.getCartItems().stream().map(item ->
                FoodCartItemRequestDto.builder()
                        .foodItemId(item.getFoodItem().getFoodItemId())
                        .foodName(item.getFoodItem().getName())
                        .foodImage(item.getFoodItem().getImageUrl())
                        .restaurantId(item.getFoodItem().getRestaurant().getRestaurantId())
                        .restaurantName(item.getFoodItem().getRestaurant().getRestaurantName())
                        .price(item.getFoodItem().getPrice())
                        .quantity(item.getQuantity())
                        .build()
        ).toList();

        return CartResponseDto.builder()
                .userId(cart.getUserId())
                .cartId(cart.getCartId())
                .cartItems(cartItems)
                .totalPrice(cart.getTotalPrice())
                .createdAt(cart.getCreatedAt())
                .build();
    }

    private Cart createNewCart(FoodCartRequestDto dto) {
        List<CartItems> cartItems = new ArrayList<>();
        double totalPrice = 0;

        for (FoodCartItemRequestDto cartDto : dto.getCartItems()) {
            FoodItem foodItem = foodItemRepo.findFoodItemByFoodItemId(cartDto.getFoodItemId())
                    .orElseThrow(() -> new EntryNotFoundException("Food item not found"));

            CartItems cartItem = CartItems.builder()
                    .id(UUID.randomUUID().toString())
                    .foodItem(foodItem)
                    .foodName(foodItem.getName())
                    .quantity(cartDto.getQuantity())
                    .build();

            cartItems.add(cartItem);
            totalPrice += foodItem.getPrice() * cartDto.getQuantity();
        }

        Cart newCart = Cart.builder()
                .cartId(UUID.randomUUID().toString())
                .userId(dto.getUserId())
                .cartItems(cartItems)
                .totalPrice(totalPrice)
                .createdAt(LocalDateTime.now())
                .build();

        // Set cart reference for each cart item
        for (CartItems cartItem : cartItems) {
            cartItem.setFoodCart(newCart);
        }

        return newCart;
    }

    private void updateCartItems(Cart cart, FoodCartRequestDto dto) {
        double totalPrice = 0;

        for (FoodCartItemRequestDto cartDto : dto.getCartItems()) {
            FoodItem foodItem = foodItemRepo.findFoodItemByFoodItemId(cartDto.getFoodItemId())
                    .orElseThrow(() -> new EntryNotFoundException("Food item not found"));


            CartItems existingCartItem = cart.getCartItems().stream()
                    .filter(item -> item.getFoodItem().getFoodItemId().equals(foodItem.getFoodItemId()))
                    .findFirst()
                    .orElse(null);

            if (existingCartItem != null) {
                int updatedQuantity = existingCartItem.getQuantity() + cartDto.getQuantity();
                existingCartItem.setQuantity(updatedQuantity);
                totalPrice += foodItem.getPrice() * existingCartItem.getQuantity();
            } else {

                CartItems newCartItem = CartItems.builder()
                        .id(UUID.randomUUID().toString())
                        .foodItem(foodItem)
                        .foodName(foodItem.getName())
                        .quantity(cartDto.getQuantity())
                        .foodCart(cart)
                        .build();
                cart.getCartItems().add(newCartItem);
                totalPrice += foodItem.getPrice() * cartDto.getQuantity();
            }



        }


        cart.setTotalPrice(totalPrice);
    }

    private double calculateTotalPrice(Cart cart) {
        return cart.getCartItems().stream()
                .mapToDouble(item -> item.getFoodItem().getPrice() * item.getQuantity())
                .sum();
    }



}

