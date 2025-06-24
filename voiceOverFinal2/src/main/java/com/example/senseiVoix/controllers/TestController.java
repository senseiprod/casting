package com.example.senseiVoix.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TestController {

    @GetMapping("/test")
    public String testPage() {
        return "test-tts-workflow"; // This will look for test-tts-workflow.html in templates folder
    }
}