import {Component, OnInit} from '@angular/core';
import {VoixResponse, VoixService} from "../../../services/voix.service";
import {ClientResponse, ClientService} from "../../../services/client-service.service";
import {ActivatedRoute} from "@angular/router";
import {UtilisateurService} from "../../../services/utilisateur-service.service";
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { SpeakerResponse } from '../../../services/speaker-service.service';
import { TranslationService, Language } from '../../../services/translation.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  voices: VoixResponse[] = []
  userId: string | null = ""
  audio = ""
  speaker: ClientResponse = new ClientResponse()
  errorMessage: string | null = null
  photoUrl: string | ArrayBuffer | null = null
  id = 0
  profilePhotoUrl: SafeUrl | null = null
  notificationCount = 3
  notifications: any[] = []

  constructor(
    private route: ActivatedRoute,
    private speakerService: ClientService,
    private utilisateurService: UtilisateurService,
    public translate: TranslateService,
    private translationService: TranslationService,
    private router: Router,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get("uuid")
    this.loadUserData()
    this.loadNotifications()
    this.initializeTranslations()
  }

  private loadUserData(): void {
    if (this.userId) {
      this.speakerService.getClientByUuid(this.userId).subscribe(
        (data) => {
          console.log(data)
          this.speaker = data
        },
        (error) => {
          this.errorMessage = "Error fetching speaker details"
          console.error("Error loading user data:", error)
        },
      )

      this.loadUserPhoto(this.userId)
    }
  }

  private loadNotifications(): void {
    // Mock notifications - replace with actual service call
    this.notifications = [
      {
        id: 1,
        icon: "bi-file-earmark-text",
        text: "header.notifications.items.voiceCompleted",
        time: "header.notifications.times.twoMinAgo",
        unread: true,
      },
      {
        id: 2,
        icon: "bi-person",
        text: "header.notifications.items.newComment",
        time: "header.notifications.times.oneHourAgo",
        unread: true,
      },
      {
        id: 3,
        icon: "bi-check-circle",
        text: "header.notifications.items.requestApproved",
        time: "header.notifications.times.twoHoursAgo",
        unread: true,
      },
    ]
  }

  private initializeTranslations(): void {
    this.translate.get("header.title").subscribe({
      next: (res) => console.log("Translation test:", res),
      error: (err) => console.error("Translation error:", err),
    })
  }

  changeLanguage(lang: Language): void {
    this.translationService.changeLanguage(lang)
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLanguage()
  }

  getLanguageDisplayName(): string {
    const currentLang = this.getCurrentLanguage()
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

  getLanguageFlag(): string {
    const currentLang = this.getCurrentLanguage()
    switch (currentLang) {
      case "en":
        return "🇺🇸"
      case "fr":
        return "🇫🇷"
      case "es":
        return "🇪🇸"
      default:
        return "🇺🇸"
    }
  }

  markAllNotificationsAsRead(): void {
    this.notifications.forEach((notification) => {
      notification.unread = false
    })
    this.notificationCount = 0
  }

  markNotificationAsRead(notificationId: number): void {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification && notification.unread) {
      notification.unread = false
      this.notificationCount = Math.max(0, this.notificationCount - 1)
    }
  }

  logout(): void {
    console.log("Logging out...")
    localStorage.clear()
    this.router.navigate(["/login"])
  }

  loadUserPhoto(userId: string): void {
    this.utilisateurService.getPhoto(userId).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob)
        this.profilePhotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL)
      },
      error: (error) => {
        console.error("Error loading user photo:", error)
        this.profilePhotoUrl = null
      },
    })
  }

  onSearchSubmit(searchTerm: string): void {
    if (searchTerm.trim()) {
      // Implement search functionality
      console.log("Searching for:", searchTerm)
    }
  }

  navigateToNotifications(): void {
    this.router.navigate(["/notifications"])
  }

  navigateToProfile(): void {
    this.router.navigate(["/profile"])
  }

  navigateToSettings(): void {
    this.router.navigate(["/settings"])
  }
}
