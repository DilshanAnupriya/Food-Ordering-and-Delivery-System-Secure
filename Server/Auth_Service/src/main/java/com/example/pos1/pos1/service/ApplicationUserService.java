package com.example.pos1.pos1.service;

import com.example.pos1.pos1.dto.request.RequestAdminDto;
import com.example.pos1.pos1.dto.request.RequestUserDto;
import com.example.pos1.pos1.dto.request.UpdateUserDto;
import com.example.pos1.pos1.dto.response.PaginatedUserResponseDto;
import com.example.pos1.pos1.dto.response.UserResponseDto;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.io.IOException;

public interface ApplicationUserService extends UserDetailsService {

    public void create(RequestUserDto dto) throws IOException;
    public void createAdmin(RequestAdminDto dto) throws IOException;
    public void initializeAdmin() throws IOException;
    UserResponseDto findData(String tokenHeader);
    void changeUserRole(String userId, String newRoleName) throws IOException;

    PaginatedUserResponseDto getAllUsers(int page, int size, String searchText);
    UserResponseDto getUserById(String userId);
    void updateUser(String userId, UpdateUserDto updateUserDto) throws IOException;
    void deleteUser(String userId) throws IOException;
}
