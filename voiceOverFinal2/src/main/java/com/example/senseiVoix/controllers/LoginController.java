package com.example.senseiVoix.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/signup")
    public String loginPage() {
        return "signup";
    }

    @GetMapping("/login")
    public String login2() {
        return "login";
    }

    @GetMapping("/oauth2/authorization/google")
    public String redirectGoogleLogin() {
        return "redirect:/dashboard"; // Redirecting to a dashboard after successful login
    }
}
