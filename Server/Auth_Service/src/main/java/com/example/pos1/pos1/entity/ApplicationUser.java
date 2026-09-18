package com.example.pos1.pos1.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity(name = "application_user")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApplicationUser {

    @Id
    @Column(name = "user_id", length = 80)
    private String userId;

    @Column(name = "username", length = 100, unique = true)
    private String username;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "password", length = 750, nullable = false)
    private String password;

    @Column(name = "is_account_non_expired",columnDefinition = "TINYINT")
    private boolean isAccountNonExpired;

    @Column(name = "is_account_non_locked",columnDefinition = "TINYINT")
    private boolean isAccountNonLocked;

    @Column(name = "is_credentials_non_expired",columnDefinition = "TINYINT")
    private boolean isCredentialsNonExpired;

    @Column(name = "is_enabled",columnDefinition = "TINYINT")
    private boolean isEnabled;

    private String restaurantId;

    @ManyToMany
    @JoinTable(name="user_user_role",
            joinColumns = @JoinColumn(name="user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<UserRole> roles;




}