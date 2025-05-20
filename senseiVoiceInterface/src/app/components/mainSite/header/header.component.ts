import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import {ClientResponse} from "../../../services/client-service.service";

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
  selectedLanguage = 'LANGUAGES';
  isLanguageDropdownOpen = false;
  isUserDropdownOpen = false;
  isLoggedIn = false;
  currentUser: ClientResponse =new ClientResponse();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit() {
    // Check if user is logged in
    this.isLoggedIn = this.authService.isLoggedIn();
    // If logged in, get the current user
    if (this.isLoggedIn) {
      this.authService.getUserConnect().subscribe(
        (response: ClientResponse) => {
          this.currentUser = response;
        }
      );;
    }

    // Add event listener to close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      if (!(event.target as HTMLElement).closest('.nav-item.dropdown') &&
        !(event.target as HTMLElement).closest('.user-avatar-dropdown')) {
        this.isLanguageDropdownOpen = false;
        this.isUserDropdownOpen = false;
      }
    });
  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    this.isUserDropdownOpen = false; // Close user dropdown if open
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    this.isLanguageDropdownOpen = false; // Close language dropdown if open
  }

  selectLanguage(language: string) {
    this.selectedLanguage = 'LANGUAGES';
    this.isLanguageDropdownOpen = false;
    this.router.navigate(['/filter-by-language/', language]);
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.currentUser = null;
    this.isUserDropdownOpen = false;
    this.router.navigate(['/']);
  }
}
