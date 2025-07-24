import { Component,  OnInit,  OnDestroy } from "@angular/core"
import  { ActivatedRoute } from "@angular/router"
import  { Subscription } from "rxjs"
import { TranslationService } from "src/app/services/translation.service"

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
export class SupportHelpComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []

  userId: string | null = ""
  currentLanguage = "en"

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

  // Multilingual support categories
  supportCategoriesData = {
    en: [
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
    ],
    ar: [
      {
        id: "getting-started",
        name: "البدء",
        icon: "bi-rocket-takeoff",
        description: "تعلم أساسيات توليد الصوت",
        count: 8,
      },
      {
        id: "voice-generation",
        name: "توليد الصوت",
        icon: "bi-mic",
        description: "أسئلة حول إنشاء الصوت",
        count: 12,
      },
      {
        id: "billing-payments",
        name: "الفواتير والمدفوعات",
        icon: "bi-credit-card",
        description: "مساعدة في الدفع والاشتراك",
        count: 6,
      },
      {
        id: "account-settings",
        name: "إعدادات الحساب",
        icon: "bi-person-gear",
        description: "إدارة تفضيلات حسابك",
        count: 5,
      },
      {
        id: "technical-issues",
        name: "المشاكل التقنية",
        icon: "bi-tools",
        description: "استكشاف الأخطاء وإصلاحها",
        count: 9,
      },

    ],
    fr: [
      {
        id: "getting-started",
        name: "Commencer",
        icon: "bi-rocket-takeoff",
        description: "Apprenez les bases de la génération vocale",
        count: 8,
      },
      {
        id: "voice-generation",
        name: "Génération Vocale",
        icon: "bi-mic",
        description: "Questions sur la création audio",
        count: 12,
      },
      {
        id: "billing-payments",
        name: "Facturation et Paiements",
        icon: "bi-credit-card",
        description: "Aide pour les paiements et abonnements",
        count: 6,
      },
      {
        id: "account-settings",
        name: "Paramètres du Compte",
        icon: "bi-person-gear",
        description: "Gérez vos préférences de compte",
        count: 5,
      },
      {
        id: "technical-issues",
        name: "Problèmes Techniques",
        icon: "bi-tools",
        description: "Dépannage et rapports de bugs",
        count: 9,
      },

    ],
    es: [
      {
        id: "getting-started",
        name: "Comenzar",
        icon: "bi-rocket-takeoff",
        description: "Aprende los conceptos básicos de generación de voz",
        count: 8,
      },
      {
        id: "voice-generation",
        name: "Generación de Voz",
        icon: "bi-mic",
        description: "Preguntas sobre creación de audio",
        count: 12,
      },
      {
        id: "billing-payments",
        name: "Facturación y Pagos",
        icon: "bi-credit-card",
        description: "Ayuda con pagos y suscripciones",
        count: 6,
      },
      {
        id: "account-settings",
        name: "Configuración de Cuenta",
        icon: "bi-person-gear",
        description: "Gestiona las preferencias de tu cuenta",
        count: 5,
      },
      {
        id: "technical-issues",
        name: "Problemas Técnicos",
        icon: "bi-tools",
        description: "Solución de problemas y reportes de errores",
        count: 9,
      },

    ],
  }

  // Multilingual contact methods
  contactMethodsData = {
    en: [
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
    ],
    ar: [
      {
        id: "live-chat",
        name: "دردشة مباشرة",
        icon: "bi-chat-dots",
        description: "احصل على مساعدة فورية من فريق الدعم",
        action: "بدء الدردشة",
        available: true,
      },
      {
        id: "email",
        name: "دعم البريد الإلكتروني",
        icon: "bi-envelope",
        description: "أرسل لنا رسالة مفصلة",
        action: "إرسال بريد إلكتروني",
        available: true,
      },
      {
        id: "phone",
        name: "الدعم الهاتفي",
        icon: "bi-telephone",
        description: "تحدث مباشرة مع فريقنا",
        action: "اتصل الآن",
        available: false,
      },
      {
        id: "community",
        name: "منتدى المجتمع",
        icon: "bi-people",
        description: "تواصل مع المستخدمين الآخرين",
        action: "زيارة المنتدى",
        available: true,
      },
    ],
    fr: [
      {
        id: "live-chat",
        name: "Chat en Direct",
        icon: "bi-chat-dots",
        description: "Obtenez une aide instantanée de notre équipe",
        action: "Démarrer le Chat",
        available: true,
      },
      {
        id: "email",
        name: "Support Email",
        icon: "bi-envelope",
        description: "Envoyez-nous un message détaillé",
        action: "Envoyer un Email",
        available: true,
      },
      {
        id: "phone",
        name: "Support Téléphonique",
        icon: "bi-telephone",
        description: "Parlez directement avec notre équipe",
        action: "Appeler Maintenant",
        available: false,
      },
      {
        id: "community",
        name: "Forum Communautaire",
        icon: "bi-people",
        description: "Connectez-vous avec d'autres utilisateurs",
        action: "Visiter le Forum",
        available: true,
      },
    ],
    es: [
      {
        id: "live-chat",
        name: "Chat en Vivo",
        icon: "bi-chat-dots",
        description: "Obtén ayuda instantánea de nuestro equipo",
        action: "Iniciar Chat",
        available: true,
      },
      {
        id: "email",
        name: "Soporte por Email",
        icon: "bi-envelope",
        description: "Envíanos un mensaje detallado",
        action: "Enviar Email",
        available: true,
      },
      {
        id: "phone",
        name: "Soporte Telefónico",
        icon: "bi-telephone",
        description: "Habla directamente con nuestro equipo",
        action: "Llamar Ahora",
        available: false,
      },
      {
        id: "community",
        name: "Foro de la Comunidad",
        icon: "bi-people",
        description: "Conéctate con otros usuarios",
        action: "Visitar Foro",
        available: true,
      },
    ],
  }

  // Multilingual FAQ items
  faqItemsData = {
    en: [
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
    ],
    ar: [
      {
        id: "1",
        question: "كيف أولد أول صوت لي؟",
        answer:
          "لتوليد أول صوت لك: 1) اختر صوتاً من مكتبتنا، 2) أدخل نصك (حتى 100 حرف مجاناً)، 3) انقر على 'توليد الكلام'، 4) استمع للصوت المولد. للنصوص الأطول، ستحتاج لاستخدام خدمتنا المدفوعة.",
        category: "getting-started",
      },
      {
        id: "2",
        question: "ما هي اللغات المدعومة؟",
        answer:
          "ندعم أكثر من 32 لغة بما في ذلك الإنجليزية والفرنسية والإسبانية والعربية والدارجة المغربية والألمانية والإيطالية والبرتغالية والهندية والصينية واليابانية والكورية وغيرها الكثير. كل لغة لها خيارات أصوات متعددة متاحة.",
        category: "voice-generation",
      },
      {
        id: "3",
        question: "كيف يعمل نظام التسعير؟",
        answer:
          "نقدم طبقة مجانية بـ 100 حرف لكل توليد. للنصوص الأطول، نتقاضى رسوماً لكل حرف. يمكنك إما الدفع لكل استخدام أو إضافة أموال لرصيد حسابك للاستخدام المريح. تحقق من صفحة التسعير للأسعار الحالية.",
        category: "billing-payments",
      },
      {
        id: "4",
        question: "هل يمكنني استخدام صوتي الخاص؟",
        answer:
          "نعم! نقدم خدمات استنساخ الصوت حيث يمكنك رفع عينات من صوتك وإنشاء نموذج صوت مخصص. هذه الميزة تتطلب اشتراكاً مميزاً وعينات صوتية لا تقل عن 10 دقائق.",
        category: "voice-generation",
      },
      {
        id: "5",
        question: "ما هي طرق الدفع التي تقبلونها؟",
        answer:
          "نقبل PayPal وبطاقات الائتمان الرئيسية (Visa، MasterCard، American Express) والتحويلات البنكية. جميع المدفوعات تتم معالجتها بأمان من خلال شركائنا في الدفع.",
        category: "billing-payments",
      },
      {
        id: "6",
        question: "كيف أغير إعدادات حسابي؟",
        answer:
          "اذهب إلى لوحة تحكم حسابك، انقر على 'الإعدادات' في الشريط الجانبي. من هناك يمكنك تحديث معلومات ملفك الشخصي وتغيير كلمة المرور وإدارة تفضيلات الإشعارات وتحديث معلومات الفواتير.",
        category: "account-settings",
      },
      {
        id: "7",
        question: "لماذا يفشل توليد الصوت؟",
        answer:
          "قد يفشل توليد الصوت بسبب: 1) مشاكل الاتصال بالشبكة، 2) النص يحتوي على أحرف غير مدعومة، 3) زيادة الحمل على الخادم في أوقات الذروة، 4) رصيد الحساب غير كافٍ. حاول مرة أخرى أو اتصل بالدعم إذا استمرت المشكلة.",
        category: "technical-issues",
      },

    ],
    fr: [
      {
        id: "1",
        question: "Comment générer mon premier audio vocal?",
        answer:
          "Pour générer votre premier audio vocal: 1) Sélectionnez une voix de notre bibliothèque, 2) Entrez votre texte (jusqu'à 100 caractères gratuitement), 3) Cliquez sur 'Générer la Parole', 4) Écoutez votre audio généré. Pour des textes plus longs, vous devrez utiliser notre service payant.",
        category: "getting-started",
      },
      {
        id: "2",
        question: "Quelles langues sont supportées?",
        answer:
          "Nous supportons plus de 32 langues incluant l'anglais, le français, l'espagnol, l'arabe, le darija (arabe marocain), l'allemand, l'italien, le portugais, l'hindi, le chinois, le japonais, le coréen, et bien d'autres. Chaque langue a plusieurs options de voix disponibles.",
        category: "voice-generation",
      },
      {
        id: "3",
        question: "Comment fonctionne la tarification?",
        answer:
          "Nous offrons un niveau gratuit avec 100 caractères par génération. Pour des textes plus longs, nous facturons par caractère. Vous pouvez soit payer à l'usage soit ajouter des fonds à votre solde de compte pour un usage pratique. Consultez notre page de tarification pour les tarifs actuels.",
        category: "billing-payments",
      },
      {
        id: "4",
        question: "Puis-je utiliser ma propre voix?",
        answer:
          "Oui! Nous offrons des services de clonage vocal où vous pouvez télécharger des échantillons de votre voix et créer un modèle vocal personnalisé. Cette fonctionnalité nécessite un abonnement premium et des échantillons vocaux d'au moins 10 minutes.",
        category: "voice-generation",
      },
      {
        id: "5",
        question: "Quels moyens de paiement acceptez-vous?",
        answer:
          "Nous acceptons PayPal, les principales cartes de crédit (Visa, MasterCard, American Express), et les virements bancaires. Tous les paiements sont traités de manière sécurisée par nos partenaires de paiement.",
        category: "billing-payments",
      },
      {
        id: "6",
        question: "Comment changer les paramètres de mon compte?",
        answer:
          "Allez à votre tableau de bord de compte, cliquez sur 'Paramètres' dans la barre latérale. De là, vous pouvez mettre à jour vos informations de profil, changer votre mot de passe, gérer les préférences de notification, et mettre à jour les informations de facturation.",
        category: "account-settings",
      },
      {
        id: "7",
        question: "Pourquoi ma génération audio échoue-t-elle?",
        answer:
          "La génération audio peut échouer à cause de: 1) Problèmes de connectivité réseau, 2) Texte contenant des caractères non supportés, 3) Surcharge du serveur pendant les heures de pointe, 4) Solde de compte insuffisant. Réessayez ou contactez le support si le problème persiste.",
        category: "technical-issues",
      },

    ],
    es: [
      {
        id: "1",
        question: "¿Cómo genero mi primer audio de voz?",
        answer:
          "Para generar tu primer audio de voz: 1) Selecciona una voz de nuestra biblioteca, 2) Ingresa tu texto (hasta 100 caracteres gratis), 3) Haz clic en 'Generar Habla', 4) Escucha tu audio generado. Para textos más largos, necesitarás usar nuestro servicio de pago.",
        category: "getting-started",
      },
      {
        id: "2",
        question: "¿Qué idiomas están soportados?",
        answer:
          "Soportamos más de 32 idiomas incluyendo inglés, francés, español, árabe, darija (árabe marroquí), alemán, italiano, portugués, hindi, chino, japonés, coreano, y muchos más. Cada idioma tiene múltiples opciones de voz disponibles.",
        category: "voice-generation",
      },
      {
        id: "3",
        question: "¿Cómo funciona el precio?",
        answer:
          "Ofrecemos un nivel gratuito con 100 caracteres por generación. Para textos más largos, cobramos por carácter. Puedes pagar por uso o agregar fondos al saldo de tu cuenta para uso conveniente. Consulta nuestra página de precios para las tarifas actuales.",
        category: "billing-payments",
      },
      {
        id: "4",
        question: "¿Puedo usar mi propia voz?",
        answer:
          "¡Sí! Ofrecemos servicios de clonación de voz donde puedes subir muestras de tu voz y crear un modelo de voz personalizado. Esta función requiere una suscripción premium y muestras de voz de al menos 10 minutos.",
        category: "voice-generation",
      },
      {
        id: "5",
        question: "¿Qué métodos de pago aceptan?",
        answer:
          "Aceptamos PayPal, principales tarjetas de crédito (Visa, MasterCard, American Express), y transferencias bancarias. Todos los pagos se procesan de forma segura a través de nuestros socios de pago.",
        category: "billing-payments",
      },
      {
        id: "6",
        question: "¿Cómo cambio la configuración de mi cuenta?",
        answer:
          "Ve a tu panel de cuenta, haz clic en 'Configuración' en la barra lateral. Desde ahí puedes actualizar tu información de perfil, cambiar tu contraseña, gestionar preferencias de notificación, y actualizar información de facturación.",
        category: "account-settings",
      },
      {
        id: "7",
        question: "¿Por qué falla mi generación de audio?",
        answer:
          "La generación de audio puede fallar debido a: 1) Problemas de conectividad de red, 2) Texto que contiene caracteres no soportados, 3) Sobrecarga del servidor durante horas pico, 4) Saldo de cuenta insuficiente. Inténtalo de nuevo o contacta soporte si el problema persiste.",
        category: "technical-issues",
      },

    ],
  }

  // Filtered items
  filteredFAQs: FAQItem[] = []
  filteredCategories: SupportCategory[] = []

  constructor(
    private route: ActivatedRoute,
    private translationService: TranslationService,
  ) {}

  ngOnInit(): void {
    // Get user ID from parent route
    this.route.parent?.paramMap.subscribe((params) => {
      this.userId = params.get("uuid") || ""
    })

    // Subscribe to language changes from the existing translation service
    this.currentLanguage = this.translationService.getCurrentLanguage()
    // Load initial data
    this.loadLocalizedData()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  // Translation helper method

  // Language change handler
  private loadLocalizedData(): void {
    // Get localized data using the same structure as generation component
    this.supportCategories = this.getLocalizedCategories()
    this.contactMethods = this.getLocalizedContactMethods()
    this.faqItems = this.getLocalizedFAQs()

    // Update category counts
    this.updateCategoryCounts()

    // Apply filters to update displayed data
    this.applyFilters()
  }

  // Get localized data methods
  getLocalizedCategories(): SupportCategory[] {
    return (
      this.supportCategoriesData[this.currentLanguage as keyof typeof this.supportCategoriesData] ||
      this.supportCategoriesData.en
    )
  }

  getLocalizedContactMethods(): ContactMethod[] {
    return (
      this.contactMethodsData[this.currentLanguage as keyof typeof this.contactMethodsData] ||
      this.contactMethodsData.en
    )
  }

  getLocalizedFAQs(): FAQItem[] {
    return this.faqItemsData[this.currentLanguage as keyof typeof this.faqItemsData] || this.faqItemsData.en
  }

  // Search and filter methods
  applyFilters(): void {
    const localizedFAQs = this.getLocalizedFAQs()
    const localizedCategories = this.getLocalizedCategories()

    // Filter FAQs
    this.filteredFAQs = localizedFAQs.filter((item) => {
      const matchesSearch =
        this.searchQuery === "" ||
        item.question.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(this.searchQuery.toLowerCase())

      const matchesCategory = this.selectedCategory === "" || item.category === this.selectedCategory

      return matchesSearch && matchesCategory
    })

    // Filter categories
    this.filteredCategories = localizedCategories.filter((category) => {
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
    const categories = this.getLocalizedCategories()
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : categoryId
  }

  getCategoryIcon(categoryId: string): string {
    const categories = this.getLocalizedCategories()
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.icon : "bi-question-circle"
  }

  markHelpful(faqId: string): void {
    console.log(`FAQ ${faqId} marked as helpful`)
    // Implement analytics tracking here
  }

  markNotHelpful(faqId: string): void {
    console.log(`FAQ ${faqId} marked as not helpful`)
    // Implement analytics tracking here
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

  // Quick actions
  openDocumentation(): void {
    window.open("/docs", "_blank")
  }

  openTutorials(): void {
    window.open("/tutorials", "_blank")
  }

  reportBug(): void {
    this.showContactForm = true
    this.contactForm.category = "technical-issues"
  }

  requestFeature(): void {
    this.showContactForm = true
    this.contactForm.category = "api-integration"
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
    a.download = `support-faqs-${this.currentLanguage}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  supportCategories: SupportCategory[] | undefined
  contactMethods: ContactMethod[] | undefined
  faqItems: FAQItem[] | undefined
  updateLanguageDirection(): void {
    // Method stub
  }
  updateCategoryCounts(): void {
    // Method stub
  }
}
