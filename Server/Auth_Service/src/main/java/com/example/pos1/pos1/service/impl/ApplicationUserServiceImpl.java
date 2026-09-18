package com.example.pos1.pos1.service.impl;

import com.example.pos1.pos1.dto.request.RequestAdminDto;
import com.example.pos1.pos1.dto.request.RequestUserDto;
import com.example.pos1.pos1.dto.request.UpdateUserDto;
import com.example.pos1.pos1.dto.response.PaginatedUserResponseDto;
import com.example.pos1.pos1.dto.response.UserResponseDto;
import com.example.pos1.pos1.entity.ApplicationUser;
import com.example.pos1.pos1.entity.UserRole;
import com.example.pos1.pos1.exception.DuplicateEntryException;
import com.example.pos1.pos1.exception.EntryNotFoundException;
import com.example.pos1.pos1.jwt.JwtConfig;
import com.example.pos1.pos1.repo.ApplicationUserRepo;
import com.example.pos1.pos1.repo.ApplicationUserRoleRepo;
import com.example.pos1.pos1.security.SupportSpringApplicationUser;
import com.example.pos1.pos1.service.ApplicationUserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.awt.print.Pageable;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

import static com.example.pos1.pos1.security.ApplicationUserRole.*;

@Service
@RequiredArgsConstructor
public class ApplicationUserServiceImpl implements ApplicationUserService {

        private final ApplicationUserRepo userRepo;
        private final ApplicationUserRoleRepo roleRepo;
        private final PasswordEncoder passwordEncoder;
        private final JwtConfig jwtConfig;
        private final SecretKey secretKey;

        @Transactional
        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

            Optional<ApplicationUser> selectedUserData = userRepo.findByUsername(username);
            if (selectedUserData.isEmpty()) {
                throw new EntryNotFoundException(String.format("username %s not found", username));
            }
            Set<SimpleGrantedAuthority> grantedAuthorities = new HashSet<>();

            for (UserRole u : selectedUserData.get().getRoles()) {
                if (u.getRoleName().equals("ADMIN")) {
                    grantedAuthorities.addAll(ADMIN.grantedAuthorities());
                }
                if (u.getRoleName().equals("USER")) {
                    grantedAuthorities.addAll(USER.grantedAuthorities());
                }
                if (u.getRoleName().equals("RESTAURANT_OWNER")) {
                    grantedAuthorities.addAll(RESTAURANT_OWNER.grantedAuthorities());
                }
                if (u.getRoleName().equals("DELIVERY_PERSON")) {
                    grantedAuthorities.addAll(DELIVERY_PERSON.grantedAuthorities());
                }
            }


