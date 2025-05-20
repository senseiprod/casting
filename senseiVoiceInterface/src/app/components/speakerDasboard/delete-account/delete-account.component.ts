import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.css']
})
export class DeleteAccountComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() submitRequest = new EventEmitter<any>();

  deleteAccountForm: FormGroup;
  isSubmitting = false;

  // Reasons for account deletion
  deletionReasons = [
    { id: 'not-useful', text: 'I don\'t find the service useful' },
    { id: 'too-expensive', text: 'The service is too expensive' },
    { id: 'found-alternative', text: 'I found a better alternative' },
    { id: 'privacy-concerns', text: 'I have privacy concerns' },
    { id: 'too-complicated', text: 'The service is too complicated to use' },
    { id: 'temporary-break', text: 'I\'m taking a break but may return later' },
    { id: 'other', text: 'Other reason' }
  ];

  constructor(private fb: FormBuilder) {
    this.deleteAccountForm = this.fb.group({
      reason: ['', Validators.required],
      otherReason: [''],
      feedback: [''],
      dataHandling: ['delete', Validators.required],
      password: ['', Validators.required],
      confirmation: [false, Validators.requiredTrue]
    });
  }

  // Check if "Other" reason is selected
  get isOtherReasonSelected(): boolean {
    return this.deleteAccountForm.get('reason')?.value === 'other';
  }

  // Handle form submission
  onSubmit(): void {
    if (this.deleteAccountForm.valid) {
      this.isSubmitting = true;

      // Prepare form data
      const formData = {
        ...this.deleteAccountForm.value,
        requestDate: new Date().toISOString()
      };

      // Emit the form data to parent component
      this.submitRequest.emit(formData);
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.deleteAccountForm.controls).forEach(key => {
        this.deleteAccountForm.get(key)?.markAsTouched();
      });
    }
  }

  // Cancel deletion request
  onCancel(): void {
    this.cancel.emit();
  }
}
