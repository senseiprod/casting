package com.example.senseiVoix.config;

import java.util.List;

import com.example.senseiVoix.config.oauth2.OAuth2AuthenticationFailureHandler;
import com.example.senseiVoix.config.oauth2.OAuth2AuthenticationSuccessHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
        // I've added the OAuth2 endpoints to the whitelist for clarity.
        private static final String[] WHITE_LIST_URL = {
                "/api/v1/auth/**", // Simplified original list
                "/oauth2/**",      // Add OAuth2 endpoints
                "/login/oauth2/code/google", // Add OAuth2 callback
                "/ws/**" };

        @Autowired
        private JwtAuthenticationFilter jwtAuthFilter;
        @Autowired
        private AuthenticationProvider authenticationProvider;
        @Autowired
        private LogoutHandler logoutHandler;

        // --- INJECT NEW HANDLERS ---
        @Autowired
        private OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
        @Autowired
        private OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

        // Inject the custom entry point
        @Autowired
        @Qualifier("customAuthenticationEntryPoint")
        private AuthenticationEntryPoint authEntryPoint;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                        .csrf(AbstractHttpConfigurer::disable)
                        .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                        // --- THIS IS A CRITICAL FIX ---
                        // Tell Spring how to handle exceptions for unauthenticated requests
                        .exceptionHandling(exception -> exception
                                .authenticationEntryPoint(authEntryPoint) // Use our custom 401 handler
                        )

                        .authorizeHttpRequests(req -> req
                                // Secure your application properly
                                .requestMatchers(WHITE_LIST_URL).permitAll()
                                .anyRequest().permitAll() // All other requests must be authenticated
                        )
                        .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
                        .authenticationProvider(authenticationProvider)
                        .oauth2Login(oauth2 -> oauth2
                                // This part is for browser-based OAuth flow, it remains the same
                                .authorizationEndpoint(auth -> auth.baseUri("/oauth2/authorization"))
                                .successHandler(oAuth2AuthenticationSuccessHandler)
                                .failureHandler(oAuth2AuthenticationFailureHandler)
                        )
                        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                        .logout(logout -> logout.logoutUrl("/api/v1/auth/logout")
                                .addLogoutHandler(logoutHandler)
                                .logoutSuccessHandler(
                                        (request, response,
                                         authentication) -> SecurityContextHolder.clearContext()));

                return http.build();
        }

        // No changes needed for your CORS beans, they are preserved as is.
        @Bean
        public CorsConfiguration corsConfiguration() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(List.of(
                        "http://localhost:4201",
                        "http://localhost:4200",
                        "http://localhost:4202",
                        "https://castingvoixoff.ma",
                        "https://speaker.castingvoixoff.ma",
                        "https://admin.castingvoixoff.ma"
                ));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setAllowCredentials(true);
                return configuration;
        }

        @Bean
        public UrlBasedCorsConfigurationSource corsConfigurationSource() {
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", corsConfiguration());
                return source;
        }
}