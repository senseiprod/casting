import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SpeakerResponse } from '../../services/speaker.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UtilisateurService, UtilisateurRequest } from '../../services/utilisateur.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  // Track sidebar state
  isSidebarCollapsed = false;
  isSidebarHidden = false;
  isMobile = false;
  profilePhotoUrl: SafeUrl | null = null;
  speaker : SpeakerResponse = new SpeakerResponse();

  // Store event listeners for cleanup
  private resizeListener: any;

  constructor(private router: Router,
              private authService:AuthService ,
              private utilisateurService: UtilisateurService,
              private sanitizer: DomSanitizer,
              public translate: TranslateService

 ) { }

  ngOnInit(): void {
    // Check initial screen size
    this.authService.getUserConnect().subscribe((response)=>{
      this.speaker = response ;
      this.loadUserPhoto(response.uuid)
    });
    this.checkScreenSize();

    // Initialize sidebar functionality after view is loaded
    setTimeout(() => {
      this.initSidebar();
    });

    // Add resize listener
    this.resizeListener = () => this.checkScreenSize();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }
  loadUserPhoto(userId: string): void {
    this.utilisateurService.getPhoto(userId).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.profilePhotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: (error) => {
        console.error('Error loading user photo:', error);
        // Set default photo
        this.profilePhotoUrl = 'assets/images/default-profile.png';
      }
    });
  }
  logout(): void {
    // Implement your logout logic here
    console.log('Logging out...');
    // Example: clear local storage, redirect to login, etc.
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;

    // On mobile, default to hidden sidebar
    if (this.isMobile && !this.isSidebarHidden) {
      this.isSidebarHidden = true;
      this.updateSidebarState();
    }
  }

  private initSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const content = document.querySelector('.content');
    const topbar = document.querySelector('.topbar');

    // Set initial state
    this.updateSidebarState();

    // Toggle sidebar on button click
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        if (this.isMobile) {
          // On mobile, toggle between hidden and visible
          this.isSidebarHidden = !this.isSidebarHidden;
          this.updateSidebarState();

          if (!this.isSidebarHidden) {
            sidebarOverlay?.classList.add('show');
          } else {
            sidebarOverlay?.classList.remove('show');
          }
        } else {
          // On desktop, toggle between collapsed and expanded
          this.isSidebarCollapsed = !this.isSidebarCollapsed;
          this.updateSidebarState();
        }
      });
    }

    // Close sidebar with close button
    if (closeSidebar) {
      closeSidebar.addEventListener('click', () => {
        if (this.isMobile) {
          this.isSidebarHidden = true;
          sidebarOverlay?.classList.remove('show');
        } else {
          this.isSidebarCollapsed = true;
        }
        this.updateSidebarState();
      });
    }

    // Close sidebar when clicking on overlay (mobile only)
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        this.isSidebarHidden = true;
        sidebarOverlay.classList.remove('show');
        this.updateSidebarState();
      });
    }

    // Close sidebar when clicking on a nav link (on mobile only)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isMobile) {
          this.isSidebarHidden = true;
          sidebarOverlay?.classList.remove('show');
          this.updateSidebarState();
        }
      });
    });
  }

  private updateSidebarState(): void {
    const sidebar = document.getElementById('sidebar');
    const content = document.querySelector('.content');
    const topbar = document.querySelector('.topbar');
    const body = document.body;

    // Update sidebar classes
    if (sidebar) {
      // Clear all states first
      sidebar.classList.remove('collapsed', 'show');

      if (this.isMobile) {
        // Mobile behavior
        if (!this.isSidebarHidden) {
          sidebar.classList.add('show');
        }
      } else {
        // Desktop behavior
        if (this.isSidebarCollapsed) {
          sidebar.classList.add('collapsed');
        }
      }
    }

    // Update content area
    if (content) {
      content.classList.remove('sidebar-collapsed', 'sidebar-hidden', 'sidebar-open');

      if (this.isMobile) {
        if (!this.isSidebarHidden) {
          content.classList.add('sidebar-open');
        }
      } else {
        if (this.isSidebarCollapsed) {
          content.classList.add('sidebar-collapsed');
        }
      }
    }

    // Update topbar
    if (topbar) {
      topbar.classList.remove('sidebar-collapsed', 'sidebar-hidden', 'sidebar-open');

      if (this.isMobile) {
        if (!this.isSidebarHidden) {
          topbar.classList.add('sidebar-open');
        }
      } else {
        if (this.isSidebarCollapsed) {
          topbar.classList.add('sidebar-collapsed');
        }
      }
    }

    // Update body class for toggle button positioning
    if (!this.isMobile && !this.isSidebarCollapsed) {
      body.classList.add('sidebar-expanded');
    } else {
      body.classList.remove('sidebar-expanded');
    }
  }
}
