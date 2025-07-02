import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface ChargeDetails {
  amount: number
  currency: string
  transactionId: string
  timestamp: Date
  newBalance: number
  previousBalance: number
}

@Component({
  selector: 'app-success-balance-charge',
  templateUrl: './success-balance-charge.component.html',
  styleUrls: ['./success-balance-charge.component.css']
})
export class SuccessBalanceChargeComponent {
  chargeDetails: ChargeDetails = {
    amount: 0,
    currency: "USD",
    transactionId: "",
    timestamp: new Date(),
    newBalance: 0,
    previousBalance: 0,
  }

  isLoading = true
  showConfetti = false
  userId: string | null = null

  // Animation states
  showSuccessIcon = false
  showBalanceUpdate = false
  showActionButtons = false
navigator: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Get parameters from URL path
    this.route.paramMap.subscribe((params) => {
      const amount = Number.parseFloat(params.get("amount") || "0")
      const newBalance = Number.parseFloat(params.get("newBalance") || "0")
      
      this.chargeDetails = {
        amount: amount,
        currency: "USD",
        transactionId: this.generateTransactionId(),
        timestamp: new Date(),
        newBalance: newBalance,
        previousBalance: newBalance - amount,
      }
    })

    // Get user UUID from parent route
    this.route.parent?.paramMap.subscribe((params) => {
      this.userId = params.get("uuid")
    })

    // Simulate loading and trigger animations
    this.startSuccessAnimation()
  }

  startSuccessAnimation(): void {
    // Show loading for a brief moment
    setTimeout(() => {
      this.isLoading = false
      this.showSuccessIcon = true
      this.showConfetti = true
    }, 500)

    // Show balance update
    setTimeout(() => {
      this.showBalanceUpdate = true
    }, 1200)

    // Show action buttons
    setTimeout(() => {
      this.showActionButtons = true
    }, 1800)

    // Hide confetti after animation
    setTimeout(() => {
      this.showConfetti = false
    }, 3000)
  }

  generateTransactionId(): string {
    return "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  continueToGeneration(): void {
    this.router.navigate(["/speakerDasboard", this.userId, "generate"])
  }

  goToDashboard(): void {
    this.router.navigate(["/speakerDasboard", this.userId])
  }

  viewRequests(): void {
    this.router.navigate(["/speakerDasboard", this.userId, "requests"])
  }

  goToProfile(): void {
    this.router.navigate(["/speakerDasboard", this.userId, "profile"])
  }

  downloadReceipt(): void {
    // Implement receipt download functionality
    console.log("Downloading receipt for transaction:", this.chargeDetails.transactionId)
  }

  shareSuccess(): void {
    if (navigator.share) {
      navigator.share({
        title: "Balance Charged Successfully!",
        text: `I just charged $${this.chargeDetails.amount} to my account balance.`,
        url: window.location.href,
      })
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Copied to clipboard:", text)
        // You can add a toast notification here
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard:", err)
      })
  }
}
