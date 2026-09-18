package com.Restaurant_Management.System.service.impl;

import com.Restaurant_Management.System.dto.request.RestaurantAvailabilityDto;
import com.Restaurant_Management.System.dto.request.RestaurantOrderAvailabilityDto;
import com.Restaurant_Management.System.dto.request.RestaurantRequestDto;
import com.Restaurant_Management.System.dto.response.RestaurantResponseDto;
import com.Restaurant_Management.System.dto.response.SearchHistoryResponseDto;
import com.Restaurant_Management.System.dto.response.paginate.RestaurantResponsePaginateDto;
import com.Restaurant_Management.System.dto.response.paginate.TrendingRestaurantResponseListDto;
import com.Restaurant_Management.System.entity.Restaurant;
import com.Restaurant_Management.System.entity.SearchHistory;
import com.Restaurant_Management.System.exception.DuplicateEntryException;
import com.Restaurant_Management.System.exception.EntryNotFoundException;
import com.Restaurant_Management.System.repo.RestaurantRepo;
import com.Restaurant_Management.System.repo.SearchHistoryRepo;
import com.Restaurant_Management.System.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import javax.management.RuntimeErrorException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class  RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepo restaurantRepo;
    private final SearchHistoryRepo searchHistoryRepo;


    @Override
    public RestaurantResponseDto getRestaurantByOwnerUsername(String username) {
        Restaurant restaurant = restaurantRepo.getRestaurantByOwnerUsername(username);
        if (restaurant == null) {
            throw new EntryNotFoundException("No restaurant found for owner with username: " + username);
        }
        return toRestaurantResponseDto(restaurant);
    }

    @Override
    public void restaurantSave(RestaurantRequestDto dto) {
        if (restaurantRepo.existsRestaurantByRestaurantName(dto.getRestaurantName())) {
            throw new DuplicateEntryException("Restaurant with this name already exists.");
        }
        restaurantRepo.save(toRestaurant(dto));

    }

    @Override
    public void restaurantUpdate(RestaurantRequestDto dto, String id) {
        Restaurant restaurant = restaurantRepo.findById(id).orElseThrow(()-> new EntryNotFoundException("not found"));

        restaurant.setRestaurantName(dto.getRestaurantName());
        restaurant.setRestaurantPhone(dto.getRestaurantPhone());
        restaurant.setRestaurantEmail(dto.getRestaurantEmail());
        restaurant.setRestaurantAddress(dto.getRestaurantAddress());
        restaurant.setRestaurantType(dto.getRestaurantType());
        restaurant.setLatitude(dto.getLatitude());
        restaurant.setLongitude(dto.getLongitude());
        restaurant.setImageUrl(dto.getImageUrl());
        restaurant.setCoverImageUrl(dto.getCoverImageUrl());
        restaurant.setCity(dto.getCity());
        restaurant.setOpeningTime(dto.getOpeningTime());
        restaurant.setClosingTime(dto.getClosingTime());
        restaurant.setDescription(dto.getDescription());
        restaurant.setActive(dto.isActive());
        restaurant.setUpdatedAt(LocalDateTime.now());
        restaurant.setAvailability(dto.isAvailability());
        restaurant.setOrderAvailability(dto.isOrderAvailability());
        restaurant.setRating(dto.getRating());
        restaurant.setOwner_username(dto.getOwner_username() != null ? dto.getOwner_username() : restaurant.getOwner_username());

        restaurantRepo.save(restaurant);


    }


    @Override
    public String getRestaurantIdByRestaurantName(String restaurantName) {
        String restaurantId = restaurantRepo.findRestaurantIdByRestaurantName(restaurantName);
        if (restaurantId == null || restaurantId.isEmpty()) {
            throw new EntryNotFoundException("Restaurant with name '" + restaurantName + "' not found");
        }
        return restaurantId;
    }

    @Override
    public RestaurantResponseDto restaurantFindById(String id) {
        return  toRestaurantResponseDto(
             restaurantRepo.findById(id).orElseThrow(()-> new EntryNotFoundException("not found"))
        );

    }

    @Override
    public void restaurantDeleteById(String id) {
        restaurantRepo.deleteById(id);
    }

    @Override
    public RestaurantResponsePaginateDto findAllRestaurant(String searchText, int page, int size) {

        if (restaurantRepo.existsRestaurantByRestaurantName(searchText)) {
            String imageUrl = restaurantRepo.findRestaurantImageUrlByRestaurantName(searchText);
            SearchHistory searchHistory = searchHistoryRepo.findSearchHistoriesByRestaurantName(searchText);

            if (searchHistory != null) {
                searchHistory.setSearchCount(searchHistory.getSearchCount() + 1);
                searchHistory.setLatestCountAt(LocalDateTime.now());

            } else {
                searchHistory = new SearchHistory();
                searchHistory.setSearch_id(UUID.randomUUID().toString());
                searchHistory.setRestaurantName(searchText);
                searchHistory.setSearchCount(1);
                searchHistory.setLatestCountAt(LocalDateTime.now());
                searchHistory.setUrl(imageUrl);
            }

            searchHistoryRepo.save(searchHistory);
        }
        return RestaurantResponsePaginateDto.builder()
                .dataCount(restaurantRepo.countAllRestaurant(searchText))
                .dataList(
                        restaurantRepo.findAllRestaurant(searchText, PageRequest.of(page,size))
                .stream()
                .map(this::toRestaurantResponseDto)
                .collect(Collectors.toList()))
                .build();
    }

    @Override
    public void setRestaurantAvailability(String id, RestaurantAvailabilityDto dto) {
        Restaurant restaurant = restaurantRepo.findById(id).orElseThrow(()-> new EntryNotFoundException("not found"));
        restaurant.setAvailability(dto.isAvailability());
        restaurantRepo.save(restaurant);
    }

    @Override
    public void setOrderAvailability(String id, RestaurantOrderAvailabilityDto dto) {
        Restaurant restaurant = restaurantRepo.findById(id).orElseThrow(()-> new EntryNotFoundException("not found"));
        restaurant.setOrderAvailability(dto.isOrderAvailability());
        restaurantRepo.save(restaurant);
    }

    @Override
    public TrendingRestaurantResponseListDto trendingRestaurant() {
        List<SearchHistory> trendingRestaurants = searchHistoryRepo.trendingRestaurants();

        List<SearchHistoryResponseDto> trendingRestaurantDto = trendingRestaurants.stream()
                .map(searchHistory -> SearchHistoryResponseDto.builder()
                        .search_id(searchHistory.getSearch_id())
                        .restaurantName(searchHistory.getRestaurantName())
                        .searchCount(searchHistory.getSearchCount())
                        .url(searchHistory.getUrl())
                        .build())
                .toList();

        return TrendingRestaurantResponseListDto.builder()
                .trendingRestaurants(trendingRestaurantDto)
                .build();
    }


    private Restaurant toRestaurant(RestaurantRequestDto dto) {
        if(dto==null) throw new RuntimeException("null");
        return  Restaurant.builder()
                .restaurantId(UUID.randomUUID().toString())
                .restaurantName(dto.getRestaurantName())
                .restaurantPhone(dto.getRestaurantPhone())
                .restaurantEmail(dto.getRestaurantEmail())
                .restaurantAddress(dto.getRestaurantAddress())
                .restaurantType(dto.getRestaurantType())
                .city(dto.getCity())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .availability(dto.isAvailability())
                .orderAvailability(dto.isOrderAvailability())
                .openingTime(dto.getOpeningTime())
                .closingTime(dto.getClosingTime())
                .description(dto.getDescription())
                .active(dto.isActive())
                .imageUrl(dto.getImageUrl())
                .coverImageUrl(dto.getCoverImageUrl() != null ? dto.getCoverImageUrl() : dto.getImageUrl())
                .updatedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .rating(dto.getRating())
                .owner_username(dto.getOwner_username() != null ? dto.getOwner_username() : dto.getRestaurantName())
                .build();
    }

    private RestaurantResponseDto toRestaurantResponseDto(Restaurant restaurant) {
        if(restaurant==null) throw new RuntimeException("null");
        return  RestaurantResponseDto.builder()
                .restaurantId(restaurant.getRestaurantId())
                .restaurantName(restaurant.getRestaurantName())
                .restaurantPhone(restaurant.getRestaurantPhone())
                .restaurantEmail(restaurant.getRestaurantEmail())
                .restaurantAddress(restaurant.getRestaurantAddress())
                .restaurantType(restaurant.getRestaurantType())
                .city(restaurant.getCity())
                .availability(restaurant.isAvailability())
                .orderAvailability(restaurant.isOrderAvailability())
                .openingTime(restaurant.getOpeningTime())
                .closingTime(restaurant.getClosingTime())
                .description(restaurant.getDescription())
                .active(restaurant.isActive())
                .imageUrl(restaurant.getImageUrl())
                .coverImageUrl(restaurant.getCoverImageUrl())
                .updatedAt(LocalDateTime.now())
                .createdAt(restaurant.getCreatedAt())
                .rating(restaurant.getRating())
                .owner_username(restaurant.getOwner_username())
                .latitude(restaurant.getLatitude())
                .longitude(restaurant.getLongitude())
                .build();
    }
}
