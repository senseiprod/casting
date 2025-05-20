import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  checkoutForm: FormGroup;
  billingForm: FormGroup;
  paymentForm: FormGroup;

  isSubmitting = false;
  orderComplete = false;
  currentStep = 1;

  paymentMethod = 'credit-card';

  // Sample order items
  orderItems = [
    {
      id: 1,
      name: 'Professional Voice Over - Commercial',
      description: '60-second commercial voice over with 2 revisions',
      price: 299.99,
      quantity: 1
    },
    {
      id: 2,
      name: 'Rush Delivery',
      description: '24-hour turnaround time',
      price: 49.99,
      quantity: 1
    }
  ];

  // Calculate order totals
  get subtotal(): number {
    return this.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get tax(): number {
    return this.subtotal * 0.08; // 8% tax rate
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  // Countries list for dropdown
  countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia',
    'Germany', 'France', 'Japan', 'Brazil', 'Mexico', 'India'
  ];

  // States list for US
  states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  constructor(private fb: FormBuilder) {
    // Initialize billing form
    this.billingForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[0-9\s\-$$$$]+$/)]],
      company: [''],
      address1: ['', [Validators.required]],
      address2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      country: ['United States', [Validators.required]]
    });

    // Initialize payment form
    this.paymentForm = this.fb.group({
      cardName: ['', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryMonth: ['', [Validators.required]],
      expiryYear: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      savePaymentInfo: [false]
    });

    // Combine forms
    this.checkoutForm = this.fb.group({
      billing: this.billingForm,
      payment: this.paymentForm
    });
  }

  ngOnInit(): void {
  }

  // Change payment method
  setPaymentMethod(method: string): void {
    this.paymentMethod = method;
  }

  // Navigate between steps
  nextStep(): void {
    if (this.currentStep < 3) {
      // Validate current step before proceeding
      if (this.currentStep === 1 && this.billingForm.valid) {
        this.currentStep++;
        window.scrollTo(0, 0);
      } else if (this.currentStep === 2) {
        if (this.paymentMethod === 'credit-card' && !this.paymentForm.valid) {
          // Mark all payment fields as touched to show validation errors
          Object.keys(this.paymentForm.controls).forEach(key => {
            this.paymentForm.get(key)?.markAsTouched();
          });
        } else {
          this.currentStep++;
          window.scrollTo(0, 0);
        }
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  // Submit order
  submitOrder(): void {
    if (this.checkoutForm.valid || this.paymentMethod !== 'credit-card') {
      this.isSubmitting = true;

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.orderComplete = true;
        window.scrollTo(0, 0);
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.checkoutForm);
    }
  }

  // Helper to mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Format currency
  formatCurrency(amount: number): string {
    return amount.toFixed(2);
  }

  // Get credit card type based on number
  getCardType(cardNumber: string): string {
    if (!cardNumber) return '';

    // Visa
    if (cardNumber.startsWith('4')) {
      return 'visa';
    }
    // Mastercard
    else if (/^5[1-5]/.test(cardNumber)) {
      return 'mastercard';
    }
    // Amex
    else if (/^3[47]/.test(cardNumber)) {
      return 'amex';
    }
    // Discover
    else if (/^6(?:011|5)/.test(cardNumber)) {
      return 'discover';
    }

    return '';
  }

  // Generate order number
  getOrderNumber(): string {
    return 'VO-' + Math.floor(100000 + Math.random() * 900000);
  }
}
