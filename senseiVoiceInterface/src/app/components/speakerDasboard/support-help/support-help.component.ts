import { Component,  OnInit } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { TranslateService } from "@ngx-translate/core"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  isExpanded?: boolean
}

interface SupportCategory {
  id: string
  name: string
  icon: string
  description: string
  count: number
}

interface ContactMethod {
  id: string
  name: string
  icon: string
  description: string
  action: string
  available: boolean
}

@Component({
  selector: "app-support-help",
  templateUrl: "./support-help.component.html",
  styleUrls: ["./support-help.component.css"],
})
export class SupportHelpComponent implements OnInit {
  userId: string | null = ""

  // Search and filtering
  searchQuery = ""
  selectedCategory = ""

  // Contact form
  showContactForm = false
  contactForm = {
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
    priority: "medium",
  }
  isSubmittingContact = false
  contactSubmitted = false
  contactError: string | null = null

  // Support categories
  supportCategories: SupportCategory[] = [
    {
      id: "getting-started",
      name: "Getting Started",
      icon: "bi-rocket-takeoff",
      description: "Learn the basics of voice generation",
      count: 8,
    },
    {
      id: "voice-generation",
      name: "Voice Generation",
      icon: "bi-mic",
      description: "Questions about creating audio",
      count: 12,
    },
    {
      id: "billing-payments",
      name: "Billing & Payments",
      icon: "bi-credit-card",
      description: "Payment and subscription help",
      count: 6,
    },
    {
      id: "account-settings",
      name: "Account Settings",
      icon: "bi-person-gear",
      description: "Manage your account preferences",
      count: 5,
    },
    {
      id: "technical-issues",
      name: "Technical Issues",
      icon: "bi-tools",
      description: "Troubleshooting and bug reports",
      count: 9,
    },
    {
      id: "api-integration",
      name: "API Integration",
      icon: "bi-code-slash",
      description: "Developer resources and API help",
      count: 7,
    },
  ]

  // Contact methods
  contactMethods: ContactMethod[] = [
    {
      id: "live-chat",
      name: "Live Chat",
      icon: "bi-chat-dots",
      description: "Get instant help from our support team",
      action: "Start Chat",
      available: true,
    },
    {
      id: "email",
      name: "Email Support",
      icon: "bi-envelope",
      description: "Send us a detailed message",
      action: "Send Email",
      available: true,
    },
    {
      id: "phone",
      name: "Phone Support",
      icon: "bi-telephone",
      description: "Speak directly with our team",
      action: "Call Now",
      available: false,
    },
    {
      id: "community",
      name: "Community Forum",
      icon: "bi-people",
      description: "Connect with other users",
      action: "Visit Forum",
      available: true,
    },
  ]

  // FAQ items
  faqItems: FAQItem[] = [
    {
      id: "1",
      question: "How do I generate my first voice audio?",
      answer:
        "To generate your first voice audio: 1) Select a voice from our library, 2) Enter your text (up to 100 characters for free), 3) Click 'Generate Speech', 4) Listen to your generated audio. For longer texts, you'll need to use our paid service.",
      category: "getting-started",
    },
    {
      id: "2",
      question: "What languages are supported?",
      answer:
        "We support over 32 languages including English, French, Spanish, Arabic, Darija (Moroccan Arabic), German, Italian, Portuguese, Hindi, Chinese, Japanese, Korean, and many more. Each language has multiple voice options available.",
      category: "voice-generation",
    },
    {
      id: "3",
      question: "How does the pricing work?",
      answer:
        "We offer a free tier with 100 characters per generation. For longer texts, we charge per character. You can either pay per use or add funds to your account balance for convenient usage. Check our pricing page for current rates.",
      category: "billing-payments",
    },
    {
      id: "4",
      question: "Can I use my own voice?",
      answer:
        "Yes! We offer voice cloning services where you can upload samples of your voice and create a custom voice model. This feature requires a premium subscription and voice samples of at least 10 minutes.",
      category: "voice-generation",
    },
    {
      id: "5",
      question: "What payment methods do you accept?",
      answer:
        "We accept PayPal, major credit cards (Visa, MasterCard, American Express), and bank transfers. All payments are processed securely through our payment partners.",
      category: "billing-payments",
    },
    {
      id: "6",
      question: "How do I change my account settings?",
      answer:
        "Go to your account dashboard, click on 'Settings' in the sidebar. From there you can update your profile information, change your password, manage notification preferences, and update billing information.",
      category: "account-settings",
    },
    {
      id: "7",
      question: "Why is my audio generation failing?",
      answer:
        "Audio generation might fail due to: 1) Network connectivity issues, 2) Text containing unsupported characters, 3) Server overload during peak times, 4) Insufficient account balance. Try again or contact support if the issue persists.",
      category: "technical-issues",
    },
    {
      id: "8",
      question: "Is there an API available?",
      answer:
        "Yes, we provide a comprehensive REST API for developers. You can integrate voice generation into your applications. API documentation, authentication details, and code examples are available in our developer portal.",
      category: "api-integration",
    },
    {
      id: "9",
      question: "How do I organize my generated audio?",
      answer:
        "Use our project system to organize your audio files. Create projects for different purposes (e.g., 'Podcast Episodes', 'Marketing Content') and save your generated audio directly to these projects for easy management.",
      category: "getting-started",
    },
    {
      id: "10",
      question: "What's the difference between original and cloned voices?",
      answer:
        "Original voices are AI-generated voices created by our system. Cloned voices are custom voices created from real voice samples. Cloned voices offer more personalization but require voice samples and additional processing time.",
      category: "voice-generation",
    },
  ]

