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
  voices: VoixResponse[] = [];
  userId: string | null = '';
  audio: string = '';
  speaker: ClientResponse = new ClientResponse();
  errorMessage: string | null = null;
  photoUrl: string | ArrayBuffer | null = null;
  id : number=0;
  profilePhotoUrl: SafeUrl | null = null;

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
    this.userId = this.route.snapshot.paramMap.get('uuid');
    this.speakerService.getClientByUuid(this.userId ).subscribe(
      (data) => {
        console.log(data)
        this.speaker = data;
      },
      (error) => {
        this.errorMessage = 'Error fetching speaker details';
      }
    );
    this.translate.get('common.actions').subscribe({
      next: (res) => console.log('Translation test:', res),
      error: (err) => console.error('Translation error:', err)
    });
  }





  changeLanguage(lang: Language): void {
    this.translationService.changeLanguage(lang);
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLanguage();
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
