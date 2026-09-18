package com.Restaurant_Management.System.repo;

import com.Restaurant_Management.System.entity.Restaurant;
import com.Restaurant_Management.System.entity.SearchHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SearchHistoryRepo extends JpaRepository<SearchHistory, String> {

    public SearchHistory findSearchHistoriesByRestaurantName(String searchText);

    @Query(nativeQuery = true,value = "SELECT * FROM search_history ORDER BY search_count DESC LIMIT 5")
    public List<SearchHistory> trendingRestaurants();
}
