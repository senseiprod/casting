import { Component,  OnInit,  OnDestroy } from "@angular/core"
import  { ActivatedRoute } from "@angular/router"
import  { Subscription } from "rxjs"
import  { TranslationService } from "src/app/services/translation.service"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  isExpanded?: boolean
  tags?: string[]
  difficulty: string
}

interface SupportCategory {
  id: string
  name: string
  icon: string
  description: string
  count: number
  color?: string
}

interface ContactMethod {
  id: string
  name: string
  icon: string
  description: string
  action: string
  available: boolean
  estimatedResponse?: string
}

interface GuideStep {
  id: string
  title: string
  description: string
  icon: string
  completed?: boolean
}

interface TutorialVideo {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
}

@Component({
  selector: "app-support-help",
  templateUrl: "./support-help.component.html",
  styleUrls: ["./support-help.component.css"],
})
export class SupportHelpComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []

  userId: string | null = ""
  currentLanguage = "en"

  // Search and filtering
  searchQuery = ""
  selectedCategory = ""
  selectedDifficulty = ""

  // Contact form
  showContactForm = false
  contactForm = {
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
    priority: "medium",
    attachments: [] as File[],
  }
  isSubmittingContact = false
  contactSubmitted = false
  contactError: string | null = null

  // Tutorial and guide state
  showGettingStartedGuide = false
  currentGuideStep = 0
  showVideoTutorials = false
  selectedVideoCategory = ""

  // Feature showcase
  showFeatureShowcase = false
  currentFeature = 0

  // Static data that will be translated via translation keys
  supportCategories: SupportCategory[] = [
    {
      id: "getting-started",
      name: "support.categories.gettingStarted.name",
      icon: "bi-rocket-takeoff",
      description: "support.categories.gettingStarted.description",
      count: 12,
      color: "#3b82f6",
    },
    {
      id: "voice-generation",
      name: "support.categories.voiceGeneration.name",
      icon: "bi-mic",
      description: "support.categories.voiceGeneration.description",
      count: 18,
      color: "#10b981",
    },
    {
      id: "voice-selection",
      name: "support.categories.voiceSelection.name",
      icon: "bi-person-voice",
      description: "support.categories.voiceSelection.description",
      count: 15,
      color: "#8b5cf6",
    },
    {
      id: "billing-payments",
      name: "support.categories.billingPayments.name",
      icon: "bi-credit-card",
      description: "support.categories.billingPayments.description",
      count: 10,
      color: "#f59e0b",
    },
    {
      id: "projects-management",
      name: "support.categories.projectsManagement.name",
      icon: "bi-folder",
      description: "support.categories.projectsManagement.description",
      count: 8,
      color: "#ef4444",
    },
    {
      id: "languages-dialects",
      name: "support.categories.languagesDialects.name",
      icon: "bi-globe",
      description: "support.categories.languagesDialects.description",
      count: 14,
      color: "#06b6d4",
    },
    {
      id: "audio-quality",
      name: "support.categories.audioQuality.name",
      icon: "bi-soundwave",
      description: "support.categories.audioQuality.description",
      count: 9,
      color: "#84cc16",
    },
    {
      id: "account-settings",
      name: "support.categories.accountSettings.name",
      icon: "bi-person-gear",
      description: "support.categories.accountSettings.description",
      count: 7,
      color: "#6366f1",
    },
    {
      id: "technical-issues",
      name: "support.categories.technicalIssues.name",
      icon: "bi-tools",
      description: "support.categories.technicalIssues.description",
      count: 11,
      color: "#dc2626",
    },
  ]

  // FAQ items with translation keys
  faqItems: FAQItem[] = [
    {
      id: "1",
      question: "support.faq.firstGeneration.question",
      answer: "support.faq.firstGeneration.answer",
      category: "getting-started",
      tags: ["first-time", "basic", "tutorial"],
      difficulty: "beginner",
    },
    {
      id: "2",
      question: "support.faq.freeVsPaid.question",
      answer: "support.faq.freeVsPaid.answer",
      category: "getting-started",
      tags: ["free", "paid", "limits"],
      difficulty: "beginner",
    },
    {
      id: "3",
      question: "support.faq.supportedLanguages.question",
      answer: "support.faq.supportedLanguages.answer",
      category: "voice-generation",
      tags: ["languages", "voices", "darija", "multilingual"],
      difficulty: "beginner",
    },
    {
      id: "4",
      question: "support.faq.voiceSelection.question",
      answer: "support.faq.voiceSelection.answer",
      category: "voice-selection",
      tags: ["selection", "filters", "preview"],
      difficulty: "beginner",
    },
    {
      id: "5",
      question: "support.faq.voiceCustomization.question",
      answer: "support.faq.voiceCustomization.answer",
      category: "voice-selection",
      tags: ["customization", "settings", "emotion", "speed"],
      difficulty: "intermediate",
    },
    {
      id: "6",
      question: "support.faq.paymentMethods.question",
      answer: "support.faq.paymentMethods.answer",
      category: "billing-payments",
      tags: ["payment", "paypal", "credit-card", "bank-transfer"],
      difficulty: "beginner",
    },
    {
      id: "7",
      question: "support.faq.accountBalance.question",
      answer: "support.faq.accountBalance.answer",
      category: "billing-payments",
      tags: ["balance", "charging", "automatic-payment"],
      difficulty: "intermediate",
    },
    {
      id: "8",
      question: "support.faq.pricingCalculation.question",
      answer: "support.faq.pricingCalculation.answer",
      category: "billing-payments",
      tags: ["pricing", "per-character", "cost-calculation"],
      difficulty: "beginner",
    },
    {
      id: "9",
      question: "support.faq.projectOrganization.question",
      answer: "support.faq.projectOrganization.answer",
      category: "projects-management",
      tags: ["projects", "organization", "management"],
      difficulty: "beginner",
    },
    {
      id: "10",
      question: "support.faq.audioDownload.question",
      answer: "support.faq.audioDownload.answer",
      category: "projects-management",
      tags: ["download", "sharing", "audio-files"],
      difficulty: "beginner",
    },
    {
      id: "11",
      question: "support.faq.darijaSpecial.question",
      answer: "support.faq.darijaSpecial.answer",
      category: "languages-dialects",
      tags: ["darija", "moroccan-arabic", "lahajati", "dialects"],
      difficulty: "intermediate",
    },
    {
      id: "12",
      question: "support.faq.languageSwitching.question",
      answer: "support.faq.languageSwitching.answer",
      category: "languages-dialects",
      tags: ["interface", "language-switching", "localization"],
      difficulty: "beginner",
    },
    {
      id: "13",
      question: "support.faq.audioQualityImprovement.question",
      answer: "support.faq.audioQualityImprovement.answer",
      category: "audio-quality",
      tags: ["quality", "optimization", "settings", "best-practices"],
      difficulty: "intermediate",
    },
    {
      id: "14",
      question: "support.faq.generationFailure.question",
      answer: "support.faq.generationFailure.answer",
      category: "technical-issues",
      tags: ["troubleshooting", "errors", "generation-failure"],
      difficulty: "intermediate",
    },
    {
      id: "15",
      question: "support.faq.accountUpdate.question",
      answer: "support.faq.accountUpdate.answer",
      category: "account-settings",
      tags: ["profile", "settings", "preferences", "account-management"],
      difficulty: "beginner",
    },
    {
      id: "16",
      question: "support.faq.audioPlayerIssues.question",
      answer: "support.faq.audioPlayerIssues.answer",
      category: "technical-issues",
      tags: ["audio-player", "browser-compatibility", "troubleshooting"],
      difficulty: "intermediate",
    },
  ]

  // Contact methods with translation keys
  contactMethods: ContactMethod[] = [
    {
      id: "live-chat",
      name: "support.contact.liveChat.name",
      icon: "bi-chat-dots",
      description: "support.contact.liveChat.description",
      action: "support.contact.liveChat.action",
      available: true,
      estimatedResponse: "support.contact.liveChat.response",
    },
    {
      id: "email",
      name: "support.contact.email.name",
      icon: "bi-envelope",
      description: "support.contact.email.description",
      action: "support.contact.email.action",
      available: true,
      estimatedResponse: "support.contact.email.response",
    },
    {
      id: "phone",
      name: "support.contact.phone.name",
      icon: "bi-telephone",
      description: "support.contact.phone.description",
      action: "support.contact.phone.action",
      available: false,
      estimatedResponse: "support.contact.phone.response",
    },
    {
      id: "community",
      name: "support.contact.community.name",
      icon: "bi-people",
      description: "support.contact.community.description",
      action: "support.contact.community.action",
      available: true,
      estimatedResponse: "support.contact.community.response",
    },
    {
      id: "video-call",
      name: "support.contact.videoCall.name",
      icon: "bi-camera-video",
      description: "support.contact.videoCall.description",
      action: "support.contact.videoCall.action",
      available: true,
      estimatedResponse: "support.contact.videoCall.response",
    },
  ]

  // Getting started guide steps with translation keys
  gettingStartedSteps: GuideStep[] = [
    {
      id: "1",
      title: "support.guide.createAccount.title",
      description: "support.guide.createAccount.description",
      icon: "bi-person-plus",
      completed: false,
    },
    {
      id: "2",
      title: "support.guide.exploreVoices.title",
      description: "support.guide.exploreVoices.description",
      icon: "bi-collection",
      completed: false,
    },
    {
      id: "3",
      title: "support.guide.tryFree.title",
      description: "support.guide.tryFree.description",
      icon: "bi-play-circle",
      completed: false,
    },
    {
      id: "4",
      title: "support.guide.setupPayment.title",
      description: "support.guide.setupPayment.description",
      icon: "bi-credit-card",
      completed: false,
    },
    {
      id: "5",
      title: "support.guide.createProject.title",
      description: "support.guide.createProject.description",
      icon: "bi-folder-plus",
      completed: false,
    },
    {
      id: "6",
      title: "support.guide.generateAudio.title",
      description: "support.guide.generateAudio.description",
      icon: "bi-mic",
      completed: false,
    },
  ]

  // Tutorial videos with translation keys
  tutorialVideos: TutorialVideo[] = [
    {
      id: "1",
      title: "support.tutorials.gettingStarted.title",
      description: "support.tutorials.gettingStarted.description",
      duration: "5:30",
      thumbnail: "/assets/images/tutorials/getting-started.jpg",
      category: "getting-started",
      difficulty: "beginner",
    },
    {
      id: "2",
      title: "support.tutorials.voiceCustomization.title",
      description: "support.tutorials.voiceCustomization.description",
      duration: "8:15",
      thumbnail: "/assets/images/tutorials/voice-customization.jpg",
      category: "voice-selection",
      difficulty: "intermediate",
    },
    {
      id: "3",
      title: "support.tutorials.darijaVoices.title",
      description: "support.tutorials.darijaVoices.description",
      duration: "6:45",
      thumbnail: "/assets/images/tutorials/darija-voices.jpg",
      category: "languages-dialects",
      difficulty: "intermediate",
    },
    {
      id: "4",
      title: "support.tutorials.projectManagement.title",
      description: "support.tutorials.projectManagement.description",
      duration: "4:20",
      thumbnail: "/assets/images/tutorials/project-management.jpg",
      category: "projects-management",
      difficulty: "beginner",
    },
    {
      id: "5",
      title: "support.tutorials.billing.title",
      description: "support.tutorials.billing.description",
      duration: "7:10",
      thumbnail: "/assets/images/tutorials/billing-payments.jpg",
      category: "billing-payments",
      difficulty: "beginner",
    },
  ]

  // Feature showcase items with translation keys
  featureShowcaseItems = [
    {
      id: "1",
      title: "support.features.languages.title",
      description: "support.features.languages.description",
      icon: "bi-globe",
      image: "/assets/images/features/languages.jpg",
    },
    {
      id: "2",
      title: "support.features.customization.title",
      description: "support.features.customization.description",
      icon: "bi-sliders",
      image: "/assets/images/features/customization.jpg",
    },
    {
      id: "3",
      title: "support.features.payments.title",
      description: "support.features.payments.description",
      icon: "bi-credit-card",
      image: "/assets/images/features/payments.jpg",
    },
    {
      id: "4",
      title: "support.features.projects.title",
      description: "support.features.projects.description",
      icon: "bi-folder-check",
      image: "/assets/images/features/projects.jpg",
    },
  ]

  // Filtered items
  filteredFAQs: FAQItem[] = []
  filteredCategories: SupportCategory[] = []
  filteredTutorials: TutorialVideo[] = []

  constructor(
    private route: ActivatedRoute,
    private translationService: TranslationService,
  ) {}

  ngOnInit(): void {
    // Get user ID from parent route
    this.route.parent?.paramMap.subscribe((params) => {
      this.userId = params.get("uuid") || ""
    })

    // Subscribe to language changes
    const langSub = this.translationService.currentLanguage$.subscribe((language) => {
      this.currentLanguage = language
      this.loadLocalizedData()
    })
    this.subscriptions.push(langSub)

    this.currentLanguage = this.translationService.getCurrentLanguage()
    this.loadLocalizedData()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  private loadLocalizedData(): void {
    this.updateCategoryCounts()
    this.applyFilters()
  }

  // Enhanced search and filter methods
  applyFilters(): void {
    // Filter FAQs
    this.filteredFAQs = this.faqItems.filter((item) => {
      const matchesSearch =
        this.searchQuery === "" ||
        item.question.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(this.searchQuery.toLowerCase()))

      const matchesCategory = this.selectedCategory === "" || item.category === this.selectedCategory
      const matchesDifficulty = this.selectedDifficulty === "" || item.difficulty === this.selectedDifficulty

      return matchesSearch && matchesCategory && matchesDifficulty
    })

    // Filter categories
    this.filteredCategories = this.supportCategories.filter((category) => {
      if (this.searchQuery === "") return true
      return (
        category.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    })

    // Filter tutorials
    this.filteredTutorials = this.tutorialVideos.filter((tutorial) => {
      const matchesSearch =
        this.searchQuery === "" ||
        tutorial.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(this.searchQuery.toLowerCase())

      const matchesCategory = this.selectedVideoCategory === "" || tutorial.category === this.selectedVideoCategory
      const matchesDifficulty = this.selectedDifficulty === "" || tutorial.difficulty === this.selectedDifficulty

      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }

  onSearchChange(): void {
    this.applyFilters()
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = this.selectedCategory === categoryId ? "" : categoryId
    this.applyFilters()
    const element = document.getElementById("fqa")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  selectDifficulty(difficulty: string): void {
    this.selectedDifficulty = this.selectedDifficulty === difficulty ? "" : difficulty
    this.applyFilters()
  }

  clearFilters(): void {
    this.searchQuery = ""
    this.selectedCategory = ""
    this.selectedDifficulty = ""
    this.selectedVideoCategory = ""
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

  getCategoryColor(categoryId: string): string {
    const category = this.supportCategories.find((cat) => cat.id === categoryId)
    return category?.color || "#6366f1"
  }

  markHelpful(faqId: string): void {
    console.log(`FAQ ${faqId} marked as helpful`)
    // Implement analytics tracking
  }

  markNotHelpful(faqId: string): void {
    console.log(`FAQ ${faqId} marked as not helpful`)
    // Implement analytics tracking
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
      case "video-call":
        this.scheduleVideoCall()
        break
    }
  }

  startLiveChat(): void {
    console.log("Starting live chat...")
    // Integrate with chat service
  }

  callSupport(): void {
    window.open("tel:+1234567890")
  }

  openCommunityForum(): void {
    window.open("https://community.yourapp.com", "_blank")
  }

  scheduleVideoCall(): void {
    window.open("https://calendly.com/yourapp-support", "_blank")
  }

  // Guide and tutorial methods
  startGettingStartedGuide(): void {
    this.showGettingStartedGuide = true
    this.currentGuideStep = 0
  }

  nextGuideStep(): void {
    if (this.currentGuideStep < this.gettingStartedSteps.length - 1) {
      this.gettingStartedSteps[this.currentGuideStep].completed = true
      this.currentGuideStep++
    }
  }

  previousGuideStep(): void {
    if (this.currentGuideStep > 0) {
      this.currentGuideStep--
    }
  }

  completeGuide(): void {
    this.gettingStartedSteps[this.currentGuideStep].completed = true
    this.showGettingStartedGuide = false
  }

  openVideoTutorials(): void {
    this.showVideoTutorials = true
    const element = document.getElementById("video")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  playTutorialVideo(video: TutorialVideo): void {
    console.log(`Playing tutorial video: ${video.title}`)
    // Implement video player
  }

  // Feature showcase
  openFeatureShowcase(): void {
    this.showFeatureShowcase = true
    this.currentFeature = 0
  }

  nextFeature(): void {
    this.currentFeature = (this.currentFeature + 1) % this.featureShowcaseItems.length
  }

  previousFeature(): void {
    this.currentFeature = this.currentFeature === 0 ? this.featureShowcaseItems.length - 1 : this.currentFeature - 1
  }

  // Quick actions
  openDocumentation(): void {
    const element = document.getElementById("fqa")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  openTutorials(): void {
    this.openVideoTutorials()
  }

  reportBug(): void {
    this.showContactForm = true
    this.contactForm.category = "technical-issues"
    this.contactForm.subject = "Bug Report"
  }

  requestFeature(): void {
    this.showContactForm = true
    this.contactForm.category = "api-integration"
    this.contactForm.subject = "Feature Request"
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
      attachments: [],
    }
    this.contactError = null
    this.contactSubmitted = false
  }

  onFileSelect(event: any): void {
    const files = Array.from(event.target.files) as File[]
    this.contactForm.attachments = [...this.contactForm.attachments, ...files]
  }

  removeAttachment(index: number): void {
    this.contactForm.attachments.splice(index, 1)
  }

  submitContactForm(): void {
    if (!this.validateContactForm()) {
      return
    }

    this.isSubmittingContact = true
    this.contactError = null

    // Simulate API call
    setTimeout(() => {
      if (Math.random() > 0.1) {
        this.contactSubmitted = true
        this.isSubmittingContact = false
        setTimeout(() => {
          this.closeContactForm()
        }, 3000)
      } else {
        this.contactError = "Failed to send message. Please try again."
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
    a.download = `voice-generation-faqs-${this.currentLanguage}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  updateCategoryCounts(): void {
    const faqCounts = this.faqItems.reduce(
      (counts, faq) => {
        counts[faq.category] = (counts[faq.category] || 0) + 1
        return counts
      },
      {} as Record<string, number>,
    )

    this.supportCategories.forEach((category) => {
      category.count = faqCounts[category.id] || 0
    })
  }
}
