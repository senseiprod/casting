package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.action.ActionDarija;
import com.example.senseiVoix.dtos.action.ActionRequest;
import com.example.senseiVoix.dtos.action.ActionResponse;
import com.example.senseiVoix.dtos.action.BankTransferResponse;
import com.example.senseiVoix.entities.*;
import com.example.senseiVoix.enumeration.ActionAccessType;
import com.example.senseiVoix.enumeration.StatutAction;
import com.example.senseiVoix.enumeration.TypeAudio;
import com.example.senseiVoix.repositories.*;
import com.example.senseiVoix.services.*; // Updated to import all services
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.transaction.Transactional;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ActionServiceImpl {

    private static final Logger log = LoggerFactory.getLogger(ActionServiceImpl.class);
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
    @Autowired
    private LahajatiService lahajatiService;
    @Autowired
    private NotificationService notificationService;

    // ###############################################################
    // ############# NEW DEPENDENCIES FOR EARNINGS LOGIC #############
    // ###############################################################
    @Autowired
    private Voix2Service voix2Service;


    // FIXED RIB FOR BANK TRANSFERS
    private static final String COMPANY_RIB = "FR76 1234 5678 9012 3456 7890 123";
    private static final String BANK_NAME = "CIH";
    private static final String ACCOUNT_HOLDER = "SenseiVoix SARL";

    @PostConstruct
    public void init() {
        loadBadWords();
    }

    // ###############################################################
    // ############# NEW HELPER METHOD FOR SPEAKER EARNINGS ##########
    // ###############################################################
    /**
     * Checks if a voice is a "Managed Voice" and processes speaker earnings if it is.
     * This method is called after payment is confirmed but before audio is generated.
     *
     * @param action The action being processed.
     * @param voiceId The ElevenLabs or Lahajati voice ID used for the action.
     */
    private void processSpeakerEarnings(Action action, String voiceId) {
        log.info("Checking if voice ID '{}' is a managed voice for action ID {}.", voiceId, action.getId());
        Voix2 managedVoice = voix2Service.findByElevenlabsId(voiceId);

        // If a managed voice is found, process the earnings for the associated speaker.
        if (managedVoice != null) {
            Speaker speaker = managedVoice.getSpeaker();
            if (speaker != null && speaker.getPercentage() != null && speaker.getPercentage() > 0) {
                log.info("Managed voice found. Processing earnings for speaker UUID: {}", speaker.getUuid());

                double transactionPrice = calculatePrice(action.getText());
                double speakerShare = transactionPrice * (speaker.getPercentage() / 100.0);

                // Ensure earnings are not null before adding to them
                double currentEarnings = speaker.getEarnings();
                speaker.setEarnings(currentEarnings + speakerShare);

                speakerRepository.save(speaker);
                log.info("Successfully updated earnings for speaker {}. New balance: {}", speaker.getUuid(), speaker.getEarnings());
            } else {
                log.warn("Managed voice {} found, but speaker {} has no percentage set. No earnings processed.", voiceId, speaker != null ? speaker.getUuid() : "null");
            }
        } else {
            log.info("Voice ID '{}' is not a managed voice. No speaker earnings to process.", voiceId);
        }
    }


    // EXISTING METHODS (keeping all your existing code)
    // In file: ActionServiceImpl.java

    public Action createAction(String text, String statutAction, String voiceUuid, String utilisateurUuid,
                               String language, String projectUuid, org.springframework.web.multipart.MultipartFile audioFile)
            throws IOException {
        Action action1 = new Action();
        action1.setProject(projectRepository.findByUuidAndDeletedFalse(projectUuid));
        action1.setUtilisateur(utilisateurRepository.findByUuid(utilisateurUuid));
        action1.setStatutAction(StatutAction.EN_ATTENTE); // The service correctly sets the initial status
        action1.setText(text);
        action1.setLanguage(language);
        action1.setVoice(voixRepository.findByUuid(voiceUuid));
        action1.setAudioGenerated(audioFile.getBytes());
        action1.setActionAccessType(ActionAccessType.FREE);

        // Save the entity and store the result (which includes the generated ID, UUID, etc.)
        Action savedAction = actionRepository.save(action1);

        // Send notification for action creation
        Utilisateur user = utilisateurRepository.findByUuid(utilisateurUuid);
        notificationService.notifyActionCreated(user, savedAction.getUuid());

        // Return the newly created and saved action
        return savedAction;
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

        // Send notification for action creation
        Utilisateur user = utilisateurRepository.findByUuid(utilisateurUuid);
        notificationService.notifyActionCreated(user, action1.getUuid());
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

        // Send push notifications
        notificationService.notifyActionCreated(utilisateur, actionUuid);
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

        // Notify user of successful audio generation
        notificationService.notifyAudioGenerated(action.getUtilisateur(), actionUuid);
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

        // Send notifications
        notificationService.notifyActionCreated(utilisateur, newAction.getUuid());
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
        action.setActionAccessType(ActionAccessType.PAYED);
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

        Action savedAction = actionRepository.save(action);

        // Send notification for action creation
        if (savedAction.getUtilisateur() != null) {
            notificationService.notifyActionCreated(savedAction.getUtilisateur(), savedAction.getUuid());
        }

        return savedAction;
    }

    public Action createInitial(ActionDarija actionRequest) {
        Action action = new Action();
        action.setText(actionRequest.getText());
        action.setLanguage(actionRequest.getLanguage());
        action.setStatutAction(StatutAction.EN_ATTENTE);
        action.setActionAccessType(ActionAccessType.PAYED);
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

        Action savedAction = actionRepository.save(action);

        // Send notification for action creation
        if (savedAction.getUtilisateur() != null) {
            notificationService.notifyActionCreated(savedAction.getUtilisateur(), savedAction.getUuid());
        }

        return savedAction;
    }

    public double calculatePrice(String text) {
        if (text == null || text.isEmpty()) {
            return 0.0;
        }
        return text.length() * 0.9;
    }

    @Transactional
    public Action generateAudioAndUpdateAction(Long actionId, String voiceId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new RuntimeException("Action not found"));

        // ###############################################################
        // ############# NEW EARNINGS LOGIC IMPLEMENTATION ###############
        // ###############################################################
        processSpeakerEarnings(action, voiceId);

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

            Action savedAction = actionRepository.save(action);

            // Send notification for successful audio generation
            notificationService.notifyAudioGenerated(action.getUtilisateur(), action.getUuid());

            return savedAction;

        } catch (Exception e) {
            action.setStatutAction(StatutAction.REJETE);
            actionRepository.save(action);

            // Send notification for failed audio generation
            notificationService.notifyAudioGenerationFailed(action.getUtilisateur(), action.getUuid(), e.getMessage());

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

            // Notify admins that validation is required
            notificationService.notifyAdminValidationRequired(action.getUuid(), libelle);

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

        // Send notification for bank transfer rejection
        notificationService.notifyBankTransferRejected(action.getUtilisateur(), action.getUuid(), "Virement bancaire rejeté par l'administrateur");
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

    // ###############################################################
    // ############## LAHAJATI VOICE GENERATION WORKFLOW #############
    // ###############################################################

    /**
     * Generates audio using the Lahajati service and updates the action.
     * This method is called after a payment is successfully processed (for both PayPal and Bank Transfer).
     * The logic is identical to the ElevenLabs version but calls LahajatiService.
     *
     * @param actionId The ID of the action to process.
     * @param voiceId  The Lahajati voice ID to use for generation.
     * @return The updated Action entity.
     */
    @Transactional
    public Action generateLahajatiAudioAndUpdateAction(Long actionId, String voiceId) {
        log.info("Inside generateLahajatiAudio for actionId {}, voiceId {}", actionId, voiceId);
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new RuntimeException("Action not found with ID: " + actionId));

        // ###############################################################
        // ############# NEW EARNINGS LOGIC IMPLEMENTATION ###############
        // ###############################################################
        processSpeakerEarnings(action, voiceId);

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", action.getText());
            requestBody.put("id_voice", voiceId);
            requestBody.put("professional_quality", true);
            log.info("Sending request to Lahajati API with body: {}", requestBody);

            ResponseEntity<byte[]> responseEntity = lahajatiService.textToSpeechPro(requestBody);
            log.info("Received response from Lahajati API with status code: {}", responseEntity.getStatusCode());

            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.hasBody()) {
                byte[] audioData = responseEntity.getBody();
                action.setAudioGenerated(audioData);
                action.setStatutAction(StatutAction.GENERE);
                log.info("Successfully updated action {} with generated audio.", actionId);

                Action savedAction = actionRepository.save(action);

                // Send notification for successful audio generation
                notificationService.notifyAudioGenerated(action.getUtilisateur(), action.getUuid());

                return savedAction;

            } else {
                throw new RuntimeException("Failed to generate audio from Lahajati, status: " + responseEntity.getStatusCode() + ", Body: " + new String(responseEntity.getBody()));
            }

        } catch (Exception e) {
            log.error("EXCEPTION in generateLahajatiAudioAndUpdateAction for actionId {}:", actionId, e);
            action.setStatutAction(StatutAction.REJETE);
            actionRepository.save(action);

            // Send notification for failed audio generation
            notificationService.notifyAudioGenerationFailed(action.getUtilisateur(), action.getUuid(), e.getMessage());

            throw new RuntimeException("Failed to generate Lahajati audio: " + e.getMessage(), e);
        }
    }

    public void setBalanceClient(String uuid, Double balance) {
        Utilisateur utilisateur = utilisateurRepository.findByUuid(uuid);
        if (utilisateur instanceof Client) {
            Client client = (Client) utilisateur;
            double oldBalance = client.getBalance();
            client.setBalance(client.getBalance() - balance);
            utilisateurRepository.save(client);

            // Send notification for balance update
            notificationService.notifyBalanceUpdated(client, client.getBalance());
        } else {
            throw new RuntimeException("Utilisateur is not a Client");
        }
    }


