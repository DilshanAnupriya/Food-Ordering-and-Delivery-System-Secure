package com.example.pos1.pos1.repo;

import com.example.pos1.pos1.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CustomerRepo extends JpaRepository<Customer,String> {
    @Query(nativeQuery = true,value = "SELECT * FROM customer WHERE name LIKE %?1% OR address LIKE %?1%")
    public Page<Customer> searchAllCustomers(String searchText, Pageable pageable);

    @Query(nativeQuery = true,value = "SELECT Count(*)  FROM customer WHERE name LIKE %?1% OR address LIKE %?1%")
    public  long  countAllCustomers(String searchText );
}
