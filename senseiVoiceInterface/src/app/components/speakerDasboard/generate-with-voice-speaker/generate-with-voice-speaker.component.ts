import { Component,  OnInit } from "@angular/core"
import  { ElevenLabsService } from "../../../services/eleven-labs.service"
import  { Voice } from "../../../services/eleven-labs.service"
import  { DomSanitizer, SafeUrl } from "@angular/platform-browser"
import  { ProjectService } from "../../../services/project.service"
import  { Project } from "../../../services/project.service"
import  { ActionService } from "../../../services/action.service"
import  { ActivatedRoute, Router } from "@angular/router"
import  { Voix2Response,VoiceElenlabsService } from "../../../services/voice-elenlabs.service"
@Component({
  selector: 'app-generate-with-voice-speaker',
  templateUrl: './generate-with-voice-speaker.component.html',
  styleUrls: ['./generate-with-voice-speaker.component.css']
})
export class GenerateWithVoiceSpeakerComponent {
  voices: Voice[] = []
  filteredVoices: Voice[] = []
  selectedVoice: Voice | null = null

  speakerName = ""
  speakerId = ""
  audio = new Audio()
  showVoiceSelection = true
  showVoice = false
  currentPage = 1
  voicesPerPage = 3
  emotions = ["neutral", "happy", "sad", "angry"]
  selectedEmotion = "Neutral"
  vitess = 1.0
  rate = 44100
  temperature = 1.0
  actionData = { text: "The sensei prod voice generator can deliver high-quality, human-like speech in 32 languages." }
  price = 0.05 // Example price per character
  baseUrl = "https://api.voice-service.com"
  audioUrl: SafeUrl | null = null
  audioPlayer = new Audio()
  voiceId = "sarah_voice"
  userId: string | null = ""

  // Project related properties
  projects: Project[] = []
  selectedProject: Project | null = null
  showProjectSelection = false
  isGenerating = false
  generationSuccess = false
  generationError: string | null = null

  // Tab selection
  activeTab: "free" | "request" = "free"

  // Character limits
  freeTestCharLimit = 100

  // Checkout data
  checkoutData = {
    textLength: 0,
    price: 0,
    totalPrice: 0,
    voiceId: "",
    voiceName: "",
  }