            return new SupportSpringApplicationUser(
                    selectedUserData.get().getUsername(),
                    selectedUserData.get().getPassword(),
                    selectedUserData.get().isAccountNonExpired(),
                    selectedUserData.get().isAccountNonLocked(),
                    selectedUserData.get().isCredentialsNonExpired(),
                    selectedUserData.get().isEnabled(),
                    grantedAuthorities
            );
        }

        @Override
        public void create(RequestUserDto dto) throws IOException {
            Optional<ApplicationUser> selectedUser = userRepo.findByUsername(dto.getUsername());
            if (selectedUser.isPresent()) {
                throw new DuplicateEntryException(String.format("user with email (%s) is exists", dto.getUsername()));
            }
            userRepo.save(createApplicationUser(dto));

        }

    @Override
    public void createAdmin(RequestAdminDto dto) throws IOException {
        UserRole adminRole = roleRepo.findByRoleName("ADMIN")
                .orElseThrow(() -> new RuntimeException("Admin role not found"));

        // Create a Set of UserRole
        Set<UserRole> adminRoles = new HashSet<>();
        adminRoles.add(adminRole);

        // Create and save user with ADMIN role
        ApplicationUser admin = ApplicationUser.builder()
                .userId(UUID.randomUUID().toString())
                .username(dto.getUsername())
                .fullName(dto.getFullName())
                .restaurantId(dto.getRestaurantId())
                .password(passwordEncoder.encode(dto.getPassword()))
                .roles(adminRoles)  // Pass the Set of roles
                .isAccountNonExpired(true)
                .isAccountNonLocked(true)
                .isCredentialsNonExpired(true)
                .isEnabled(true)
                .build();

        userRepo.save(admin);
    }

    @Override
        public void initializeAdmin() throws IOException {
            Optional<ApplicationUser> selectedUser = userRepo.findByUsername("dilshananupriya.info@gmail.com");
            if (selectedUser.isPresent()) {
                return;
            }

            Optional<UserRole> selectedRole = roleRepo.findByRoleName("ADMIN");
            if (selectedRole.isEmpty()) {
                throw new EntryNotFoundException("role not found.");
            }

            Set<UserRole> selectedRoles = new HashSet<>();
            selectedRoles.add(selectedRole.get());

            userRepo.save(
                    ApplicationUser.builder()
                            .userId(UUID.randomUUID().toString())
                            .username("dilshananupriya.info@gmail.com")
                            .password(passwordEncoder.encode("dilshan@2002")) // must be encrypted //
                            .fullName("dilshan anupriya")
                            .roles(selectedRoles)
                            .isAccountNonExpired(true)
                            .isAccountNonLocked(true)
                            .isCredentialsNonExpired(true)
                            .isEnabled(true).build()
            );
        }

    @Override
    @Transactional
    public void changeUserRole(String userId, String newRoleName) throws IOException {
        // Find the user by ID
        ApplicationUser user = userRepo.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException(String.format("User with ID %s not found", userId)));

        // Find the role by name
        UserRole newRole = roleRepo.findByRoleName(newRoleName)
                .orElseThrow(() -> new EntryNotFoundException(String.format("Role %s not found", newRoleName)));

        // Create a new Set of roles
        Set<UserRole> newRoles = new HashSet<>();
        newRoles.add(newRole);

        // Set the new roles and save the user
        user.setRoles(newRoles);
        userRepo.save(user);
    }

        @Override
        public UserResponseDto findData(String tokenHeader) {
            String realToken = tokenHeader.replace(jwtConfig.getTokenPrefix(), "");
            Jws<Claims> claimsJws = Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(realToken);
            String username = claimsJws.getBody().getSubject();
            Optional<ApplicationUser> selectedUser = userRepo.findByUsername(username);
            if (selectedUser.isEmpty()) {
                throw new EntryNotFoundException(String.format("username %s not found", username));
            }
            return UserResponseDto.builder().username(selectedUser.get().getUsername()).fullName(selectedUser.get().getFullName()).build();
        }

        private ApplicationUser createApplicationUser(RequestUserDto dto) throws IOException {
            if (dto == null) {
                throw new RuntimeException("something went wrong..");
            }
            Optional<UserRole> selectedRole = roleRepo.findByRoleName("USER");
            if (selectedRole.isEmpty()) {
                throw new EntryNotFoundException("role not found.");
            }
            Set<UserRole> userRoles = new HashSet<>();
            userRoles.add(selectedRole.get());
            return ApplicationUser.builder()
                    .userId(UUID.randomUUID().toString())
                    .username(dto.getUsername().trim())
                    .password(passwordEncoder.encode(dto.getPassword())) // must be encrypted
                    .fullName(dto.getFullName().trim())
                    .roles(userRoles)
                    .isAccountNonExpired(true)
                    .isAccountNonLocked(true)
                    .isCredentialsNonExpired(true)
                    .isEnabled(true).build();

        }


    @Override
    public PaginatedUserResponseDto getAllUsers(int page, int size, String searchText) {
        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size);

        Page<ApplicationUser> usersPage;
        if (searchText == null || searchText.trim().isEmpty()) {
            usersPage = userRepo.findAll(pageable);
        } else {
            usersPage = userRepo.findUsers(searchText, pageable);
        }

        List<UserResponseDto> userDtos = usersPage.getContent().stream()
                .map(this::mapUserToResponseDto)
                .collect(Collectors.toList());

        return PaginatedUserResponseDto.builder()
                .content(userDtos)
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .currentPage(page)
                .size(size)
                .build();
    }

    @Override
    public UserResponseDto getUserById(String userId) {
        ApplicationUser user = userRepo.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException(String.format("User with ID %s not found", userId)));

        return mapUserToResponseDto(user);
    }

    @Override
    @Transactional
    public void updateUser(String userId, UpdateUserDto updateUserDto) throws IOException {
        ApplicationUser user = userRepo.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException(String.format("User with ID %s not found", userId)));

        // If updating username, check if it already exists
        if (updateUserDto.getUsername() != null && !updateUserDto.getUsername().equals(user.getUsername())) {
            Optional<ApplicationUser> existingUser = userRepo.findByUsername(updateUserDto.getUsername());
            if (existingUser.isPresent()) {
                throw new DuplicateEntryException(String.format("User with username (%s) already exists", updateUserDto.getUsername()));
            }
            user.setUsername(updateUserDto.getUsername().trim());
        }

        // Update other fields if provided
        if (updateUserDto.getFullName() != null) {
            user.setFullName(updateUserDto.getFullName().trim());
        }


        // Update enabled status
        user.setEnabled(updateUserDto.isEnabled());

        userRepo.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(String userId) throws IOException {
        ApplicationUser user = userRepo.findById(userId)
                .orElseThrow(() -> new EntryNotFoundException(String.format("User with ID %s not found", userId)));

        userRepo.delete(user);
    }

    // Helper method to map ApplicationUser to UserResponseDto
    private UserResponseDto mapUserToResponseDto(ApplicationUser user) {
        Set<String> roleNames = user.getRoles().stream()
                .map(UserRole::getRoleName)
                .collect(Collectors.toSet());

        return UserResponseDto.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .enabled(user.isEnabled())
                .roles(roleNames)
                .build();
    }
}
