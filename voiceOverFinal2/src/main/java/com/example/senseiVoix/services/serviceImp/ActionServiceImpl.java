package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.action.ActionRequest;
import com.example.senseiVoix.dtos.action.ActionResponse;
import com.example.senseiVoix.entities.*;
import com.example.senseiVoix.enumeration.PaymentStatus;
import com.example.senseiVoix.enumeration.StatutAction;
import com.example.senseiVoix.enumeration.TypeAudio;
import com.example.senseiVoix.repositories.*;
import com.example.senseiVoix.services.PlayHtService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.paypal.base.rest.PayPalRESTException;
import jakarta.transaction.Transactional;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import jakarta.annotation.PostConstruct;

@Service
public class ActionServiceImpl {
    @Autowired
    private ActionRepository actionRepository;
    @Autowired
    private SpeakerRepository speakerRepository;
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private VoixRepository voixRepository;
    @Autowired
    private PlayHtService playHtService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private PaypalService paypalService;
    private List<String> badWords;
    @Autowired
    private AudioRepository audioRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private ResourceLoader resourceLoader;

    ActionServiceImpl() {

    }

    @PostConstruct
    public void init() {
        loadBadWords();
    }

    public void createAction(String text, String statutAction, String voiceUuid, String utilisateurUuid,
            String language, String projectUuid, org.springframework.web.multipart.MultipartFile audioFile)
            throws IOException {
        Action action1 = new Action();
        action1.setProject(projectRepository.findByUuidAndDeletedFalse(projectUuid));
        action1.setUtilisateur(utilisateurRepository.findByUuid(utilisateurUuid));
        action1.setStatutAction(StatutAction.EN_ATTENTE);
        action1.setText(text);
        action1.setLanguage(language);
        action1.setVoice(voixRepository.findByUuid(voiceUuid));
        action1.setAudioGenerated(audioFile.getBytes());
        actionRepository.save(action1);
    }

    public void createActionPyee(String text, String statutAction, String voiceUuid, String utilisateurUuid,
            String language, String projectUuid, org.springframework.web.multipart.MultipartFile audioFile)
            throws IOException {
        Action action1 = new Action();
        action1.setProject(projectRepository.findByUuidAndDeletedFalse(projectUuid));
        action1.setUtilisateur(utilisateurRepository.findByUuid(utilisateurUuid));
        action1.setStatutAction(StatutAction.EN_ATTENTE);
        action1.setText(text);
        action1.setLanguage(language);
        action1.setVoice(voixRepository.findByUuid(voiceUuid));
        action1.setAudioGenerated(audioFile.getBytes());
        actionRepository.save(action1);
    }

    public void validateAction(String uuid) throws PayPalRESTException, JsonProcessingException {
        Action action = actionRepository.findByUuid(uuid);
        Payment payment = paymentRepository.findByActionUuid(action.getUuid());
        paypalService.executePayment(payment.getPaypalId(), payment.getPaypalPayerId());
        generateSpeech(uuid);
        action.setStatutAction(StatutAction.VALIDE);
        actionRepository.save(action);

    }

    public void deleteAction(String uuid) {
        Action action = actionRepository.findByUuid(uuid);
        action.setDeleted(true);
        actionRepository.save(action);
    }

    public List<Action> getActionsByProjectUuid(String uuid) {
        return actionRepository.findByProject(uuid);
    }

    public void sendNotification(String utilisateurUuid, String speakerUuid, String actionUuid) {
        Action action = actionRepository.findByUuid(actionUuid);
        Utilisateur utilisateur = utilisateurRepository.findByUuid(utilisateurUuid);
        Speaker speaker = speakerRepository.findByUuid(speakerUuid);
        emailService.sendNotificationGeneration(utilisateur.getEmail(), utilisateur.getNom(), LocalDate.now());
        emailService.NotificationSpeaker(speaker.getEmail(), speaker.getNom(), LocalDate.now(), action.getText());
    }

    public void generateSpeech(String actionUuid) throws JsonProcessingException {
        Action action = actionRepository.findByUuid(actionUuid);
        Voix voix = action.getVoice();
        byte[] audio = playHtService.synthesizeSpeech(action.getText(), voix.getUrl(), action.getLanguage());
        String audioFormat = detectAudioFormat(audio);
        action.setAudioGenerated(audio);
        Audio audio1 = new Audio();
        audio1.setAction(action);
        audio1.setAudioFile(audio);
        audio1.setTypeAudio(TypeAudio.GENERATED);
        audio1.setSpeaker(speakerRepository.getSpeakerByVoix(voix));
        audio1.setFormat(audioFormat);
        audioRepository.save(audio1);

    }