  // Filtered items
  filteredFAQs: FAQItem[] = []
  filteredCategories: SupportCategory[] = []

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    // Get user ID from parent route
    this.route.parent?.paramMap.subscribe((params) => {
      this.userId = params.get("uuid") || ""
    })

    // Set up translation
    this.translate.setDefaultLang("en")
    const browserLang = this.translate.getBrowserLang()
    if (browserLang) {
      this.translate.use(browserLang.match(/en|fr|es/) ? browserLang : "en")
    }

    // Initialize filtered items
    this.applyFilters()
  }

  // Search and filter methods
  applyFilters(): void {
    // Filter FAQs
    this.filteredFAQs = this.faqItems.filter((item) => {
      const matchesSearch =
        this.searchQuery === "" ||
        item.question.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(this.searchQuery.toLowerCase())

      const matchesCategory = this.selectedCategory === "" || item.category === this.selectedCategory

      return matchesSearch && matchesCategory
    })

    // Filter categories
    this.filteredCategories = this.supportCategories.filter((category) => {
      if (this.searchQuery === "") return true

      return (
        category.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    })
  }

  onSearchChange(): void {
    this.applyFilters()
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = this.selectedCategory === categoryId ? "" : categoryId
    this.applyFilters()
  }

  clearFilters(): void {
    this.searchQuery = ""
    this.selectedCategory = ""
    this.applyFilters()
  }

  // FAQ methods
  toggleFAQ(faq: FAQItem): void {
    faq.isExpanded = !faq.isExpanded
  }

  getCategoryName(categoryId: string): string {
    const category = this.supportCategories.find((cat) => cat.id === categoryId)
    return category ? category.name : categoryId
  }

  getCategoryIcon(categoryId: string): string {
    const category = this.supportCategories.find((cat) => cat.id === categoryId)
    return category ? category.icon : "bi-question-circle"
  }

  // Contact methods
  handleContactMethod(method: ContactMethod): void {
    switch (method.id) {
      case "live-chat":
        this.startLiveChat()
        break
      case "email":
        this.showContactForm = true
        this.contactForm.category = ""
        break
      case "phone":
        this.callSupport()
        break
      case "community":
        this.openCommunityForum()
        break
    }
  }

  startLiveChat(): void {
    // Implement live chat integration
    console.log("Starting live chat...")
    // This would typically integrate with a chat service like Intercom, Zendesk, etc.
  }

  callSupport(): void {
    // Open phone dialer or show phone number
    window.open("tel:+1234567890")
  }

  openCommunityForum(): void {
    // Open community forum in new tab
    window.open("https://community.yourapp.com", "_blank")
  }

  // Contact form methods
  closeContactForm(): void {
    this.showContactForm = false
    this.contactForm = {
      name: "",
      email: "",
      subject: "",
      category: "",
      message: "",
      priority: "medium",
    }
    this.contactError = null
    this.contactSubmitted = false
  }

  submitContactForm(): void {
    if (!this.validateContactForm()) {
      return
    }

    this.isSubmittingContact = true
    this.contactError = null

    // Simulate API call
    setTimeout(() => {
      // Simulate success/failure
      if (Math.random() > 0.1) {
        // 90% success rate
        this.contactSubmitted = true
        this.isSubmittingContact = false

        // Auto-close after 3 seconds
        setTimeout(() => {
          this.closeContactForm()
        }, 3000)
      } else {
        this.contactError = "Failed to submit your message. Please try again."
        this.isSubmittingContact = false
      }
    }, 2000)
  }

  validateContactForm(): boolean {
    if (!this.contactForm.name.trim()) {
      this.contactError = "Please enter your name"
      return false
    }

    if (!this.contactForm.email.trim() || !this.isValidEmail(this.contactForm.email)) {
      this.contactError = "Please enter a valid email address"
      return false
    }

    if (!this.contactForm.subject.trim()) {
      this.contactError = "Please enter a subject"
      return false
    }

    if (!this.contactForm.message.trim()) {
      this.contactError = "Please enter your message"
      return false
    }

    return true
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Utility methods
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  exportFAQs(): void {
    const faqText = this.filteredFAQs.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}\n\n`).join("")

    const blob = new Blob([faqText], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "support-faqs.txt"
    a.click()
    window.URL.revokeObjectURL(url)
  }
}
