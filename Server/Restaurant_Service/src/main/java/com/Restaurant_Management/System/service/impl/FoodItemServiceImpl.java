package com.Restaurant_Management.System.service.impl;

import com.Restaurant_Management.System.dto.request.FoodItemsRequestDto;

import com.Restaurant_Management.System.dto.response.FoodItemResponseDto;

import com.Restaurant_Management.System.dto.response.paginate.FoodItemResponsePaginateDto;
import com.Restaurant_Management.System.entity.FoodItem;

import com.Restaurant_Management.System.entity.Restaurant;
import com.Restaurant_Management.System.exception.EntryNotFoundException;
import com.Restaurant_Management.System.repo.FoodItemRepo;
import com.Restaurant_Management.System.repo.RestaurantRepo;
import com.Restaurant_Management.System.service.FoodItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodItemServiceImpl implements FoodItemService {

    private final FoodItemRepo foodItemRepo;
    private final RestaurantRepo restaurantRepo;

    @Override
    public void foodItemSave(FoodItemsRequestDto dto) {
        foodItemRepo.save(toFoodItem(dto));
    }

    @Override
    public void foodItemUpdate(FoodItemsRequestDto dto, String id) {
        FoodItem foodItem = foodItemRepo.findById(id).orElseThrow(()->new EntryNotFoundException("not found"));

        Restaurant restaurant = restaurantRepo.findById(dto.getRestaurantId())
                .orElseThrow(() -> new EntryNotFoundException("Restaurant not found"));

        foodItem.setName(dto.getName());
        foodItem.setType(dto.getType());
        foodItem.setCategory(dto.getCategory());
        foodItem.setPrice(dto.getPrice());
        foodItem.setDiscount(dto.getDiscount());
        foodItem.setImageUrl(dto.getImageUrl());
        foodItem.setDescription(dto.getDescription());
        foodItem.setAvailable(dto.isAvailable());
        foodItem.setRestaurant(restaurant);

        foodItemRepo.save(foodItem);
    }

    @Override
    public FoodItemResponseDto foodItemFindById(String id) {
        return toFoodItemResponseDto(
                foodItemRepo.findById(id).orElseThrow(()->new EntryNotFoundException("not found"))
        );
    }

    @Override
    public void foodItemDeleteById(String id) {
        foodItemRepo.deleteById(id);
    }

    @Override
    public FoodItemResponsePaginateDto findAllFoodItem(String searchText, int page, int size) {
        return FoodItemResponsePaginateDto.builder()
                .dataCount(foodItemRepo.countAllFoodItems(searchText))
                .dataList(foodItemRepo.findAllFoodItem(searchText,PageRequest.of(page,size))
                        .stream()
                        .map(this::toFoodItemResponseDto)
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    public List<String> getAllCategories() {
        return foodItemRepo.findAllCategories();
    }

    @Override
    public FoodItemResponsePaginateDto getFoodItemByRestaurantAndCategory(String searchText, int page, int size, String restaurantId, String category) {
        String categoryPattern = "%" + category + "%";
        PageRequest pageRequest = PageRequest.of(page, size);

        List<FoodItemResponseDto> foodItems = foodItemRepo
                .findFoodItemsByRestaurantIdAndCategory(restaurantId, categoryPattern, pageRequest)
                .stream()
                .map(this::toFoodItemResponseDto)
                .collect(Collectors.toList());

        long count = foodItemRepo.countAllFoodItemsByRestaurantIdAndCategory(restaurantId, categoryPattern);

        return FoodItemResponsePaginateDto.builder()
                .dataCount(count)
                .dataList(foodItems)
                .build();
    }




    private FoodItem toFoodItem(FoodItemsRequestDto dto) {
        if(dto==null) throw new RuntimeException("null");

        Restaurant restaurant = restaurantRepo.findById(dto.getRestaurantId())
                .orElseThrow(()->new EntryNotFoundException("not found"));

        return  FoodItem.builder()
                .foodItemId(UUID.randomUUID().toString())
                .name(dto.getName())
                .type(dto.getType())
                .category(dto.getCategory())
                .price(dto.getPrice())
                .discount(dto.getDiscount())
                .imageUrl(dto.getImageUrl())
                .description(dto.getDescription())
                .available(dto.isAvailable())
                .restaurantName(restaurant.getRestaurantName())
                .restaurant(restaurant)
                .createdAt(LocalDateTime.now())
                .build();
    }
    private FoodItemResponseDto toFoodItemResponseDto( FoodItem foodItem) {
        if(foodItem==null) throw new RuntimeException("null");
        return  FoodItemResponseDto.builder()
                .foodItemId(foodItem.getFoodItemId())
                .name(foodItem.getName())
                .type(foodItem.getType())
                .category(foodItem.getCategory())
                .price(foodItem.getPrice())
                .discount(foodItem.getDiscount())
                .imageUrl(foodItem.getImageUrl())
                .description(foodItem.getDescription())
                .available(foodItem.isAvailable())
                .restaurantId(foodItem.getRestaurant().getRestaurantId())
                .restaurantName(foodItem.getRestaurantName())
                .createdAt(foodItem.getCreatedAt())
                .build();
    }
}
