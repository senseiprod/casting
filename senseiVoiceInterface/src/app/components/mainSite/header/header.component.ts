import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import {ClientResponse} from "../../../services/client-service.service";
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from 'src/app/services/translation.service';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  selectedLanguage = "LANGUAGES"
  isLanguageDropdownOpen = false
  isUserDropdownOpen = false
  isLoggedIn = false
  currentUser: any = {} // Declare currentUser without using ClientResponse
  currentUILanguage = "en"

  // Available voice languages for filtering
  voiceLanguages = [
    { code: "darija", name: "header.voiceLanguages.darija", nativeName: "Darija" },
    { code: "ar", name: "header.voiceLanguages.arabic", nativeName: "العربية" },
    { code: "fr", name: "header.voiceLanguages.french", nativeName: "Français" },
    { code: "en", name: "header.voiceLanguages.english", nativeName: "English" },
    { code: "de", name: "header.voiceLanguages.german", nativeName: "Deutsch" },
    { code: "it", name: "header.voiceLanguages.italian", nativeName: "Italiano" },
    { code: "es", name: "header.voiceLanguages.spanish", nativeName: "Español" },
    { code: "pt", name: "header.voiceLanguages.portuguese", nativeName: "Português" },
    { code: "hi", name: "header.voiceLanguages.hindi", nativeName: "हिन्दी" },
    { code: "bn", name: "header.voiceLanguages.bengali", nativeName: "বাংলা" },
    { code: "ru", name: "header.voiceLanguages.russian", nativeName: "Русский" },
    { code: "ja", name: "header.voiceLanguages.japanese", nativeName: "日本語" },
    { code: "ko", name: "header.voiceLanguages.korean", nativeName: "한국어" },
    { code: "zh", name: "header.voiceLanguages.chinese", nativeName: "中文" },
    { code: "tr", name: "header.voiceLanguages.turkish", nativeName: "Türkçe" },
    { code: "vi", name: "header.voiceLanguages.vietnamese", nativeName: "Tiếng Việt" },
    { code: "pl", name: "header.voiceLanguages.polish", nativeName: "Polski" },
    { code: "uk", name: "header.voiceLanguages.ukrainian", nativeName: "Українська" },
    { code: "ro", name: "header.voiceLanguages.romanian", nativeName: "Română" },
    { code: "nl", name: "header.voiceLanguages.dutch", nativeName: "Nederlands" },
    { code: "sv", name: "header.voiceLanguages.swedish", nativeName: "Svenska" },
    { code: "fi", name: "header.voiceLanguages.finnish", nativeName: "Suomi" },
    { code: "no", name: "header.voiceLanguages.norwegian", nativeName: "Norsk" },
    { code: "da", name: "header.voiceLanguages.danish", nativeName: "Dansk" },
    { code: "hu", name: "header.voiceLanguages.hungarian", nativeName: "Magyar" },
    { code: "cs", name: "header.voiceLanguages.czech", nativeName: "Čeština" },
    { code: "el", name: "header.voiceLanguages.greek", nativeName: "Ελληνικά" },
    { code: "th", name: "header.voiceLanguages.thai", nativeName: "ไทย" },
    { code: "id", name: "header.voiceLanguages.indonesian", nativeName: "Bahasa Indonesia" },
    { code: "ms", name: "header.voiceLanguages.malay", nativeName: "Bahasa Melayu" },
    { code: "he", name: "header.voiceLanguages.hebrew", nativeName: "עברית" },
    { code: "fa", name: "header.voiceLanguages.persian", nativeName: "فارسی" },
  ]

  constructor(
    private authService: AuthService,
    private router: Router,
    public translate: TranslateService,
    private translationService: TranslationService,
  ) {}

  ngOnInit() {
    this.initializeComponent()
    this.setupEventListeners()
    this.loadTranslations()
  }

  private initializeComponent(): void {
    // Check if user is logged in
    this.isLoggedIn = this.authService.isLoggedIn()
    this.currentUILanguage = this.translationService.getCurrentLanguage()

    // If logged in, get the current user
    if (this.isLoggedIn) {
      this.authService.getUserConnect().subscribe({
        next: (response: any) => {
          // Use any type instead of ClientResponse
          this.currentUser = response
        },
        error: (error) => {
          console.error("Error loading user data:", error)
        },
      })
    }
  }

  private setupEventListeners(): void {
    // Add event listener to close dropdowns when clicking outside
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      if (!target.closest(".nav-item.dropdown") && !target.closest(".user-avatar-dropdown")) {
        this.isLanguageDropdownOpen = false
        this.isUserDropdownOpen = false
      }
    })
  }

  private loadTranslations(): void {
    this.translate.get("header.navigation.languages").subscribe({
      next: (translation) => {
        this.selectedLanguage = translation
      },
      error: (error) => {
        console.error("Translation loading error:", error)
      },
    })
  }

  toggleLanguageDropdown(): void {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen
    this.isUserDropdownOpen = false // Close user dropdown if open
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen
    this.isLanguageDropdownOpen = false // Close language dropdown if open
  }

  selectVoiceLanguage(languageCode: string): void {
    this.translate.get("header.navigation.languages").subscribe((translation) => {
      this.selectedLanguage = translation
    })
    this.isLanguageDropdownOpen = false
    this.router.navigate(["/filter-by-language/", languageCode])
  }

  changeUILanguage(language: any): void {
    this.translationService.changeLanguage(language)
    this.currentUILanguage = language
    this.loadTranslations()
  }

  getCurrentUILanguage(): string {
    return this.translationService.getCurrentLanguage()
  }

  getUILanguageDisplayName(): string {
    const currentLang = this.getCurrentUILanguage()
    switch (currentLang) {
      case "en":
        return "EN"
      case "fr":
        return "FR"
      case "es":
        return "ES"
      default:
        return "EN"
    }
  }

  getUserDisplayName(): string {
    if (this.currentUser?.nom && this.currentUser?.prenom) {
      return `${this.currentUser.nom} ${this.currentUser.prenom}`
    }
    return this.currentUser?.nom || "User"
  }

  navigateToProfile(): void {
    if (this.currentUser?.uuid) {
      this.router.navigate([`speakerDasboard/${this.currentUser.uuid}/profile`])
    }
  }

  navigateToDashboard(): void {
    if (this.currentUser?.uuid) {
      this.router.navigate([`speakerDasboard/${this.currentUser.uuid}`])
    }
  }

  navigateToSettings(): void {
    if (this.currentUser?.uuid) {
      this.router.navigate([`speakerDasboard/${this.currentUser.uuid}/profile`])
    }
  }

  logout(): void {
    this.authService.logout()
    this.isLoggedIn = false
    this.currentUser = {}
    this.isUserDropdownOpen = false
    this.router.navigate(["/"])
  }

  // Navigation methods
  navigateToActors(): void {
    this.router.navigate(["/actors"])
  }

  navigateToVoiceAI(): void {
    this.router.navigate(["/voice-ai"])
  }

  navigateToHumanVoices(): void {
    this.router.navigate(["/humain-voices"])
  }

  navigateToStudio(): void {
    this.router.navigate(["/studio"])
  }

  navigateToContact(): void {
    this.router.navigate(["/contact"])
  }

  navigateToLogin(): void {
    this.router.navigate(["/login"])
  }

  navigateToSignup(): void {
    this.router.navigate(["/signup"])
  }

  navigateToHome(): void {
    this.router.navigate(["/"])
  }
}
