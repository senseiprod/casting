import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p class="text-lg text-gray-700 mb-6">You do not have permission to access this page.</p>
        <button
          (click)="goToLogin()"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Login
        </button>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/auth/cover-login']);
  }
}
