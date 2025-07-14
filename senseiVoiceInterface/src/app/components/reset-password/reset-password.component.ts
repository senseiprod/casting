import { Component,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { ActivatedRoute, Router } from "@angular/router"
import  { AuthService } from "../../services/auth.service"

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
    this.resetPasswordForm = this.fb.group({
      newPassword: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", [Validators.required]],
    })

    // Add the password match validation after form creation
    this.resetPasswordForm.get("confirmPassword")?.valueChanges.subscribe(() => {
      this.checkPasswordMatch()
    })

    this.resetPasswordForm.get("newPassword")?.valueChanges.subscribe(() => {
      this.checkPasswordMatch()
    })
  }

  ngOnInit(): void {
    // Check if there's a token in the URL
    this.route.queryParams.subscribe((params) => {
      this.token = params["token"]
      console.log("Token from URL:", this.token)
    })
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword
  }

  onRequestSubmit(): void {
    console.log("Request form submitted")
    console.log("Request form valid:", this.requestResetForm.valid)

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
    console.log("Reset form submitted")
    console.log("Reset form valid:", this.resetPasswordForm.valid)
    console.log("Token available:", this.token)

    // Force check password match before submission
    this.checkPasswordMatch()

    if (this.resetPasswordForm.valid && this.token) {
      this.isResetSubmitting = true
      this.resetError = false
      this.resetSuccess = false
      this.resetPassword()
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.resetPasswordForm.controls).forEach((key) => {
        this.resetPasswordForm.get(key)?.markAsTouched()
      })

      // Show specific error if no token
      if (!this.token) {
        this.resetError = true
        this.errorMessage = "Invalid or missing reset token. Please request a new password reset."
      }
    }
  }

  requestPasswordReset(): void {
    const email = this.requestResetForm.value.email

    this.authService.forgotPassword(email).subscribe({
      next: (response: string) => {
        console.log("Reset request sent:", response)
        this.requestSuccess = true
        this.successMessage = response || "If the email exists, a password reset link has been sent."
        this.isRequestSubmitting = false
      },
      error: (err) => {
        console.error("Error:", err)
        this.requestError = true
        // Handle different error scenarios
        if (err.status === 0) {
          this.errorMessage = "Unable to connect to server. Please try again later."
        } else if (err.error && typeof err.error === "string") {
          this.errorMessage = err.error
        } else {
          this.errorMessage = "Failed to send reset instructions. Please try again."
        }
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

    const newPassword = this.resetPasswordForm.value.newPassword
    console.log("Attempting to reset password with token:", this.token)

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (response: string) => {
        console.log("Password reset successful:", response)
        this.resetSuccess = true
        this.successMessage = response || "Your password has been reset successfully. Redirecting to login..."
        this.isResetSubmitting = false

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          this.router.navigate(["/login"])
        }, 3000)
      },
      error: (err) => {
        console.error("Password reset error:", err)
        this.resetError = true

        // Handle different error scenarios
        if (err.status === 0) {
          this.errorMessage = "Unable to connect to server. Please try again later."
        } else if (err.status === 400) {
          this.errorMessage = err.error || "Invalid or expired password reset token."
        } else if (err.status === 500) {
          this.errorMessage = "Server error occurred. Please try again later."
        } else if (err.error && typeof err.error === "string") {
          this.errorMessage = err.error
        } else {
          this.errorMessage = "Failed to reset password. The link may have expired."
        }

        this.isResetSubmitting = false
      },
    })
  }

  backToLogin(): void {
    this.router.navigate(["/login"])
  }

  private checkPasswordMatch(): void {
    const password = this.resetPasswordForm.get("newPassword")?.value
    const confirmPassword = this.resetPasswordForm.get("confirmPassword")?.value
    const confirmPasswordControl = this.resetPasswordForm.get("confirmPassword")

    if (confirmPasswordControl && confirmPassword) {
      if (password !== confirmPassword) {
        confirmPasswordControl.setErrors({ passwordMismatch: true })
      } else {
        // Clear passwordMismatch error but keep other errors
        const errors = confirmPasswordControl.errors
        if (errors && errors["passwordMismatch"]) {
          delete errors["passwordMismatch"]
          confirmPasswordControl.setErrors(Object.keys(errors).length === 0 ? null : errors)
        }
      }
    }
  }

  // Helper method to check if form is ready for submission
  isFormReadyForSubmission(): boolean {
    const password = this.resetPasswordForm.get("newPassword")?.value
    const confirmPassword = this.resetPasswordForm.get("confirmPassword")?.value

    return !!(
      this.token &&
      password &&
      confirmPassword &&
      password.length >= 8 &&
      password === confirmPassword &&
      this.resetPasswordForm.valid
    )
  }
}
