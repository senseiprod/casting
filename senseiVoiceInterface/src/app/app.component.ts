import { Component, OnInit, Renderer2 } from '@angular/core'; // <-- Import OnInit and Renderer2
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core'; // <-- Import the core TranslateService
import { AuthService } from './services/auth.service';
import { ClientResponse } from './services/client-service.service';
// Your custom TranslationService is likely used elsewhere, which is fine.
// We just need the core TranslateService here for its events.

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit { // <-- Implement OnInit
     client : ClientResponse;
    
    constructor(
      private router: Router,
      private authService: AuthService,
      private translate: TranslateService, // <-- Inject TranslateService
      private renderer: Renderer2         // <-- Inject Renderer2
    ) {
      // It's good practice to set up default language settings here
      this.translate.setDefaultLang('en');
      // You can also add logic to load a saved language from localStorage
      const savedLang = localStorage.getItem('language') || 'en';
      this.translate.use(savedLang);
    }

  ngOnInit(): void {
    this.authService.getUserConnect().subscribe((client: ClientResponse) => {
      this.client = client;
    });
    // === Your existing logic (unchanged) ===
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.authService.checkSession();
    });
    
    // === NEW: Logic for persistent RTL/LTR direction ===
    // 1. Listen for language changes from anywhere in the app
    this.translate.onLangChange.subscribe((event: { lang: string }) => {
      this.updateDirection(event.lang);
    });

    // 2. Set the direction on initial application load
    this.updateDirection(this.translate.currentLang);
  }

  /**
   * Updates the 'dir' attribute on the <html> element based on the language.
   * @param lang The current language code (e.g., 'en', 'ar').
   */
  private updateDirection(lang: string): void {
    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    this.renderer.setAttribute(document.documentElement, 'dir', direction);
  }
}