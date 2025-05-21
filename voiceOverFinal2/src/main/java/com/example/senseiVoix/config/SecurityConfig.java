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
                        "/api/v1/auth/**" };
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
                                .authorizeHttpRequests(req -> req.requestMatchers(WHITE_LIST_URL)
                                                .permitAll()
                                                .requestMatchers("/**").hasAnyAuthority("admin:read")
                                                .requestMatchers("/api/actions/create", "/api/actions/validate/{uuid}",
                                                                "/api/actions/speaker/{uuid}", "/api/actions//notify",
                                                                "/api/actions//reject/{uuid}", "/api/audios/all",
                                                                "/api/audios",
                                                                "/api/audios/download/{id}",
                                                                "/api/audios/speaker/{speakerId}",
                                                                "/api/audios/{id}",
                                                                "/api/audios/audio/{audioId}",
                                                                // ClientController endpoints
                                                                "/api/clients",
                                                                "/api/clients/{id}",
                                                                "/api/clients/uuid/{uuid}",
                                                                // CombinedVoiceController endpoints
                                                                "/api/combined-voices/combined",
                                                                "/api/combined-voices/**",
                                                                // DemandeController endpoints
                                                                "/api/demandes/{id}",
                                                                "/api/demandes/uuid/{uuid}",
                                                                "/api/demandes/demandeur/{uuid}",
                                                                "/api/demandes/update/{uuid}",
                                                                "/api/demandes/delete/{uuid}",
                                                                // ElevenLabsController endpoints
                                                                "/api/elevenlabs/text-to-speech/{voiceId}",
                                                                "/api/elevenlabs/voices/{voiceId}",
                                                                "/api/elevenlabs/voices",
                                                                "/api/elevenlabs/shared-voices",
                                                                // EmailController endpoints
                                                                "/send-test-email",
                                                                // FactureController endpoints
                                                                "/api/factures/{id}",
                                                                "/api/factures",
                                                                "/api/factures/speaker/{speakerUuid}",
                                                                "/api/factures/{id}/uploadPdf",
                                                                "/api/factures/{id}/downloadPdf",
                                                                // FavoriteVoicesController endpoints
                                                                "/api/favorites",
                                                                "/api/favorites/{id}",
                                                                "/api/favorites/**",
                                                                // RecordController endpoints
                                                                "/api/records",
                                                                "/api/records/{uuid}",
                                                                "/api/records/date/{date}",
                                                                "/api/records/range",
                                                                "/api/records/user/{userId}",
                                                                "/api/records/active",
                                                                "/api/records/deleted",
                                                                "/api/records/soft-delete/{uuid}",
                                                                "/api/records/permanent-delete/{uuid}",
                                                                "/api/records/**",
                                                                // ReservationSpeakerController endpoints
                                                                "/api/reservationsSpeaker",
                                                                "/api/reservationsSpeaker/{id}",
                                                                "/api/reservationsSpeaker/user/{userUuid}",
                                                                "/api/reservationsSpeaker/speaker/{speakerUuid}",
                                                                "/api/reservationsSpeaker/date/{date}",
                                                                "/api/reservationsSpeaker/user/{userUuid}/date/{date}",
                                                                "/api/reservationsSpeaker/speaker/{speakerUuid}/date/{date}",
                                                                "/api/reservationsSpeaker/**",
                                                                // ReservationStudioController endpoints
                                                                // "/api/reservations/by-date",
                                                                "/api/reservations/by-date-and-range",
                                                                "/api/reservations/by-date-range",
                                                                "/api/reservations/reserved-hours",
                                                                // SpeakerController endpoints
                                                                "/api/speakers/{id}",
                                                                "/api/speakers/uuid/{uuid}",
                                                                "/api/speakers/email/{email}",
                                                                "/api/speakers/earnings/{earnings}",
                                                                "/api/speakers/active",
                                                                "/api/speakers/search",
                                                                "/api/speakers/uuid/{uuid}",
                                                                // TransactionssController endpoints
                                                                "/api/transactions/{uuid}",
                                                                "/api/transactions/facture/{factureUuid}",
                                                                "/api/transactions/speaker/{speakerUuid}",
                                                                // UtilisateurController endpoints
                                                                "/utilisateurs/{id}/uploadPhoto",
                                                                "/utilisateurs/{id}/photo",
                                                                "/utilisateurs/{id}",
                                                                "/utilisateurs/admin",
                                                                "/utilisateurs/client",
                                                                "/utilisateurs/speaker",
                                                                // Voix2Controller endpoints
                                                                // "/api/voix2/create",
                                                                "/api/voix2/{id}",
                                                                "/api/voix2/all",
                                                                "/api/voix2/speaker-voice/{uuid}",
                                                                // VoixController endpoints
                                                                "/api/voix/{id}",
                                                                "/api/voix/all",
                                                                "/api/voix/speaker-voice/{uuid}")
                                                .hasAnyAuthority("management:read")

                                                .requestMatchers("/api/actions/create",
                                                                "/api/actions/by-project/{uuid}",
                                                                "/api/actions/delete/{uuid}", "/api/audios/all",
                                                                "/api/audios",
                                                                "/api/audios/download/{id}",
                                                                "/api/audios/speaker/{speakerId}",
                                                                "/api/audios/{id}",
                                                                "/api/audios/audio/{audioId}",
                                                                // ClientController endpoints
                                                                "/api/clients",
                                                                "/api/clients/{id}",
                                                                "/api/clients/uuid/{uuid}",
                                                                "/api/clients/email/{email}",
                                                                "/api/clients/fidelite/{fidelite}",
                                                                "/api/clients/not-deleted",
                                                                // CombinedVoiceController endpoints
                                                                "/api/combined-voices/combined",
                                                                "/api/combined-voices/**",
                                                                // DemandeController endpoints
                                                                "/api/demandes",
                                                                "/api/demandes/{id}",
                                                                "/api/demandes/uuid/{uuid}",
                                                                "/api/demandes/demandeur/{uuid}",
                                                                "/api/demandes/en-attente",
                                                                "/api/demandes/acceptees",
                                                                "/api/demandes/refusees",
                                                                "/api/demandes/count/en-attente",
                                                                "/api/demandes/count/acceptees",
                                                                "/api/demandes/count/refusees",
                                                                "/api/demandes/non-supprimees",
                                                                "/api/demandes/update/{uuid}",
                                                                "/api/demandes/delete/{uuid}",
                                                                // ElevenLabsController endpoints
                                                                "/api/elevenlabs/text-to-speech/{voiceId}",
                                                                "/api/elevenlabs/voices/{voiceId}",
                                                                "/api/elevenlabs/voices",
                                                                "/api/elevenlabs/shared-voices",
                                                                "/api/elevenlabs/**",
                                                                // EmailController endpoints
                                                                "/send-test-email",
                                                                // FactureController endpoints
                                                                "/api/factures/{id}",
                                                                "/api/factures/client/{clientUuid}",
                                                                "/api/factures/speaker/{speakerUuid}",
                                                                "/api/factures/statut/{statut}",
                                                                "/api/factures/date/{date}",
                                                                "/api/factures/{id}/uploadPdf",
                                                                "/api/factures/{id}/downloadPdf",
                                                                // FavoriteVoicesController endpoints
                                                                "/api/favorites",
                                                                "/api/favorites/{id}",
                                                                "/api/favorites/**",
                                                                // ProjectController endpoints
                                                                "/api/projects",
                                                                "/api/projects/{uuid}",
                                                                "/api/projects/speaker/{uuid}",
                                                                "/api/projects/**",
                                                                // RecordController endpoints
                                                                "/api/records/{uuid}",
                                                                "/api/records/date/{date}",
                                                                "/api/records/range",
                                                                "/api/records/user/{userId}",
                                                                "/api/records/active",
                                                                "/api/records/deleted",
                                                                "/api/records/soft-delete/{uuid}",
                                                                "/api/records/permanent-delete/{uuid}",
                                                                "/api/records/**",
                                                                // ReservationSpeakerController endpoints
                                                                "/api/reservationsSpeaker",
                                                                "/api/reservationsSpeaker/{id}",
                                                                "/api/reservationsSpeaker/user/{userUuid}",
                                                                "/api/reservationsSpeaker/speaker/{speakerUuid}",
                                                                "/api/reservationsSpeaker/date/{date}",
                                                                "/api/reservationsSpeaker/user/{userUuid}/date/{date}",
                                                                "/api/reservationsSpeaker/speaker/{speakerUuid}/date/{date}",
                                                                "/api/reservationsSpeaker/**",
                                                                // ReservationStudioController endpoints
                                                                "/api/reservations",
                                                                "/api/reservations/by-date",
                                                                "/api/reservations/by-date-and-range",
                                                                "/api/reservations/by-date-range",
                                                                "/api/reservations/reserved-hours",
                                                                "/api/reservations/**",
                                                                // SpeakerController endpoints
                                                                "/api/speakers",
                                                                "/api/speakers/{id}",
                                                                "/api/speakers/uuid/{uuid}",
                                                                "/api/speakers/email/{email}",
                                                                "/api/speakers/earnings/{earnings}",
                                                                "/api/speakers/active",
                                                                "/api/speakers/search",
                                                                "/api/speakers/uuid/{uuid}",
                                                                // TransactionssController endpoints
                                                                "/api/transactions",
                                                                "/api/transactions/{uuid}",
                                                                "/api/transactions/facture/{factureUuid}",
                                                                "/api/transactions/speaker/{speakerUuid}",
                                                                "/api/transactions/**",
                                                                // UtilisateurController endpoints
                                                                "/utilisateurs/{id}/uploadPhoto",
                                                                "/utilisateurs/{id}/photo",
                                                                "/utilisateurs",
                                                                "/utilisateurs/{id}",
                                                                "/utilisateurs/admin",
                                                                "/utilisateurs/client",
                                                                "/utilisateurs/speaker",
                                                                "/utilisateurs/**",
                                                                // Voix2Controller endpoints
                                                                "/api/voix2/{id}",
                                                                "/api/voix2/all",
                                                                "/api/voix2/speaker-voice/{uuid}",
                                                                // VoixController endpoints
                                                                "/api/voix/{id}",
                                                                "/api/voix/all",
                                                                "/api/voix/speaker-voice/{uuid}")
                                                .hasAnyAuthority("client:read")

                                                .anyRequest()
                                                .permitAll())
                                .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                                .logout(logout -> logout.logoutUrl("/api/v1/auth/logout")
                                                .addLogoutHandler(logoutHandler)
                                                .logoutSuccessHandler(
                                                                (request, response,
                                                                                authentication) -> SecurityContextHolder
                                                                                                .clearContext()));

                return http.build();
        }

        @Bean
        public CorsConfiguration corsConfiguration() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(List.of(
                                "http://localhost:4200",
                                "http://localhost:4201",
                                "http://localhost:4202"));
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
