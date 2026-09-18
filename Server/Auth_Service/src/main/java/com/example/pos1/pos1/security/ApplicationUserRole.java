package com.example.pos1.pos1.security;


import com.google.common.collect.Sets;
import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Set;
import java.util.stream.Collectors;


@Getter
public enum ApplicationUserRole {

    ADMIN(Sets.newHashSet(
            ApplicationUserPermission.PRODUCT_READ,
            ApplicationUserPermission.PRODUCT_WRITE,
            ApplicationUserPermission.USER_ROLE_WRITE,
            ApplicationUserPermission.ORDER_WRITE,
            ApplicationUserPermission.ORDER_READ
    )),

    USER(Sets.newHashSet(
            ApplicationUserPermission.PRODUCT_WRITE,
            ApplicationUserPermission.ORDER_WRITE,
            ApplicationUserPermission.ORDER_READ
    )),
    RESTAURANT_OWNER(Sets.newHashSet(
                  ApplicationUserPermission.PRODUCT_READ,
          ApplicationUserPermission.PRODUCT_WRITE,
          ApplicationUserPermission.USER_ROLE_WRITE,
          ApplicationUserPermission.ORDER_WRITE,
          ApplicationUserPermission.ORDER_READ
          )),
    DELIVERY_PERSON(Sets.newHashSet(
            ApplicationUserPermission.PRODUCT_WRITE,
            ApplicationUserPermission.ORDER_WRITE,
            ApplicationUserPermission.ORDER_READ
    ));



    private final Set<ApplicationUserPermission> applicationUserPermissions;

    ApplicationUserRole(Set<ApplicationUserPermission> applicationUserPermissions) {
        this.applicationUserPermissions = applicationUserPermissions;
    }


    public Set<SimpleGrantedAuthority> grantedAuthorities() {
        Set<SimpleGrantedAuthority> permissions = getApplicationUserPermissions()
                .stream().map(permission ->
                        new SimpleGrantedAuthority(permission.getPermission()))
                .collect(Collectors.toSet());
        permissions.add(
                new SimpleGrantedAuthority("ROLE_" + this.name()) // ROLE_USER
        );
        return permissions;
    }
}