  constructor(
    private elevenLabsService: ElevenLabsService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private projectService: ProjectService,
    private actionService: ActionService,
    private voix2Service: VoiceElenlabsService,
  ) {
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      this.userId = params.get("uuid") || ""
    })
    this.voix2Service.getVoicesBySpeaker(this.userId).subscribe((data) => {
      if (data) {
        this.voices = data.map((v): Voice => ({
          id: v.elevenlabs_id,
          name: v.name,
          gender: v.gender,
          ageZone: '', // À compléter si tu l’as côté backend
          type: v.typeVoice,
          language: v.language,
          avatar: '', // Tu peux ajouter un champ dans `Voix2Response` si tu veux gérer l’avatar
          price: v.price,
          originalVoiceUrl: '', // Tu peux extraire depuis v.code ou autre si dispo
          clonedVoiceUrl: v.elevenlabs_id // Ou un champ plus clair s’il est prévu
        }));

        this.selectedVoice = this.voices[0];
      }
    });
      // If no speaker voice, fetch all voices
      this.fetchVoices()
      this.showVoiceSelection = false
      this.showVoice = true

    this.fetchUserProjects()
  }

  fetchUserProjects() {
    this.projectService.getAllProjects().subscribe(
      (data) => {
        this.projects = data
        console.log("Projects retrieved:", this.projects)
      },
      (error) => {
        console.error("Error retrieving projects:", error)
      },
    )
  }

  selectProject(project: Project) {
    this.selectedProject = project
    this.showProjectSelection = false
  }

  toggleProjectSelection() {
    this.showProjectSelection = !this.showProjectSelection
  }

  setActiveTab(tab: "free" | "request") {
    this.activeTab = tab
    // Reset error messages when switching tabs
    this.generationError = null
    this.generationSuccess = false
  }

  isTextOverLimit(): boolean {
    if (this.activeTab === "free") {
      return this.actionData.text.length > this.freeTestCharLimit
    }
    return false
  }

  limitText() {
    if (this.activeTab === "free" && this.actionData.text.length > this.freeTestCharLimit) {
      this.actionData.text = this.actionData.text.substring(0, this.freeTestCharLimit)
    }
  }

  generateSpeech() {
    if (!this.selectedVoice) {
      this.generationError = "Please select a voice first"
      return
    }

    // For free test, enforce character limit
    if (this.activeTab === "free") {
      if (this.actionData.text.length > this.freeTestCharLimit) {
        this.limitText()
      }
      this.processAudioGeneration()
    }
    // For audio request, proceed to checkout
    else if (this.activeTab === "request") {
      this.proceedToCheckout()
    }
  }

  processAudioGeneration() {
    this.isGenerating = true
    this.generationError = null
    this.generationSuccess = false

    this.elevenLabsService.textToSpeech(this.selectedVoice!.id, this.actionData.text).subscribe(
      (blob) => {
        const url = URL.createObjectURL(blob)
        this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(url)

        // If a project is selected, save the audio to that project
        if (this.selectedProject) {
          this.saveAudioToProject(blob)
        } else {
          this.isGenerating = false
          this.generationSuccess = true
        }
      },
      (error) => {
        console.error("Error generating speech:", error)
        this.isGenerating = false
        this.generationError = "Failed to generate speech. Please try again."
      },
    )
  }

  proceedToCheckout() {
    if (!this.selectedVoice) return

    // Prepare checkout data
    this.checkoutData = {
      textLength: this.actionData.text.length,
      price: this.selectedVoice.price || this.price,
      totalPrice: (this.selectedVoice.price || this.price) * this.actionData.text.length,
      voiceId: this.selectedVoice.id,
      voiceName: this.selectedVoice.name,
    }

    // Navigate to checkout with data
    // Using state to pass data to the checkout component
    this.router.navigate(["/checkout"], {
      state: {
        checkoutData: this.checkoutData,
        text: this.actionData.text,
        voiceSettings: {
          emotion: this.selectedEmotion,
          speed: this.vitess,
          sampleRate: this.rate,
          temperature: this.temperature,
        },
      },
    })
  }

  saveAudioToProject(audioBlob: Blob) {
    if (!this.selectedProject || !this.selectedVoice) {
      this.isGenerating = false
      return
    }

    // Create a FormData object to send the audio file
    const formData = new FormData()
    formData.append("text", this.actionData.text)
    formData.append("statutAction", "EN_ATTENTE")
    formData.append("voiceUuid", this.selectedVoice.id)
    formData.append("utilisateurUuid", this.userId || this.speakerId)
    formData.append("language", this.selectedVoice.language)
    formData.append("projectUuid", this.selectedProject.uuid)
    formData.append("audioGenerated", audioBlob, "audio.mp3")

    this.actionService.createAction(formData).subscribe(
      (response) => {
        console.log("Audio saved to project:", response)
        this.isGenerating = false
        this.generationSuccess = true
      },
      (error) => {
        console.error("Error saving audio to project:", error)
        this.isGenerating = false
        this.generationError = "Failed to save audio to project. Please try again."
      },
    )
  }

  fetchVoices() {
    this.elevenLabsService.listVoicesFiltter().subscribe(
      (voices: Voice[]) => {
        this.voices = voices
        this.filteredVoices = this.voices
        console.log("Voices retrieved:", this.voices)
      },
      (error) => {
        console.error("Error retrieving voices:", error)
      },
    )
  }

  filters = {
    search: "",
    gender: "",
    ageZone: "",
    type: "",
    language: "",
  }

  applyFilters(): void {
    this.filteredVoices = this.voices.filter(
      (voice) =>
        (this.filters.search === "" || voice.name.toLowerCase().includes(this.filters.search.toLowerCase())) &&
        (this.filters.gender === "" || voice.gender === this.filters.gender) &&
        (this.filters.ageZone === "" || voice.ageZone === this.filters.ageZone) &&
        (this.filters.type === "" || voice.type === this.filters.type) &&
        (this.filters.language === "" || voice.language === this.filters.language),
    )
  }

  resetFilters(): void {
    this.filters = { search: "", gender: "", ageZone: "", type: "", language: "" }
    this.filteredVoices = [...this.voices]
  }

  selectVoice(voice: Voice): void {
    this.selectedVoice = voice
    this.price = voice.price || this.price
  }

  closeModal() {
    this.showVoiceSelection = false
    this.showVoice = true
  }

  toggleVoiceSelection() {
    this.showVoiceSelection = !this.showVoiceSelection
  }

  playOriginalVoice(voice: Voice): void {
    if (this.audio && !this.audio.paused && this.audio.src === voice.originalVoiceUrl) {
      this.stopVoice() // Stop if the same audio is playing
    } else {
      this.stopVoice() // Stop any previous audio
      this.audio = new Audio(voice.originalVoiceUrl)
      this.audio.play().catch((error) => console.error("Error playing original voice:", error))
    }
  }

  playClonedVoice(voice: Voice): void {
    if (this.audio && !this.audio.paused && this.audio.src === voice.clonedVoiceUrl) {
      this.stopVoice() // Stop if the same audio is playing
    } else {
      this.stopVoice() // Stop any previous audio
      this.audio = new Audio(voice.clonedVoiceUrl)
      this.audio.play().catch((error) => console.error("Error playing cloned voice:", error))
    }
  }

  stopVoice(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0 // Reset playback position
      this.audio = new Audio() // Clear the audio instance
    }
  }

  // Getter for paginated voices
  get paginatedVoices() {
    const startIndex = (this.currentPage - 1) * this.voicesPerPage
    return this.filteredVoices.slice(startIndex, startIndex + this.voicesPerPage)
  }

  // Methods for changing page
  nextPage() {
    if (this.currentPage < Math.ceil(this.filteredVoices.length / this.voicesPerPage)) {
      this.currentPage++
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--
    }
  }
}
