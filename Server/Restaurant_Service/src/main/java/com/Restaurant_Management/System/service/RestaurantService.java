package com.Restaurant_Management.System.service;

import com.Restaurant_Management.System.dto.request.RestaurantAvailabilityDto;
import com.Restaurant_Management.System.dto.request.RestaurantOrderAvailabilityDto;
import com.Restaurant_Management.System.dto.request.RestaurantRequestDto;
import com.Restaurant_Management.System.dto.response.RestaurantResponseDto;
import com.Restaurant_Management.System.dto.response.SearchHistoryResponseDto;
import com.Restaurant_Management.System.dto.response.paginate.RestaurantResponsePaginateDto;
import com.Restaurant_Management.System.dto.response.paginate.TrendingRestaurantResponseListDto;
import com.Restaurant_Management.System.entity.Restaurant;

import java.time.LocalDateTime;

public interface RestaurantService {

    public void restaurantSave(RestaurantRequestDto dto);
    public void restaurantUpdate(RestaurantRequestDto dto, String id);
    public RestaurantResponseDto restaurantFindById(String id);
    public void restaurantDeleteById(String id);
    public RestaurantResponsePaginateDto findAllRestaurant(String searchText, int page, int size);
    public void setRestaurantAvailability(String id, RestaurantAvailabilityDto dto);
    public  void setOrderAvailability(String id, RestaurantOrderAvailabilityDto dto);
    public TrendingRestaurantResponseListDto trendingRestaurant();
    public String getRestaurantIdByRestaurantName(String restaurantName);
    public RestaurantResponseDto getRestaurantByOwnerUsername(String username);
}
