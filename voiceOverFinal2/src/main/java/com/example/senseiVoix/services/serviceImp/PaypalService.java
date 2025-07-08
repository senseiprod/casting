package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.services.UtilisateurService;
import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;

@Service
public class PaypalService {
    private final APIContext apiContext;
    private final UtilisateurService utilisateurService;

    public PaypalService(UtilisateurService utilisateurService) {
        this.apiContext = new APIContext("AaV2BlAHHAEvs-ZDMaHvo6Hm14r_hGIeFOQ-MIjIXtDbJ39nshBbTLYOV3_kqXmWgbDwPIkdBISmk8v-", "ENDi-hHI53RmCaVBzT-lCyAm3flSOJslux-m277PTsUEFTWUsfTV0qhz95P627fuXgSndIALYjMrZLZd", "sandbox");
        this.utilisateurService = utilisateurService;
    }

    //changes

    @Value("${paypal.client.id}")
    private String clientId;

    @Value("${paypal.client.secret}")
    private String clientSecret;

    @Value("${paypal.mode}")
    private String mode;

    public APIContext getAPIContext() {
        return new APIContext(clientId, clientSecret, mode);
    }

    //changes

    public Payment createPayment(Double total, String currency, String method, String intent, String description,
                                 String cancelUrl, String successUrl, String clientUuid) throws PayPalRESTException {
        Amount amount = new Amount();
        amount.setCurrency(currency);
        String formattedAmount = String.format(Locale.ENGLISH, "%.2f", total);

        System.out.println("Formatted Amount: " + formattedAmount);
        amount.setTotal(formattedAmount);

        Transaction transaction = new Transaction();
        transaction.setDescription(description);
        transaction.setAmount(amount);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod(method);

        Payment payment = new Payment();
        payment.setIntent(intent);
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl);
        payment.setRedirectUrls(redirectUrls);






        return payment.create(apiContext);
    }

    public Payment executePayment(String paymentId, String payerId) throws PayPalRESTException {
        Payment payment = new Payment();
        payment.setId(paymentId);
        PaymentExecution paymentExecution = new PaymentExecution();
        paymentExecution.setPayerId(payerId);
        return payment.execute(apiContext, paymentExecution);
    }

    public void refundPayment(String paymentId,Double total) throws PayPalRESTException {
        Sale sale = new Sale();
        sale.setId(paymentId);

        RefundRequest refundRequest = new RefundRequest();
        Amount amount = new Amount();
        amount.setCurrency("USD");
        amount.setTotal(String.valueOf(total)); // Montant à adapter dynamiquement
        refundRequest.setAmount(amount);

        sale.refund(apiContext, refundRequest);
    }

    public String sendMoneyThroughPayouts(String recipientEmail, Double amount, String currency, String note, String senderUuid)
            throws PayPalRESTException {
        try {
            // Format the amount properly
            String formattedAmount = String.format("%.2f", amount).replace(",", ".");

            // Create a unique batch ID
            String batchId = "batch_" + System.currentTimeMillis();

            // Create the JSON payload directly
            String payloadJson = "{"
                    + "\"sender_batch_header\": {"
                    + "  \"sender_batch_id\": \"" + batchId + "\","
                    + "  \"email_subject\": \"You have received a payment\""
                    + "},"
                    + "\"items\": ["
                    + "  {"
                    + "    \"recipient_type\": \"EMAIL\","
                    + "    \"amount\": {"
                    + "      \"value\": \"" + formattedAmount + "\","
                    + "      \"currency\": \"" + currency + "\""
                    + "    },"
                    + "    \"note\": \"" + note + "\","
                    + "    \"sender_item_id\": \"item_" + System.currentTimeMillis() + "\","
                    + "    \"receiver\": \"" + recipientEmail + "\""
                    + "  }"
                    + "]"
                    + "}";

            // Create the HTTP connection
            HttpURLConnection connection = (HttpURLConnection) new URL("https://api.sandbox.paypal.com/v1/payments/payouts").openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            String accessToken = getAccessToken();
            connection.setRequestProperty("Authorization", "Bearer " + accessToken);
            connection.setDoOutput(true);

            // Write the payload
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = payloadJson.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // Process response
            int responseCode = connection.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                // Read the response
                StringBuilder response = new StringBuilder();
                try (BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        response.append(line);
                    }
                }

                // Parse the response to get the batch ID
                JSONObject jsonResponse = new JSONObject(response.toString());
                String payoutBatchId = jsonResponse.getJSONObject("batch_header").getString("payout_batch_id");

                // Record the transaction in your system
                Utilisateur sender = utilisateurService.findById(senderUuid);
                if (sender == null) {
                    throw new PayPalRESTException("Sender not found");
                }

                // Return the batch ID for tracking
                return payoutBatchId;
            } else {
                // Read the error response
                StringBuilder errorResponse = new StringBuilder();
                try (BufferedReader br = new BufferedReader(new InputStreamReader(connection.getErrorStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        errorResponse.append(line);
                    }
                }

                throw new PayPalRESTException("Failed to create payout: " + errorResponse.toString());
            }
        } catch (Exception e) {
            throw new PayPalRESTException("Error creating payout: " + e.getMessage(), e);
        }
    }

    // Make sure you're properly obtaining a fresh token before making API calls
    private String getAccessToken() throws PayPalRESTException {
        String clientId = "AWa3HYTtvjD5b6D9Bstx0zDzJeEv6ew7eM2_mjbLDsy8LkGopVmlOnb_1kuopFw-Zb8tAI7078O5yKFH";
        String clientSecret = "EFKlurD8xdxztwwfbpgh-5k2In86jMG6_wvra_xhqMtsXzcdid7Ob-v51nsCEpnMzL87V2m5Y457abkO";

        try {
            String auth = Base64.getEncoder().encodeToString((clientId + ":" + clientSecret).getBytes());

            URL url = new URL("https://api.sandbox.paypal.com/v1/oauth2/token");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Accept", "application/json");
            connection.setRequestProperty("Accept-Language", "en_US");
            connection.setRequestProperty("Authorization", "Basic " + auth);
            connection.setDoOutput(true);

            String params = "grant_type=client_credentials";
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = params.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = connection.getResponseCode();
            if (responseCode == 200) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        response.append(line);
                    }

                    JSONObject jsonResponse = new JSONObject(response.toString());
                    return jsonResponse.getString("access_token");
                }
            } else {
                throw new PayPalRESTException("Failed to get access token. Response code: " + responseCode);
            }
        } catch (Exception e) {
            throw new PayPalRESTException("Error getting access token: " + e.getMessage(), e);
        }
    }


    //changes start here

    public Payment createPayment(
            Double total,
            String currency,
            String description,
            String cancelUrl,
            String successUrl) throws PayPalRESTException {

        Amount amount = new Amount();
        amount.setCurrency(currency);
        amount.setTotal(String.format(Locale.ENGLISH, "%.2f", total));


        Transaction transaction = new Transaction();
        transaction.setDescription(description);
        transaction.setAmount(amount);

        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");

        Payment payment = new Payment();
        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(transactions);

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl);
        redirectUrls.setReturnUrl(successUrl);
        payment.setRedirectUrls(redirectUrls);

        return payment.create(getAPIContext());
    }

    public Payment executePayment2(String paymentId, String payerId) throws PayPalRESTException {
        Payment payment = new Payment();
        payment.setId(paymentId);

        PaymentExecution paymentExecution = new PaymentExecution();
        paymentExecution.setPayerId(payerId);

        return payment.execute(getAPIContext(), paymentExecution);
    }
}