// ###############################################################
// ############# BALANCE-BASED ACTION GENERATION METHODS ########
// ###############################################################


 @Transactional
 public void generateElevenLabsAudioWithBalance(String text, String statutAction, String voiceUuid, String utilisateurUuid,
 String language, String projectUuid, org.springframework.web.multipart.MultipartFile audioFile) throws IOException {
        Action action1 = new Action();
        action1.setProject(projectRepository.findByUuidAndDeletedFalse(projectUuid));
        action1.setUtilisateur(utilisateurRepository.findByUuid(utilisateurUuid));
        action1.setStatutAction(StatutAction.EN_ATTENTE);
        action1.setActionAccessType(ActionAccessType.PAYED);
        action1.setText(text);
        action1.setLanguage(language);
        action1.setVoice(voixRepository.findByUuid(voiceUuid));
        action1.setAudioGenerated(audioFile.getBytes());
        actionRepository.save(action1);

        // Send notification for action creation
        Client user = (Client) utilisateurRepository.findByUuid(utilisateurUuid);
        user.setBalance(user.getBalance() - calculatePrice(text));
        notificationService.notifyActionCreated(user, action1.getUuid());
}


@Transactional
public void generateLahajatiAudioWithBalance(String text, String statutAction, String voiceUuid, String utilisateurUuid,
String language, String projectUuid) {
       Action action1 = new Action();
       action1.setProject(projectRepository.findByUuidAndDeletedFalse(projectUuid));
       action1.setUtilisateur(utilisateurRepository.findByUuid(utilisateurUuid));
       action1.setStatutAction(StatutAction.EN_ATTENTE);
       action1.setActionAccessType(ActionAccessType.PAYED);
       action1.setText(text);
       action1.setLanguage(language);
       action1.setVoice(voixRepository.findByUuid(voiceUuid));
       Action action =  actionRepository.save(action1);
       generateLahajatiAudioAndUpdateAction(action.getId(), voiceUuid);
       // Send notification for action creation
       Client user = (Client) utilisateurRepository.findByUuid(utilisateurUuid);
       user.setBalance(user.getBalance() - calculatePrice(text));
       notificationService.notifyActionCreated(user, action1.getUuid()); 
}

