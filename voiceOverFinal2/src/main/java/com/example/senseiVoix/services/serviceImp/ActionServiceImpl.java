package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.action.ActionRequest;
import com.example.senseiVoix.dtos.action.ActionResponse;
import com.example.senseiVoix.dtos.action.BankTransferResponse;
import com.example.senseiVoix.entities.*;
import com.example.senseiVoix.enumeration.PaymentStatus;
import com.example.senseiVoix.enumeration.StatutAction;
import com.example.senseiVoix.enumeration.TypeAudio;
import com.example.senseiVoix.repositories.*;
import com.example.senseiVoix.services.ElevenLabsService;
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
import java.time.LocalDate;
import java.util.*;
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
    @Autowired
    private ElevenLabsService elevenLabsService;

    // FIXED RIB FOR BANK TRANSFERS
    private static final String COMPANY_RIB = "FR76 1234 5678 9012 3456 7890 123";
    private static final String BANK_NAME = "Banque Exemple";
    private static final String ACCOUNT_HOLDER = "SenseiVoix SARL";

    @PostConstruct
    public void init() {
        loadBadWords();
    }

    // EXISTING METHODS (keeping all your existing code)
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
                badWords = new ArrayList<>();
                System.out.println("Warning: bad-words.txt not found, using empty list");
            }
        } catch (IOException e) {
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

    // PAYPAL METHODS (EXISTING)
    public Action createInitialAction(ActionRequest actionRequest) {
        Action action = new Action();
        action.setText(actionRequest.getText());
        action.setLanguage(actionRequest.getLanguage());
        action.setStatutAction(StatutAction.EN_ATTENTE);
        action.setDateCreation(new Date());

        // DON'T STORE VOICE ID IN DATABASE - it goes to tempVoiceStorage

        if (actionRequest.getUtilisateurUuid() != null) {
            Utilisateur utilisateur = utilisateurRepository.findByUuid(actionRequest.getUtilisateurUuid());
            if (utilisateur == null) throw new RuntimeException("User not found");
            action.setUtilisateur(utilisateur);
        }

        if (actionRequest.getProjectUuid() != null) {
            Object rawProject = projectRepository.findByUuid(actionRequest.getProjectUuid())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            Project project = (Project) rawProject;
            action.setProject(project);
        }

        return actionRepository.save(action);
    }

    public double calculatePrice(String text) {
        if (text == null || text.isEmpty()) {
            return 0.0;
        }
        return text.length() * 0.9;
    }

    public Action generateAudioAndUpdateAction(Long actionId, String voiceId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new RuntimeException("Action not found"));

        try {
            // Prepare request body for ElevenLabs API
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", action.getText());

            // Add voice settings
            Map<String, Object> voiceSettings = new HashMap<>();
            voiceSettings.put("stability", 0.5);
            voiceSettings.put("similarity_boost", 0.5);
            requestBody.put("voice_settings", voiceSettings);

            // Use the voice ID provided by user directly
            byte[] audioData = elevenLabsService.textToSpeech(
                    voiceId, // Voice ID provided by user
                    "mp3_44100_128",
                    true,
                    null,
                    requestBody
            );

            // Update action with generated audio
            action.setAudioGenerated(audioData);
            action.setStatutAction(StatutAction.GENERE);

            return actionRepository.save(action);

        } catch (Exception e) {
            action.setStatutAction(StatutAction.REJETE);
            actionRepository.save(action);
            throw new RuntimeException("Failed to generate audio: " + e.getMessage());
        }
    }

    public void cancelAction(Long actionId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new RuntimeException("Action not found"));

        action.setStatutAction(StatutAction.REJETE);
        actionRepository.save(action);
    }

    // NEW BANK TRANSFER METHODS (UPDATED TO MATCH PAYPAL PATTERN)

    public BankTransferResponse createBankTransferResponse(Action action, String text) {
        try {
            // Generate unique libellé and update action
            String libelle = generateUniqueLibelle();
            action.setLibelle(libelle);
            actionRepository.save(action);

            // Calculate price
            double price = calculatePrice(text);

            // Create response
            BankTransferResponse response = new BankTransferResponse();
            response.setActionId(action.getId());
            response.setLibelle(libelle);
            response.setRib(COMPANY_RIB);
            response.setPrice(price);
            response.setBankName(BANK_NAME);
            response.setAccountHolder(ACCOUNT_HOLDER);
            response.setMessage("Action créée avec succès. Effectuez le virement bancaire avec le libellé fourni.");

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Failed to create bank transfer response: " + e.getMessage());
        }
    }

    private String generateUniqueLibelle() {
        String prefix = "SV";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.valueOf((int)(Math.random() * 1000));
        return prefix + timestamp.substring(timestamp.length() - 8) + random;
    }

    public List<Action> getPendingBankTransferActions() {
        return actionRepository.findAll().stream()
                .filter(action -> action.getStatutAction() == StatutAction.EN_ATTENTE)
                .filter(action -> action.getLibelle() != null && !action.getLibelle().isEmpty())
                .collect(Collectors.toList());
    }

    public void rejectBankTransferAction(Long actionId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new RuntimeException("Action not found"));

        action.setStatutAction(StatutAction.REJETE);
        actionRepository.save(action);
    }

    public Action getActionByLibelle(String libelle) {
        return actionRepository.findAll().stream()
                .filter(action -> libelle.equals(action.getLibelle()))
                .findFirst()
                .orElse(null);
    }

    public ActionResponse getActionsUuid(String uuid) {
        Action action = actionRepository.findByUuid(uuid);
        ActionResponse action1 = new ActionResponse();
        action1.setStatutAction(StatutAction.EN_ATTENTE);
        action1.setText(action.getText());
        action1.setLanguage(action.getLanguage());
        action1.setAudioGenerated(action.getAudioGenerated());
        return action1;
    }
}