import { Component,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { ActivatedRoute, Router } from "@angular/router"
import { AuthService } from '../../services/auth.service';

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.css"],
})
export class ResetPasswordComponent implements OnInit {
  requestResetForm: FormGroup
  resetPasswordForm: FormGroup
  isRequestSubmitting = false
  isResetSubmitting = false
  showPassword = false
  showConfirmPassword = false
  requestError = false
  resetError = false
  requestSuccess = false
  resetSuccess = false
  errorMessage = ""
  successMessage = ""
  token: string | null = null

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    // Form for requesting password reset
    this.requestResetForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    })

    // Form for resetting password with token
    this.resetPasswordForm = this.fb.group(
      {
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validator: this.passwordMatchValidator },
    )
  }

  ngOnInit(): void {
    // Check if there's a token in the URL
    this.route.queryParams.subscribe((params) => {
      this.token = params["token"]
    })
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")?.value
    const confirmPassword = form.get("confirmPassword")?.value

    if (password !== confirmPassword) {
      form.get("confirmPassword")?.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    }

    return null
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword
  }

  onRequestSubmit(): void {
    if (this.requestResetForm.valid) {
      this.isRequestSubmitting = true
      this.requestError = false
      this.requestSuccess = false
      this.requestPasswordReset()
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.requestResetForm.controls).forEach((key) => {
        this.requestResetForm.get(key)?.markAsTouched()
      })
    }
  }

  onResetSubmit(): void {
    if (this.resetPasswordForm.valid) {
      this.isResetSubmitting = true
      this.resetError = false
      this.resetSuccess = false
      this.resetPassword()
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.resetPasswordForm.controls).forEach((key) => {
        this.resetPasswordForm.get(key)?.markAsTouched()
      })
    }
  }

  requestPasswordReset(): void {
    const email = this.requestResetForm.value.email

    this.authService.requestPasswordReset(email).subscribe({
      next: (response) => {
        console.log("Reset request sent:", response)
        this.requestSuccess = true
        this.successMessage = "Password reset instructions have been sent to your email."
        this.isRequestSubmitting = false
      },
      error: (err) => {
        console.error("Error:", err)
        this.requestError = true
        this.errorMessage = "Failed to send reset instructions. Please try again."
        this.isRequestSubmitting = false
      },
    })
  }

  resetPassword(): void {
    if (!this.token) {
      this.resetError = true
      this.errorMessage = "Invalid or missing reset token."
      this.isResetSubmitting = false
      return
    }

    const newPassword = this.resetPasswordForm.value.password

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (response) => {
        console.log("Password reset successful:", response)
        this.resetSuccess = true
        this.successMessage = "Your password has been reset successfully."
        this.isResetSubmitting = false

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          this.router.navigate(["/login"])
        }, 3000)
      },
      error: (err) => {
        console.error("Error:", err)
        this.resetError = true
        this.errorMessage = "Failed to reset password. The link may have expired."
        this.isResetSubmitting = false
      },
    })
  }

  backToLogin(): void {
    this.router.navigate(["/login"])
  }
}
