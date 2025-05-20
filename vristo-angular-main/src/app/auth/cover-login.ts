import { Component } from '@angular/core';
import { toggleAnimation } from 'src/app/shared/animations';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'src/app/service/app.service';
import { AuthService } from '../service/auth.service';

@Component({
    templateUrl: './cover-login.html',
    animations: [toggleAnimation],
})
export class CoverLoginComponent {
    signinData = {
        email: '',
        password: ''
      };
      loading = false;
  errorMessage: string = '';
    store: any;
    currYear: number = new Date().getFullYear();
    constructor(
        public translate: TranslateService,
        public storeData: Store<any>,
        public router: Router,
        private appSetting: AppService,
        private authService: AuthService
    ) {
        this.initStore();
    }


    onSignIn() {
        this.loading = true;
        this.errorMessage = '';

        this.authService.signIn(this.signinData.email, this.signinData.password).subscribe({
          next: (user) => {
            this.router.navigate(['/']); // Redirect to dashboard or a logged-in page
          },
          error: (error) => {
            this.errorMessage = 'Invalid email or password'; // Handle login failure
            this.loading = false;
          }
        });
      }
    async initStore() {
        this.storeData
            .select((d) => d.index)
            .subscribe((d) => {
                this.store = d;
            });
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
}
