// src/app/components/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { SpeakerResponse } from '../../services/speaker.service';
import { UtilisateurService } from '../../services/utilisateur.service';
import { TranslationService, Language } from '../../services/translation.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  profilePhotoUrl: SafeUrl | null = null;
  speaker: SpeakerResponse = new SpeakerResponse();

  constructor(
    public translate: TranslateService,
    private translationService: TranslationService,
    private router: Router,
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private sanitizer: DomSanitizer,
  ) {}

  changeLanguage(lang: Language): void {
    this.translationService.changeLanguage(lang);
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLanguage();
  }

  ngOnInit() {
    this.authService.getUserConnect().subscribe((response) => {
      this.speaker = response;
      this.loadUserPhoto(response.uuid);
    });

    console.log('Current language:', this.translate.currentLang);

    this.translate.get('common.actions').subscribe({
      next: (res) => console.log('Translation test:', res),
      error: (err) => console.error('Translation error:', err)
    });
  }

  logout(): void {
    console.log('Logging out...');
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  loadUserPhoto(userId: string): void {
    this.utilisateurService.getPhoto(userId).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.profilePhotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: (error) => {
        console.error('Error loading user photo:', error);
        this.profilePhotoUrl = 'assets/images/default-profile.png';
      }
    });
  }
}
