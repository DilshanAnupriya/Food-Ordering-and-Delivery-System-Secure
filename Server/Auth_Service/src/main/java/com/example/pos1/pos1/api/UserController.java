package com.example.pos1.pos1.api;


import com.example.pos1.pos1.dto.request.ChangeRoleRequestDto;
import com.example.pos1.pos1.dto.request.RequestAdminDto;
import com.example.pos1.pos1.dto.request.RequestUserDto;
import com.example.pos1.pos1.dto.request.UpdateUserDto;
import com.example.pos1.pos1.service.ApplicationUserService;
import com.example.pos1.pos1.util.StandardResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/users")
public class UserController {

    private final ApplicationUserService applicationUserService;

    @PostMapping("/visitor/register")
    public ResponseEntity<StandardResponseDto> checkIfAdmin(
            @RequestBody RequestUserDto dto
    ) throws IOException {
        applicationUserService.create(dto);
        return new ResponseEntity<>(
                new StandardResponseDto( 201,"data created",    null),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/admin/create")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<StandardResponseDto> createAdmin(
            @RequestBody RequestAdminDto dto
    ) throws IOException {
        // Call a new method that specifically creates admins
        applicationUserService.createAdmin(dto);
        return new ResponseEntity<>(
                new StandardResponseDto(201, "Admin created successfully", null),
                HttpStatus.CREATED
        );
    }


    @GetMapping("/load-user-data")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
    public ResponseEntity<StandardResponseDto> loadById(
            @RequestHeader("Authorization") String tokenHeader
    ) {

        return new ResponseEntity<>(
                new StandardResponseDto(200, "data data",
                        applicationUserService.findData(tokenHeader)),
                HttpStatus.OK
        );
    }

    @PatchMapping("/change-role")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<StandardResponseDto> changeUserRole(
            @RequestBody ChangeRoleRequestDto dto
    ) throws IOException {
        applicationUserService.changeUserRole(dto.getUserId(), dto.getRoleName());
        return new ResponseEntity<>(
                new StandardResponseDto(200, "User role updated successfully", null),
                HttpStatus.OK
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<StandardResponseDto> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String searchText
    ) {
        return new ResponseEntity<>(
                new StandardResponseDto(200, "Users retrieved successfully",
                        applicationUserService.getAllUsers(page, size, searchText)),
                HttpStatus.OK
        );
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<StandardResponseDto> getUserById(
            @PathVariable String userId
    ) {
        return new ResponseEntity<>(
                new StandardResponseDto(200, "User retrieved successfully",
                        applicationUserService.getUserById(userId)),
                HttpStatus.OK
        );
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<StandardResponseDto> updateUser(
            @PathVariable String userId,
            @RequestBody UpdateUserDto updateUserDto
    ) throws IOException {
        applicationUserService.updateUser(userId, updateUserDto);
        return new ResponseEntity<>(
                new StandardResponseDto(200, "User updated successfully", null),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<StandardResponseDto> deleteUser(
            @PathVariable String userId
    ) throws IOException {
        applicationUserService.deleteUser(userId);
        return new ResponseEntity<>(
                new StandardResponseDto(200, "User deleted successfully", null),
                HttpStatus.OK
        );
    }

}
