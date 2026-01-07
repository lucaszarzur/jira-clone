package com.jiraclone.config;

import com.jiraclone.security.JwtAuthenticationEntryPoint;
import com.jiraclone.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception ->
                exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                // Semi-public endpoints (users GET endpoints)
                .requestMatchers(HttpMethod.GET, "/api/users", "/api/users/*").permitAll()
                // Semi-public endpoints (projects GET endpoints - auth is optional)
                .requestMatchers(HttpMethod.GET, "/api/projects", "/api/projects/*").permitAll()
                // Semi-public endpoints (issues and comments GET endpoints)
                .requestMatchers(HttpMethod.GET, "/api/issues", "/api/issues/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/comments", "/api/comments/*").permitAll()
                // All other endpoints require authentication
                .anyRequest().authenticated()
            );

        // Add JWT filter
        http.addFilterBefore(jwtAuthenticationFilter,
            UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
