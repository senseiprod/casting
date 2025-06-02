package com.example.senseiVoix.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private static final String[] WHITE_LIST_URL = {
        "/api/v1/auth/register", 
        "/api/v1/auth/registerSpeaker", 
        "/api/v1/auth/authenticate",
        "/api/v1/auth/refresh-token",
        "/ws/**" 
    };
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;
    @Autowired
    private AuthenticationProvider authenticationProvider;
    @Autowired
    private LogoutHandler logoutHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(req -> req
                // Public endpoints
                .requestMatchers(WHITE_LIST_URL).permitAll()
                
                // Admin access - full access
                .requestMatchers("/**").hasAnyAuthority("admin:read")
                
                // Shared endpoints - both management and client can access
                .requestMatchers(
                    // Actions endpoints (shared)
                    "/api/actions/create",
                    
                    // Audios endpoints (shared)
                    "/api/audios/all",
                    "/api/audios",
                    "/api/audios/download/{id}",
                    "/api/audios/speaker/{speakerId}",
                    "/api/audios/{id}",
                    "/api/audios/audio/{audioId}",
                    
                    // Client endpoints (shared)
                    "/api/clients",
                    "/api/clients/{id}",
                    "/api/clients/uuid/{uuid}",
                    
                    // Combined voices endpoints (shared)
                    "/api/combined-voices/combined",
                    "/api/combined-voices/**",
                    
                    // Demande endpoints (shared)
                    "/api/demandes/{id}",
                    "/api/demandes/uuid/{uuid}",
                    "/api/demandes/demandeur/{uuid}",
                    "/api/demandes/update/{uuid}",
                    "/api/demandes/delete/{uuid}",
                    
                    // ElevenLabs endpoints (shared)
                    "/api/elevenlabs/text-to-speech/{voiceId}",
                    "/api/elevenlabs/voices/{voiceId}",
                    "/api/elevenlabs/voices",
                    "/api/elevenlabs/shared-voices",
                    
                    // Email endpoints (shared)
                    "/send-test-email",
                    
                    // Facture endpoints (shared)
                    "/api/factures/{id}",
                    "/api/factures/speaker/{speakerUuid}",
                    "/api/factures/{id}/uploadPdf",
                    "/api/factures/{id}/downloadPdf",
                    
                    // Favorites endpoints (shared)
                    "/api/favorites",
                    "/api/favorites/{id}",
                    "/api/favorites/**",
                    
                    // Records endpoints (shared)
                    "/api/records/{uuid}",
                    "/api/records/date/{date}",
                    "/api/records/range",
                    "/api/records/user/{userId}",
                    "/api/records/active",
                    "/api/records/deleted",
                    "/api/records/soft-delete/{uuid}",
                    "/api/records/permanent-delete/{uuid}",
                    "/api/records/**",
                    
                    // Reservation Speaker endpoints (shared)
                    "/api/reservationsSpeaker",
                    "/api/reservationsSpeaker/{id}",
                    "/api/reservationsSpeaker/user/{userUuid}",
                    "/api/reservationsSpeaker/speaker/{speakerUuid}",
                    "/api/reservationsSpeaker/date/{date}",
                    "/api/reservationsSpeaker/user/{userUuid}/date/{date}",
                    "/api/reservationsSpeaker/speaker/{speakerUuid}/date/{date}",
                    "/api/reservationsSpeaker/**",
                    
                    // Reservation Studio endpoints (shared - these appear in BOTH sections)
                    "/api/reservations/by-date-and-range",
                    "/api/reservations/by-date-range", 
                    "/api/reservations/reserved-hours",
                    
                    // Speaker endpoints (shared)
                    "/api/speakers/{id}",
                    "/api/speakers/uuid/{uuid}",
                    "/api/speakers/email/{email}",
                    "/api/speakers/earnings/{earnings}",
                    "/api/speakers/active",
                    "/api/speakers/search",
                    
                    // Transactions endpoints (shared)
                    "/api/transactions/{uuid}",
                    "/api/transactions/facture/{factureUuid}",
                    "/api/transactions/speaker/{speakerUuid}",
                    
                    // Utilisateur endpoints (shared)
                    "/utilisateurs/{id}/uploadPhoto",
                    "/utilisateurs/{id}/photo",
                    "/utilisateurs/{id}",
                    "/utilisateurs/admin",
                    "/utilisateurs/client",
                    "/utilisateurs/speaker",
                    
                    // Voix2 endpoints (shared)
                    "/api/voix2/{id}",
                    "/api/voix2/all",
                    "/api/voix2/speaker-voice/{uuid}",
                    
                    // Voix endpoints (shared)
                    "/api/voix/{id}",
                    "/api/voix/all",
                    "/api/voix/speaker-voice/{uuid}"
                ).hasAnyAuthority("management:read", "client:read")
                
                // Management-only endpoints
                .requestMatchers(
                    // Actions endpoints (management only)
                    "/api/actions/validate/{uuid}",
                    "/api/actions/speaker/{uuid}",
                    "/api/actions//notify",  // preserving double slash from original
                    "/api/actions//reject/{uuid}",  // preserving double slash from original
                    
                    // Facture endpoints (management only)
                    "/api/factures",
                    
                    // Records endpoints (management only)
                    "/api/records"
                ).hasAuthority("management:read")
                
                // Client-only endpoints
                .requestMatchers(
                    // Actions endpoints (client only)
                    "/api/actions/by-project/{uuid}",
                    "/api/actions/delete/{uuid}",
                    
                    // Client endpoints (client only)
                    "/api/clients/email/{email}",
                    "/api/clients/fidelite/{fidelite}",
                    "/api/clients/not-deleted",
                    
                    // Demande endpoints (client only)
                    "/api/demandes",
                    "/api/demandes/en-attente",
                    "/api/demandes/acceptees",
                    "/api/demandes/refusees",
                    "/api/demandes/count/en-attente",
                    "/api/demandes/count/acceptees",
                    "/api/demandes/count/refusees",
                    "/api/demandes/non-supprimees",
                    
                    // ElevenLabs endpoints (client only)
                    "/api/elevenlabs/**",
                    
                    // Facture endpoints (client only)
                    "/api/factures/client/{clientUuid}",
                    "/api/factures/statut/{statut}",
                    "/api/factures/date/{date}",
                    
                    // Project endpoints (client only)
                    "/api/projects",
                    "/api/projects/{uuid}",
                    "/api/projects/speaker/{uuid}",
                    "/api/projects/**",
                    
                    // Reservation Studio endpoints (client only)
                    "/api/reservations",
                    "/api/reservations/by-date",
                    "/api/reservations/**",
                    
                    // Speaker endpoints (client only)
                    "/api/speakers",
                    
                    // Transactions endpoints (client only)
                    "/api/transactions",
                    "/api/transactions/**",
                    
                    // Utilisateur endpoints (client only)
                    "/utilisateurs",
                    "/utilisateurs/**"
                ).hasAuthority("client:read")
                
                // Default permit all for any remaining endpoints
                .anyRequest().permitAll()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .logout(logout -> logout.logoutUrl("/api/v1/auth/logout")
                .addLogoutHandler(logoutHandler)
                .logoutSuccessHandler((request, response, authentication) -> 
                    SecurityContextHolder.clearContext()));

        return http.build();
    }

    @Bean
    public CorsConfiguration corsConfiguration() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
            "http://localhost:4200",
            "http://localhost:4201",
            "http://localhost:4202",
            "https://admin.castingvoixoff.ma",
            "https://speaker.castingvoixoff.ma",
            "https://castingvoixoff.ma"));
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