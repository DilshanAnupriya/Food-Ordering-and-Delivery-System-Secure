package com.example.pos1.pos1.repo;

import com.example.pos1.pos1.entity.ApplicationUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ApplicationUserRepo extends JpaRepository<ApplicationUser, String> {

    @Query(value = "SELECT * FROM application_user WHERE username=?1", nativeQuery = true)
    Optional<ApplicationUser> findByUsername(String username);

    @Query(value = "SELECT * FROM application_user WHERE username LIKE %?1% OR full_name LIKE %?1%", nativeQuery = true)
    public Page<ApplicationUser> findUsers(String username, Pageable pageable);

    @Query(value = "SELECT COUNT(*) FROM application_user WHERE username LIKE %?1% OR full_name LIKE %?1%", nativeQuery = true)
    public long countUsers(String username);



}
