package com.Restaurant_Management.System.service;

import com.Restaurant_Management.System.dto.request.FoodItemsRequestDto;
import com.Restaurant_Management.System.dto.request.RestaurantRequestDto;
import com.Restaurant_Management.System.dto.response.FoodItemResponseDto;
import com.Restaurant_Management.System.dto.response.RestaurantResponseDto;
import com.Restaurant_Management.System.dto.response.paginate.FoodItemResponsePaginateDto;
import com.Restaurant_Management.System.dto.response.paginate.RestaurantResponsePaginateDto;

import java.util.List;

public interface FoodItemService  {

    public void foodItemSave(FoodItemsRequestDto dto);
    public void foodItemUpdate(FoodItemsRequestDto dto, String id);
    public FoodItemResponseDto foodItemFindById(String id);
    public void foodItemDeleteById(String id);
    public FoodItemResponsePaginateDto findAllFoodItem(String searchText, int page, int size);
    public List<String> getAllCategories();
    public FoodItemResponsePaginateDto getFoodItemByRestaurantAndCategory(String searchText, int page, int size,String restaurantId, String category);

}
