// src/app/services/translation.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export type Language = 'en' | 'fr' | 'es';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject: BehaviorSubject<Language>;
  public currentLanguage$: Observable<Language>;

  // Available languages
  public availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' }
  ];

  constructor(private translate: TranslateService) {
    // Initialize with saved language or browser language
    const savedLang = localStorage.getItem('preferredLanguage') as Language;
    const browserLang = this.getBrowserLanguage();
    const defaultLang = savedLang || browserLang || 'en';

    this.currentLanguageSubject = new BehaviorSubject<Language>(defaultLang);
    this.currentLanguage$ = this.currentLanguageSubject.asObservable();

    // Set default language
    this.setDefaultLanguage(defaultLang);
  }

  /**
   * Set the default language
   */
  setDefaultLanguage(lang: Language): void {
    // Set as default fallback language
    this.translate.setDefaultLang(lang);

    // Use the selected language
    this.changeLanguage(lang);
  }

  /**
   * Change current language
   */
  changeLanguage(lang: Language): void {
    // Use the selected language
    this.translate.use(lang);

    // Save in local storage
    localStorage.setItem('preferredLanguage', lang);

    // Update the subject
    this.currentLanguageSubject.next(lang);
  }

  /**
   * Get current language value
   */
  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  /**
   * Get browser language if it's supported
   */
  private getBrowserLanguage(): Language | null {
    const browserLang = this.translate.getBrowserLang() as string;

    // Check if browser language is supported
    if (browserLang && this.isSupportedLanguage(browserLang)) {
      return browserLang as Language;
    }

    return null;
  }

  /**
   * Check if language is supported
   */
  private isSupportedLanguage(lang: string): boolean {
    return this.availableLanguages.some(language => language.code === lang);
  }

  /**
   * Get language name by code
   */
  getLanguageName(code: string): string {
    const language = this.availableLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  }
}
