package com.example.senseiVoix.services.serviceImp;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);


    public void sendDmandeRecord(String to, String demandeurNom, LocalDate date) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Notification du demande");
        message.setText("Cher(e) " + demandeurNom + ",\n\n" +
                "Nous vous informons que votre demande est bient ressu" + date + ".\n" +
                "Nous avons bien reçu votre demande concernant reservation d'un seance de record .\n" +
                "Avant de la traiter, nous vous informons que celle-ci doit être confirmée dans un\n" +
                " délai de 24 heures.\n" +
                "📌 Que devez-vous faire ?\n" +
                "Aucune action de votre part n’est requise pour l’instant. Notre équipe examinera votre \n" +
                "demande et vous enverra une confirmation définitive une fois celle-ci validée.\n" +
                "⏳ Délais de confirmation\n" + //
                "Votre demande sera confirmée dans un délai maximum de 24 heures. Vous recevrez un email\n" +
                " dès qu’elle sera approuvée.\n" +
                "Si vous avez des questions, n’hésitez pas à nous contacter.\n" +
                "Cordialement,\n" +
                "Sensei prod \n" +
                "senseiprod.ma");

        emailSender.send(message);
    }
    public void sendLoginInformation(String to, String password, String peakerNom , String lastName){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Login Information");
        message.setText("Cher(e) " + peakerNom +" "+lastName+ ",\n\n" +
                "Voici votre information pour accédé a le platform de voix off .\n"+
                "votre username est : " + to + ".\n" +
                "Votre password est : " + password + "\n\n" +
                "Cordialement,\n" +
                "Sensei prod \n" +
                "senseiprod.ma");

        emailSender.send(message);

    }

    public void sendCalendarInvitation(String to, String subject, String description,
                                       LocalDateTime startDateTime, LocalDateTime endDateTime,
                                       String location) throws MessagingException, IOException {

        // Format des dates pour l'événement (Format standard UTC pour les calendriers)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
        String start = startDateTime.format(formatter);
        String end = endDateTime.format(formatter);

        //Création du fichier ICS (Calendrier)
        String icsContent = "BEGIN:VCALENDAR\n" +
                "VERSION:2.0\n" +
                "PRODID:-//SenseiProd//Calendrier//FR\n" +
                "BEGIN:VEVENT\n" +
                "UID:" + System.currentTimeMillis() + "@senseiprod.ma\n" +
                "SUMMARY:" + subject + "\n" +
                "DESCRIPTION:" + description + "\n" +
                "DTSTART:" + start + "\n" +
                "DTEND:" + end + "\n" +
                "LOCATION:" + location + "\n" +
                "END:VEVENT\n" +
                "END:VCALENDAR";

        // Création de l'email avec une pièce jointe
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

        helper.setTo(to);
        helper.setSubject("Invitation : " + subject);
        helper.setText("Cher(e),\n\n" +
                "Vous êtes invité(e) à l'événement suivant :\n\n" +
                "📌 **Titre** : " + subject + "\n" +
                "📅 **Date** : " + startDateTime.toLocalDate() + "\n" +
                "🕒 **Heure** : " + startDateTime.toLocalTime() + " - " + endDateTime.toLocalTime() + "\n" +
                "📍 **Lieu** : " + location + "\n\n" +
                "Veuillez trouver ci-joint l'invitation à ajouter à votre calendrier.\n\n" +
                "Cordialement,\n" +
                "Sensei prod \n" +
                "senseiprod.ma");

        helper.addAttachment("invitation.ics", new ByteArrayDataSource(icsContent, "text/calendar"));

        emailSender.send(message);
    }

    public void sendNotificationGeneration(String to, String demandeurNom, LocalDate date) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Notification du demande");
        message.setText("Cher(e) " + demandeurNom + ",\n\n" +
                "Nous vous informons que votre demande est bient ressu" + date + ".\n" +
                "Nous avons bien reçu votre demande concernant reservation d'un seance de record .\n" +
                "Avant de la traiter, nous vous informons que celle-ci doit être confirmée dans un\n" +
                " délai de 24 heures.\n" +
                "📌 Que devez-vous faire ?\n" +
                "Aucune action de votre part n’est requise pour l’instant. Notre équipe examinera votre \n" +
                "demande et vous enverra une confirmation définitive une fois celle-ci validée.\n" +
                "⏳ Délais de confirmation\n" + //
                "Votre demande sera confirmée dans un délai maximum de 24 heures. Vous recevrez un email\n" +
                " dès qu’elle sera approuvée.\n" +
                "Si vous avez des questions, n’hésitez pas à nous contacter.\n" +
                "Cordialement,\n" +
                "Sensei prod \n" +
                "senseiprod.ma");

        emailSender.send(message);
    }

    public void NotificationSpeaker(String to, String demandeurNom, LocalDate date , String text ) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Notification du demande");
        message.setText("Cher(e) " + demandeurNom + ",\n\n" +
                "Nous vous informons que votre demande est bient ressu" + date + ".\n" +
                "Nous avons bien reçu votre demande concernant reservation d'un seance de record .\n" +
                "Avant de la traiter, nous vous informons que celle-ci doit être confirmée dans un\n" +
                " délai de 24 heures.\n" +
                "📌 Que devez-vous faire ?\n" +
                "Aucune action de votre part n’est requise pour l’instant. Notre équipe examinera votre \n" +
                "demande et vous enverra une confirmation définitive une fois celle-ci validée.\n" +
                "⏳ Délais de confirmation\n" + //
                "Votre demande sera confirmée dans un délai maximum de 24 heures. Vous recevrez un email\n" +
                " dès qu’elle sera approuvée.\n" +
                "Si vous avez des questions, n’hésitez pas à nous contacter.\n" +
                "Cordialement,\n" +
                "Sensei prod \n" +
                "senseiprod.ma");

        emailSender.send(message);
    }

    /**
     * Sends a registration confirmation email to the new speaker.
     * @param to The recipient's email address.
     * @param fullName The full name of the person who registered.
     */
    public void sendRegistrationConfirmation(String to, String fullName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Welcome to SenseiVoix! Your Registration is Complete.");
        message.setText("Cher(e) " + fullName + ",\n\n" +
                "Nous vous remercions de votre inscription sur Castingvoixoff !\n\n" +
                "Nous avons bien reçu vos informations. Notre équipe examinera votre profil et vous contactera prochainement si des détails supplémentaires sont nécessaires.\n\n" +
                "Nous sommes ravis de vous compter parmi notre communauté d'artistes voix-off talentueux.\n\n" +
                "Cordialement,\n" +
                "L'équipe CastingVoixoff\n" +
                "castingvoixoff.ma");

        emailSender.send(message);
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset Request");
        
        String resetUrl = frontendUrl + "/reset?token=" + resetToken;
        String emailBody = "Hello,\n\n" +
                "You have requested to reset your password. Please click the link below to reset your password:\n\n" +
                resetUrl + "\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you did not request this password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "SenseiVoix Team";
        
        message.setText(emailBody);
        
        try {
                emailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    public void sendVerificationEmail(String email, String token) {
        // MODIFICATION: Construct the full, correct URL including "/v1"
        String verificationUrl = frontendUrl + "/api/v1/auth/verify-email?token=" + token;

        String subject = "Email Verification";
        String body = "Click the link to verify your email: " + verificationUrl;

        // --- For Local Testing ---
        log.info("--- EMAIL VERIFICATION LINK ---");
        log.info("To: {}", email);
        log.info("Full Link: {}", verificationUrl);
        log.info("-------------------------------");

        // --- For Production ---
        // This will now send the correct link in the real email
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // It's good practice to set a 'From' address
            message.setFrom("noreply@castingvoixoff.ma");
            message.setTo(email);
            message.setSubject(subject);
            message.setText(body);
            emailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}", email, e);
        }
    }
}

