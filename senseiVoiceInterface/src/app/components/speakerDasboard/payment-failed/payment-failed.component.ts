import { Component,  OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { ActionService } from "../../../services/action.service"

@Component({
  selector: "app-payment-failed",
  templateUrl: "./payment-failed.component.html",
  styleUrls: ["./payment-failed.component.css"],
})
export class PaymentFailedComponent implements OnInit {
  actionId: number | null = null
  paymentId: string | null = null
  errorReason: string | null = null
  isProcessing = true

  // Failure details
  failureType: "cancelled" | "declined" | "error" | "timeout" = "error"
  paymentAmount = 0
  textLength = 0
  voiceName = ""

  // Support and retry options
  showSupportOptions = false
  supportTicketSent = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionService: ActionService,
  ) {}

  ngOnInit(): void {
    // Get parameters from URL
    this.route.queryParams.subscribe((params) => {
      this.actionId = params["actionId"] ? Number.parseInt(params["actionId"]) : null
      this.paymentId = params["paymentId"] || null
      this.errorReason = params["error"] || null

      // Determine failure type based on parameters
      if (params["cancelled"] === "true") {
        this.failureType = "cancelled"
      } else if (params["declined"] === "true") {
        this.failureType = "declined"
      } else if (params["timeout"] === "true") {
        this.failureType = "timeout"
      }

      if (this.actionId) {
        this.processPaymentFailure()
      } else {
        this.isProcessing = false
      }
    })
  }

  processPaymentFailure(): void {
    if (!this.actionId) {
      this.isProcessing = false
      return
    }

    this.actionService.paymentCancel(this.actionId).subscribe(
      (response) => {
        console.log("Payment cancellation response:", response)
        this.isProcessing = false

        // Extract details from response if available
        if (response.amount) this.paymentAmount = response.amount
        if (response.textLength) this.textLength = response.textLength
        if (response.voiceName) this.voiceName = response.voiceName
      },
      (error) => {
        console.error("Payment cancellation processing error:", error)
        this.isProcessing = false
      },
    )
  }

  getFailureTitle(): string {
    switch (this.failureType) {
      case "cancelled":
        return "Payment Cancelled"
      case "declined":
        return "Payment Declined"
      case "timeout":
        return "Payment Timeout"
      default:
        return "Payment Failed"
    }
  }

  getFailureMessage(): string {
    switch (this.failureType) {
      case "cancelled":
        return "You cancelled the payment process. No charges were made to your account."
      case "declined":
        return "Your payment was declined. Please check your payment method and try again."
      case "timeout":
        return "The payment process timed out. Please try again."
      default:
        return "There was an error processing your payment. Please try again or contact support."
    }
  }

  getFailureIcon(): string {
    switch (this.failureType) {
      case "cancelled":
        return "bi-x-circle-fill"
      case "declined":
        return "bi-credit-card-2-front"
      case "timeout":
        return "bi-clock-fill"
      default:
        return "bi-exclamation-triangle-fill"
    }
  }

  retryPayment(): void {
    // Navigate back to generation with preserved data
    this.router.navigate(["/generation"], {
      queryParams: {
        retry: "true",
        actionId: this.actionId,
      },
    })
  }

  tryDifferentPaymentMethod(): void {
    this.router.navigate(["/generation"], {
      queryParams: {
        changePayment: "true",
        actionId: this.actionId,
      },
    })
  }

  contactSupport(): void {
    this.showSupportOptions = true
  }

  sendSupportEmail(): void {
    const subject = `Payment Issue - Action ID: ${this.actionId}`
    const body = `
Hello Support Team,

I encountered an issue with my payment:

Action ID: ${this.actionId}
Payment ID: ${this.paymentId || "N/A"}
Failure Type: ${this.failureType}
Error Reason: ${this.errorReason || "N/A"}
Amount: $${this.paymentAmount.toFixed(2)}

Please help me resolve this issue.

Thank you,
    `

    window.open(`mailto:support@yourapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    this.supportTicketSent = true
  }

  openLiveChat(): void {
    // Implement live chat functionality
    // This could open a chat widget or redirect to a support page
    console.log("Opening live chat...")
    // Example: window.open('https://your-support-chat-url.com');
  }

  viewFAQ(): void {
    window.open("/faq#payment-issues", "_blank")
  }

  goToHomepage(): void {
    this.router.navigate(["/"])
  }

  goToGeneration(): void {
    this.router.navigate(["/generation"])
  }

  checkPaymentStatus(): void {
    if (this.actionId) {
      // Implement payment status check
      this.actionService.getActionsByProject(this.actionId.toString()).subscribe(
        (response) => {
          console.log("Payment status check:", response)
          // Handle response and potentially redirect if payment was actually successful
        },
        (error) => {
          console.error("Payment status check error:", error)
        },
      )
    }
  }
}
