package local.security;

import com.Restaurant_Management.System.RestaurantManagementApplication;
import com.Restaurant_Management.System.exception.BadRequestException;
import com.Restaurant_Management.System.repo.*;
import com.Restaurant_Management.System.service.impl.*;
import org.junit.jupiter.api.Test;
import java.net.http.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RestaurantPaginationFixTest {
    @Test
    void rejectBeforeQueriesOrSearchHistoryWrites() {
        var restaurants = mock(RestaurantRepo.class);
        var searches = mock(SearchHistoryRepo.class);
        var foods = mock(FoodItemRepo.class);
        var restaurantService = new RestaurantServiceImpl(restaurants, searches);
        var foodService = new FoodItemServiceImpl(foods, restaurants);
        for (int size : new int[]{-1, 0, 101, 200, Integer.MAX_VALUE}) {
            assertThrows(BadRequestException.class, () -> restaurantService.findAllRestaurant("test", 0, size));
            assertThrows(BadRequestException.class, () -> foodService.findAllFoodItem("test", 0, size));
            assertThrows(BadRequestException.class, () -> foodService.getFoodItemByRestaurantAndCategory("test", 0, size, "r", "c"));
        }
        assertThrows(BadRequestException.class, () -> restaurantService.findAllRestaurant("test", -1, 10));
        verifyNoInteractions(restaurants, searches, foods);
    }

    @Test
    void httpLimitsOnEveryRestaurantAndFoodListing() throws Exception {
        var http = HttpClient.newHttpClient();
        try (var app = ResourceConsumptionFixTest.start(RestaurantManagementApplication.class)) {
            for (String path : new String[]{"/api/v1/restaurants/list", "/api/v1/foods/list", "/api/v1/foods/REST-01/burger"}) {
                for (int size : new int[]{1, 100, 0, 101, 200}) {
                    var uri = ResourceConsumptionFixTest.endpoint(app, path + "?searchText=&page=0&size=" + size);
                    var response = http.send(HttpRequest.newBuilder(uri).GET().build(), HttpResponse.BodyHandlers.ofString());
                    assertEquals(size >= 1 && size <= 100 ? 200 : 400, response.statusCode(), uri.toString());
                }
                var uri = ResourceConsumptionFixTest.endpoint(app, path + "?searchText=&page=-1&size=10");
                assertEquals(400, http.send(HttpRequest.newBuilder(uri).GET().build(), HttpResponse.BodyHandlers.ofString()).statusCode());
            }
        }
    }
}
