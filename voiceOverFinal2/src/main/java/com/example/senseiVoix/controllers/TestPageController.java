package com.example.senseiVoix.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * This controller is for serving simple HTML test pages.
 * It is not part of the main API logic.
 */
@RequestMapping("/api/test")
@Controller
public class TestPageController {

    /**
     * Serves the test page for the Lahajati PayPal workflow.
     *
     * @return The path to the HTML template.
     */
    @GetMapping("/lahajati-paypal")
    public String lahajatiPaypalTestPage() {
        // This will resolve to src/main/resources/templates/test/lahajati-paypal-test.html
        return "test/lahajati-paypal-test";
    }

    /**
     * Serves the test page for the Lahajati Bank Transfer workflow.
     *
     * @return The path to the HTML template.
     */
    @GetMapping("/lahajati-bank")
    public String lahajatiBankTransferTestPage() {
        // This will resolve to src/main/resources/templates/test/lahajati-bank-test.html
        return "test/lahajati-bank-test";
    }
}