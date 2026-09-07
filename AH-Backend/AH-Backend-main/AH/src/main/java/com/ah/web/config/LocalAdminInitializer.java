package com.ah.web.config;

import com.ah.web.entity.Role;
import com.ah.web.entity.User;
import com.ah.web.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.SQLException;

/** Creates an explicitly configured development administrator in the local profile only. */
@Component
@Profile("local")
public class LocalAdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalAdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataSource dataSource;
    private final String email;
    private final String password;

    public LocalAdminInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            DataSource dataSource,
            @Value("${LOCAL_ADMIN_EMAIL:}") String email,
            @Value("${LOCAL_ADMIN_PASSWORD:}") String password) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.dataSource = dataSource;
        this.email = email == null ? "" : email.trim().toLowerCase();
        this.password = password == null ? "" : password;
    }

    @Override
    public void run(String... args) {
        if (email.isBlank() || password.isBlank()) {
            log.info("Local admin provisioning skipped; LOCAL_ADMIN_EMAIL and LOCAL_ADMIN_PASSWORD are not set");
            return;
        }

        if (password.length() < 10) {
            throw new IllegalStateException("LOCAL_ADMIN_PASSWORD must contain at least 10 characters");
        }

        assertLocalDatabase();

        User admin = userRepository.findByEmail(email).orElseGet(() -> User.builder()
                .email(email)
                .firstName("Local")
                .lastName("Administrator")
                .build());

        admin.setRole(Role.ADMIN);
        admin.setPassword(passwordEncoder.encode(password));
        userRepository.save(admin);
        log.info("Local administrator is ready: {}", email);
    }

    private void assertLocalDatabase() {
        try (var connection = dataSource.getConnection()) {
            String url = connection.getMetaData().getURL().toLowerCase();
            if (!url.contains("localhost") && !url.contains("127.0.0.1")) {
                throw new IllegalStateException(
                        "Local admin provisioning refused because the database is not hosted locally");
            }
        } catch (SQLException error) {
            throw new IllegalStateException("Could not verify the local admin database", error);
        }
    }
}
