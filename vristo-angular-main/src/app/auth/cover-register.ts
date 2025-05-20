import { Component } from '@angular/core';
import { toggleAnimation } from 'src/app/shared/animations';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'src/app/service/app.service';
import { AuthService } from '../service/auth.service';
import { NgForm } from '@angular/forms';

@Component({
    templateUrl: './cover-register.html',
    animations: [toggleAnimation],
})
export class CoverRegisterComponent {
    store: any;
    signupData = {
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        role: 'ADMIN'  // Default role, change as needed
    };

    loading = false;
    errorMessage: string = '';
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

    ngOnInit(): void {}

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

    onSignUp(form: NgForm) {
        if (form.invalid) return;

        this.loading = true;
        this.errorMessage = '';

        // Log the signup data before making the request
        console.log('Signup Data:', this.signupData);

        this.authService.signUp(this.signupData).subscribe({
            next: (response) => {
                this.router.navigate(['/auth/cover-login']); // Redirect to sign-in page
            },
            error: (error) => {
                this.errorMessage = 'Error creating account'; // Handle sign-up failure
                this.loading = false;
            }
        });
    }
}