/**
 * Helper method to check if a user has sufficient balance for a given text.
 * 
 * @param utilisateurUuid The UUID of the user
 * @param text The text to be converted to speech
 * @return true if user has sufficient balance, false otherwise
 */
public boolean checkSufficientBalance(String utilisateurUuid, String text) {
    Utilisateur utilisateur = utilisateurRepository.findByUuid(utilisateurUuid);
    if (!(utilisateur instanceof Client)) {
        return false;
    }
    
    Client client = (Client) utilisateur;
    double requiredAmount = calculatePrice(text);
    
    return client.getBalance() >= requiredAmount;
}

/**
 * Gets the current balance of a client.
 * 
 * @param utilisateurUuid The UUID of the user
 * @return The current balance
 * @throws RuntimeException if user is not found or not a client
 */
public double getClientBalance(String utilisateurUuid) {
    Utilisateur utilisateur = utilisateurRepository.findByUuid(utilisateurUuid);
    if (!(utilisateur instanceof Client)) {
        throw new RuntimeException("User is not a Client");
    }
    
    Client client = (Client) utilisateur;
    return client.getBalance();
}



    /**
     * NEW METHOD for creating a locked action for the "Free Test with Project" flow.
     * Generates audio, saves it to the DB with a LOCKED status.
     * @return The created Action entity with the LOCKED status.
     */
    @Transactional
    public Action createLockedAction(ActionRequest request) throws IOException {
        Utilisateur user = utilisateurRepository.findByUuid(request.getUtilisateurUuid());
        if (user == null) {
            throw new RuntimeException("User not found for UUID: " + request.getUtilisateurUuid());
        }

        Project project = projectRepository.findByUuidAndDeletedFalse(request.getProjectUuid());
        if (project == null) {
            throw new RuntimeException("Project not found for UUID: " + request.getProjectUuid());
        }

        // --- Step 1: Generate the audio bytes ---
        byte[] audioData;
        try {
            // This assumes a simple mapping. Add more complex logic if needed.
            if ("darija".equalsIgnoreCase(request.getLanguage())) {
                Map<String, Object> lahajatiRequestBody = new HashMap<>();
                lahajatiRequestBody.put("text", request.getText());
                lahajatiRequestBody.put("id_voice", request.getVoiceUuid());
                lahajatiRequestBody.put("professional_quality", true);
                ResponseEntity<byte[]> responseEntity = lahajatiService.textToSpeechPro(lahajatiRequestBody);
                if (!responseEntity.getStatusCode().is2xxSuccessful() || !responseEntity.hasBody()) {
                    throw new RuntimeException("Failed to generate Lahajati audio.");
                }
                audioData = responseEntity.getBody();
            } else {
                Map<String, Object> elevenLabsRequestBody = new HashMap<>();
                elevenLabsRequestBody.put("text", request.getText());
                Map<String, Object> voiceSettings = new HashMap<>();
                voiceSettings.put("stability", 0.5);
                voiceSettings.put("similarity_boost", 0.5);
                elevenLabsRequestBody.put("voice_settings", voiceSettings);
                audioData = elevenLabsService.textToSpeech(request.getVoiceUuid(), "mp3_44100_128", true, null, elevenLabsRequestBody);
            }
        } catch (Exception e) {
            log.error("Failed to generate audio for locked action", e);
            throw new IOException("Audio generation failed: " + e.getMessage());
        }


        // --- Step 2: Create and save the Action entity ---
        Action action = new Action();
        action.setText(request.getText());
        action.setLanguage(request.getLanguage());
        action.setUtilisateur(user);
        action.setProject(project);
        action.setVoice(voixRepository.findByUuid(request.getVoiceUuid()));

        action.setStatutAction(StatutAction.LOCKED); // <-- Set the new status
        action.setActionAccessType(ActionAccessType.FREE); // It's a free test initially
        action.setAudioGenerated(audioData); // Save the generated audio
        action.setDateCreation(new Date());

        return actionRepository.save(action);
    }

    /**
     * NEW METHOD to unlock an action after successful payment.
     * @param actionId The ID of the action to unlock.
     * @return The updated Action entity.
     */
    @Transactional
    public Action unlockActionAfterPayment(Long actionId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new RuntimeException("Action not found with ID: " + actionId));

        if (action.getStatutAction() != StatutAction.LOCKED) {
            log.warn("Attempted to unlock an action (ID: {}) that was not in LOCKED state. Current state: {}", actionId, action.getStatutAction());
            // Decide if this should be an error or just ignored. For now, we'll proceed but log it.
        }

        action.setStatutAction(StatutAction.GENERE); // Change status to GENERE (unlocked)
        action.setActionAccessType(ActionAccessType.PAYED); // It is now a paid action

        Action unlockedAction = actionRepository.save(action);

        // Notify user that their audio is unlocked and ready
        notificationService.notifyAudioGenerated(unlockedAction.getUtilisateur(), unlockedAction.getUuid());

        return unlockedAction;
    }
}