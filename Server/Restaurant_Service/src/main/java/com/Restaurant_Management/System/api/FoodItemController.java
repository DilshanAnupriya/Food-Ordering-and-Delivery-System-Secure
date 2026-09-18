package com.Restaurant_Management.System.api;

import com.Restaurant_Management.System.dto.request.FoodItemsRequestDto;
import com.Restaurant_Management.System.dto.request.RestaurantRequestDto;
import com.Restaurant_Management.System.service.FoodItemService;
import com.Restaurant_Management.System.util.StandardResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/foods")
@RequiredArgsConstructor
public class FoodItemController {

    private final FoodItemService foodItemService;

    @PostMapping
    public ResponseEntity<StandardResponseDto> createFoodItem(
            @RequestBody FoodItemsRequestDto dto
            ) {
        foodItemService.foodItemSave(dto);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(201)
                        .message("Successfully added food item")
                        .data(null)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<StandardResponseDto> getFoodItem( @PathVariable("id") String foodItemId ) {

        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(200)
                        .message("Food item data")
                        .data(foodItemService.foodItemFindById(foodItemId))
                        .build(),
                HttpStatus.OK
        );
    }

    @GetMapping("/list")
    public ResponseEntity<StandardResponseDto> getAllFoodItem(
            @RequestParam String searchText,
            @RequestParam int page,
            @RequestParam int size
    ) {

        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(200)
                        .message("Food item list")
                        .data(foodItemService.findAllFoodItem(searchText, page, size))
                        .build(),
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<StandardResponseDto> UpdateFoodItem(
            @PathVariable("id") String foodItemId,
            @RequestBody FoodItemsRequestDto dto
    ) {
        foodItemService.foodItemUpdate(dto, foodItemId);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(201)
                        .message(" Food item updated successfully")
                        .data(null)
                        .build(),
                HttpStatus.CREATED
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<StandardResponseDto> deleteFoodItem(@PathVariable("id") String foodItemId) {
        foodItemService.foodItemDeleteById(foodItemId);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(204)
                        .message("Food item deleted successfully")
                        .data(null)
                        .build(),
                HttpStatus.NO_CONTENT
        );
    }

    @GetMapping("/categories")
    public  ResponseEntity<StandardResponseDto> getAllCategories(){
        return new ResponseEntity<>(

                com.Restaurant_Management.System.util.StandardResponseDto.builder()
                        .code(200)
                        .message("Food Categories")
                        .data(foodItemService.getAllCategories())
                        .build(),
                HttpStatus.OK
        );
    }
    @GetMapping("/{restaurantId}/{category}")
    public ResponseEntity<StandardResponseDto> getFoodItemsByRestaurantAndCategory(
            @RequestParam String searchText,
            @RequestParam int page,
            @RequestParam int size,
            @PathVariable("restaurantId") String restaurantId,
            @PathVariable("category") String category
    ) {
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(200)
                        .message("Food items by restaurant and category")
                        .data(foodItemService.getFoodItemByRestaurantAndCategory(searchText,page,size,restaurantId, category))
                        .build(),
                HttpStatus.OK
        );
    }

}