    /**
     * Detects the format of a byte[] audio file.
     */
    private String detectAudioFormat(byte[] audioBytes) {
        Tika tika = new Tika();
        try {
            return tika.detect(new ByteArrayInputStream(audioBytes));
        } catch (IOException e) {
            e.printStackTrace();
            return "unknown";
        }
    }

    private void loadBadWords() {
        try {
            Resource resource = resourceLoader.getResource("classpath:bad-words.txt");
            if (resource.exists()) {
                try (InputStream inputStream = resource.getInputStream();
                        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
                    badWords = reader.lines()
                            .map(String::trim)
                            .filter(line -> !line.isEmpty())
                            .collect(Collectors.toList());
                }
            } else {
                // Fallback if file doesn't exist
                badWords = new ArrayList<>();
                System.out.println("Warning: bad-words.txt not found, using empty list");
            }
        } catch (IOException e) {
            // Provide a fallback instead of throwing an exception
            badWords = new ArrayList<>();
            System.out.println("Warning: Error loading bad-words.txt, using empty list: " + e.getMessage());
        }
    }

    private boolean textVerefication(String text) {
        List<String> words = List.of(text.toLowerCase().split("\\s+"));
        return words.stream().anyMatch(badWords::contains);
    }

    public void saveAction(ActionRequest action) throws JsonProcessingException {
        Action newAction = new Action();
        newAction.setUtilisateur(utilisateurRepository.findByUuid(action.getUtilisateurUuid()));
        newAction.setVoice(voixRepository.findByUuid(action.getVoiceUuid()));
        newAction.setStatutAction(StatutAction.EN_ATTENTE);
        newAction.setText(action.getText());
        newAction.setLanguage(action.getLanguage());

        Voix voix = voixRepository.findByUuid(action.getVoiceUuid());
        Speaker speaker = voix.getSpeaker();
        Utilisateur utilisateur = utilisateurRepository.findByUuid(action.getUtilisateurUuid());

        actionRepository.save(newAction);
        emailService.NotificationSpeaker(speaker.getEmail(), speaker.getNom(), LocalDate.now(), action.getText());
    }

    @Transactional
    public void rejectAction(String actionUuid) throws PayPalRESTException {
        Action action = actionRepository.findByUuid(actionUuid);
        if (action != null) {
            action.setStatutAction(StatutAction.REJETE);
            actionRepository.save(action);
            Payment paymentOpt = paymentRepository.findByActionUuid(actionUuid);
            paypalService.refundPayment(paymentOpt.getPaypalId(), paymentOpt.getAmount());
            paymentOpt.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(paymentOpt);

        }
    }

    public void processPayment(String clientUuid, String actionUuid, Double amount, String paypalId,
            String paypalPayerId) {
        Action action = actionRepository.findByUuid(actionUuid);
        try {
            Payment payment = new Payment();
            payment.setUtilisateur(utilisateurRepository.findByUuid(clientUuid));
            payment.setAmount(amount);
            payment.setPaymentMethod("PAYPAL");
            payment.setStatus(PaymentStatus.PENDING);
            payment.setAction(action);
            payment.setPaypalId(paypalId);
            payment.setPaypalPayerId(paypalPayerId);
            paymentRepository.save(payment);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du paiement : " + e.getMessage());
        }

    }

    public List<ActionResponse> getActionBySpeakerUuid(String uuid) {
        List<Action> actions = actionRepository.findBySpeakerUuid(uuid);

        return actions.stream().map(action -> {
            ActionResponse actionResponse = new ActionResponse();
            actionResponse.setCode(action.getCode());
            actionResponse.setUuid(action.getUuid());
            actionResponse.setText(action.getText());
            actionResponse.setStatutAction(action.getStatutAction());
            actionResponse.setDateCreation(action.getDateCreation());
            actionResponse.setUtilisateurUuid(action.getUtilisateur().getUuid());
            actionResponse.setVoiceUuid(action.getVoice().getUuid());
            return actionResponse;
        }).collect(Collectors.toList());
    }

}
