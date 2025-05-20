import { Component } from '@angular/core';
import { toggleAnimation } from 'src/app/shared/animations';
import { Store } from '@ngrx/store';
import { Router, NavigationEnd } from '@angular/router';
import { AppService } from '../service/app.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../service/auth.service';
import { NotificationService } from '../service/notification.service';

@Component({
    selector: 'header',
    templateUrl: './header.html',
    animations: [toggleAnimation],
})
export class HeaderComponent {
    notifications: { title: string, message: string, time?: string, read?: boolean, url?: string }[] = [];
  showNotifications = false;
    userProfile: any; // Store user data
    store: any;
    search = false;
    // notifications = [
    //     {
    //         id: 1,
    //         profile: 'user-profile.jpeg',
    //         message: '<strong class="text-sm mr-1">John Doe</strong>invite you to <strong>Prototyping</strong>',
    //         time: '45 min ago',
    //     },
    //     {
    //         id: 2,
    //         profile: 'profile-34.jpeg',
    //         message: '<strong class="text-sm mr-1">Adam Nolan</strong>mentioned you to <strong>UX Basics</strong>',
    //         time: '9h Ago',
    //     },
    //     {
    //         id: 3,
    //         profile: 'profile-16.jpeg',
    //         message: '<strong class="text-sm mr-1">Anna Morgan</strong>Upload a file',
    //         time: '9h Ago',
    //     },
    // ];
    messages = [
        {
            id: 1,
            image: this.sanitizer.bypassSecurityTrustHtml(
                `<span class="grid place-content-center w-9 h-9 rounded-full bg-success-light dark:bg-success text-success dark:text-success-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span>`,
            ),
            title: 'Congratulations!',
            message: 'Your OS has been updated.',
            time: '1hr',
        },
        {
            id: 2,
            image: this.sanitizer.bypassSecurityTrustHtml(
                `<span class="grid place-content-center w-9 h-9 rounded-full bg-info-light dark:bg-info text-info dark:text-info-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>`,
            ),
            title: 'Did you know?',
            message: 'You can switch between artboards.',
            time: '2hr',
        },
        {
            id: 3,
            image: this.sanitizer.bypassSecurityTrustHtml(
                `<span class="grid place-content-center w-9 h-9 rounded-full bg-danger-light dark:bg-danger text-danger dark:text-danger-light"> <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span>`,
            ),
            title: 'Something went wrong!',
            message: 'Send Reposrt',
            time: '2days',
        },
        {
            id: 4,
            image: this.sanitizer.bypassSecurityTrustHtml(
                `<span class="grid place-content-center w-9 h-9 rounded-full bg-warning-light dark:bg-warning text-warning dark:text-warning-light"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">    <circle cx="12" cy="12" r="10"></circle>    <line x1="12" y1="8" x2="12" y2="12"></line>    <line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>`,
            ),
            title: 'Warning',
            message: 'Your password strength is low.',
            time: '5days',
        },
    ];

    constructor(
        public translate: TranslateService,
        public storeData: Store<any>,
        public router: Router,
        private appSetting: AppService,
        private sanitizer: DomSanitizer,
        private authService: AuthService,
        private notificationService: NotificationService
    ) {
        this.notificationService.onMessage((notif) => {
            this.notifications.unshift(notif); // latest first
          });

          this.notificationService.onMessage((message) => {
            this.notifications.unshift({
              title: message.title || 'New Notification',
              message: message.message,
              time: new Date().toLocaleTimeString(),
              read: false
            });
          });
        this.initStore();
    }
    async initStore() {
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
    }

    ngOnInit() {
        this.setActiveDropdown();
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.setActiveDropdown();
            }
        });
        this.loadUserProfile();
    }

    // Add a method to handle notification clicks
navigateToNotification(notification: any) {
    // Mark as read first
    notification.read = true;

    // Navigate to the specified URL (default to the requests page if no URL specified)
    const url = notification.url || '/apps/request';
    this.router.navigate([url]);

    // Optionally close the notifications dropdown after clicking
    this.showNotifications = false;
  }

    toggleNotifications() {
        this.showNotifications = !this.showNotifications;
      }


      markAsRead(notification: { read: boolean; }) {
        notification.read = true;
      }

      clearNotifications() {
        this.notifications = [];
      }

    loadUserProfile() {
        this.authService.getUserProfile().subscribe(
          (data) => {
            this.userProfile = data;
          },
          (error) => {
            console.error('Error fetching user profile:', error);
          }
        );
      }

    setActiveDropdown() {
        const selector = document.querySelector('ul.horizontal-menu a[routerLink="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }

    // removeNotification(value: number) {
    //     this.notifications = this.notifications.filter((d) => d.id !== value);
    // }

    removeMessage(value: number) {
        this.messages = this.messages.filter((d) => d.id !== value);
    }

    changeLanguage(item: any) {
        this.translate.use(item.code);
        this.appSetting.toggleLanguage(item);
        if (this.store.locale?.toLowerCase() === 'ae') {
            this.storeData.dispatch({ type: 'toggleRTL', payload: 'rtl' });
        } else {
            this.storeData.dispatch({ type: 'toggleRTL', payload: 'ltr' });
        }
        window.location.reload();
    }

    signOut(): void {
        // Remove the specified items from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        // Optionally, you can also navigate to a different page after signing out
        this.router.navigate(['/auth/cover-login']);
      }

}
