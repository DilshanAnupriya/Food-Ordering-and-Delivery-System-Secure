package com.example.pos1.pos1.service.impl;

import com.example.pos1.pos1.entity.UserRole;
import com.example.pos1.pos1.repo.ApplicationUserRoleRepo;
import com.example.pos1.pos1.service.ApplicationUserRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class ApplicationUserRoleServiceImpl implements ApplicationUserRoleService {

    private final ApplicationUserRoleRepo applicationUserRoleRepo;

    @Override
    @Transactional
    public void initializeRoles() {
        List<UserRole> applicationUserRoles = applicationUserRoleRepo.findAll();
        if(applicationUserRoles.isEmpty()) {
            UserRole admin = UserRole.builder()
                    .roleId(UUID.randomUUID().toString())
                    .roleName("ADMIN")
                    .build();

            UserRole user = UserRole.builder()
                    .roleId(UUID.randomUUID().toString())
                    .roleName("USER")
                    .build();

            UserRole restaurant_owner = UserRole.builder()
                    .roleId(UUID.randomUUID().toString())
                    .roleName("RESTAURANT_OWNER")
                    .build();

            UserRole delivery = UserRole.builder()
                    .roleId(UUID.randomUUID().toString())
                    .roleName("DELIVERY_PERSON")
                    .build();

            applicationUserRoleRepo.saveAll(List.of(admin, user, restaurant_owner, delivery));
        } else {
            // Check if we need to add missing roles
            boolean hasRestaurantOwner = applicationUserRoles.stream()
                    .anyMatch(role -> "RESTAURANT_OWNER".equals(role.getRoleName()));
            boolean hasDeliveryPerson = applicationUserRoles.stream()
                    .anyMatch(role -> "DELIVERY_PERSON".equals(role.getRoleName()));

            if (!hasRestaurantOwner) {
                UserRole restaurant_owner = UserRole.builder()
                        .roleId(UUID.randomUUID().toString())
                        .roleName("RESTAURANT_OWNER")
                        .build();
                applicationUserRoleRepo.save(restaurant_owner);
            }

            if (!hasDeliveryPerson) {
                UserRole delivery = UserRole.builder()
                        .roleId(UUID.randomUUID().toString())
                        .roleName("DELIVERY_PERSON")
                        .build();
                applicationUserRoleRepo.save(delivery);
            }
        }
    }
}