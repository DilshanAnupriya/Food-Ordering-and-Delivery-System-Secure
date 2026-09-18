package com.example.pos1.pos1;

import com.example.pos1.pos1.service.ApplicationUserRoleService;
import com.example.pos1.pos1.service.ApplicationUserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthService implements CommandLineRunner {

	private final ApplicationUserRoleService userRoleService;
	private final ApplicationUserService applicationUserService;

	public AuthService(ApplicationUserRoleService userRoleService, ApplicationUserService applicationUserService) {
		this.userRoleService = userRoleService;
		this.applicationUserService = applicationUserService;
	}

	public static void main(String[] args) {
		SpringApplication.run(AuthService.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// save all roles if not exists
		userRoleService.initializeRoles();

		// save user (ADMIN)-> if not exists
		applicationUserService.initializeAdmin();


	}
}
