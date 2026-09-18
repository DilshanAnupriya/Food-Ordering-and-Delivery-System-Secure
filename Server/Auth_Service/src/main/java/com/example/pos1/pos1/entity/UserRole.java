package com.example.pos1.pos1.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import lombok.*;


import java.util.Set;

@Entity(name = "user_role")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRole {

    @Id
    @Column(name="role_id")
    private String roleId;

    @Column(name = "role_name",unique = true)
    private String roleName;

    @ManyToMany(mappedBy = "roles")
    private Set<ApplicationUser> users;
}
