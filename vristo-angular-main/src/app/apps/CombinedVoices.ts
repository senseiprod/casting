import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { HttpClient } from "@angular/common/http"
import { ToastrService } from "ngx-toastr"
import { environment } from 'src/environments/environment';

interface CombinedVoice {
  voice_id: string
  name: string
  preview_url: string
  language: string
  type_voice: string // 'elevenlabs', 'elevenlabs-standard', or 'playht'
  accent?: string
  gender?: string
  age?: string
  use_case?: string
  description?: string
  category?: string
  isPlaying?: boolean
  isLoading?: boolean
}

@Component({
  selector: "app-combined-voices",
  templateUrl: "CombinedVoices.html",
})
export class CombinedVoicesComponent implements OnInit, OnDestroy {
  // Output format options for different voice types
  elevenLabsOutputFormats = [
    { value: "mp3_44100_128", label: "MP3 (44.1kHz, 128kbps)" },
    { value: "mp3_44100_192", label: "MP3 (44.1kHz, 192kbps)" },
    { value: "pcm_16000", label: "WAV (16kHz)" },
    { value: "pcm_22050", label: "WAV (22.05kHz)" },
    { value: "pcm_24000", label: "WAV (24kHz)" },
  ]

  private baseUrl = environment.apiUrl;

  playHtOutputFormats = [
    { value: "mp3", label: "MP3" },
    { value: "mulaw", label: "μ-law" },
    { value: "wav", label: "WAV" },
    { value: "ogg", label: "OGG" },
    { value: "flac", label: "FLAC" },
  ]
expandedVoiceId: any
showFiltersPanel = false;
activeFiltersCount = 0;

  // Get current output formats based on selected voice type
  get outputFormats() {
    return this.selectedVoice?.type_voice === "playht" ? this.playHtOutputFormats : this.elevenLabsOutputFormats
  }

  languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "ar", name: "Arabic" },
    { code: "it", name: "Italian" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
  ]

  // Add a mapping function to convert language codes to PlayHT-compatible language names
  // Add this after the languages array definition
  playHtLanguageMap: Record<string, string> = {
    en: "english",
    fr: "french",
    ar: "arabic",
    it: "italian",
    es: "spanish",
    de: "german",
    pt: "portuguese",
    ru: "russian",
    ja: "japanese",
    zh: "mandarin",
    nl: "dutch",
    pl: "polish",
    tr: "turkish",
    cs: "czech",
    da: "danish",
    el: "greek",
    he: "hebrew",
    hi: "hindi",
    hu: "hungarian",
    id: "indonesian",
    ko: "korean",
    ms: "malay",
    sv: "swedish",
    th: "thai",
    uk: "ukrainian",
    ur: "urdu",
    bg: "bulgarian",
    hr: "croatian",
    sr: "serbian",
    tl: "tagalog",
    xh: "xhosa",
    bn: "bengali",
  }

  useCases = [
    "narrative_story",
    "conversational",
    "informative_educational",
    "social_media",
    "entertainment_tv",
    "advertisement",
    "characters_animation",
    "news",
    "characters",
    "meditation",
    "audiobook",
    "ASMR",
    "animation",
  ]

  selectedUseCase = "all"
  showUseCaseSelector = false
  useCaseSearchQuery = ""
  selectedLanguage = "all"
  selectedGender = "all"
  selectedAge = "all"
  searchQuery = ""

  currentPage = 1
  pageSize = 10
  totalItems = 0

  allVoices: CombinedVoice[] = []
  filteredVoices: CombinedVoice[] = []
  paginatedVoices: CombinedVoice[] = []

  loading = false
  selectedVoice: CombinedVoice | null = null
  synthesizeForm: FormGroup
  showSynthesizeForm = false

  // Audio playback control
  currentAudio: HTMLAudioElement | null = null
  currentPlayingVoiceId: string | null = null
  private clickOutsideHandler: ((event: MouseEvent) => void) | null = null

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
  ) {
    this.synthesizeForm = this.fb.group({
      text: ["", Validators.required],
      output_format: ["mp3_44100_128"],
      stability: [0.5],
      similarity_boost: [0.75],
      style_guidance: [0.5],
      use_speaker_boost: [true],
      // PlayHT specific parameters
      quality: ["medium"],
      speed: [1.0],
      sample_rate: [24000],
      seed: [null],
      temperature: [1.0],
      voice_engine: [""],
      emotion: [""],
      voice_guidance: [null],
      text_guidance: [null],
    })
  }

  ngOnInit(): void {
    this.fetchCombinedVoices()
  }

  ngOnDestroy(): void {
    this.stopAudio()
    if (this.clickOutsideHandler) {
      document.removeEventListener("click", this.clickOutsideHandler)
      this.clickOutsideHandler = null
    }
  }

  toggleFiltersPanel(): void {
    this.showFiltersPanel = !this.showFiltersPanel;
  }

  toggleVoiceExpand(voiceId: string): void {
    if (this.expandedVoiceId === voiceId) {
      this.expandedVoiceId = null;
    } else {
      this.expandedVoiceId = voiceId;
    }
  }

  fetchCombinedVoices(): void {
    this.loading = true
    this.http.get<any>(`${this.baseUrl}/api/combined-voices/combined`).subscribe(
      (response) => {
        if (response && response.voices) {
          this.allVoices = response.voices.map((voice: any) => ({
            ...voice,
            isPlaying: false,
            isLoading: false,
          }))
          this.totalItems = response.total_count || this.allVoices.length
          this.applyFilters()
        } else {
          this.allVoices = []
          this.filteredVoices = []
          this.paginatedVoices = []
          this.totalItems = 0
        }
        this.loading = false
      },
      (error) => {
        console.error("Error fetching combined voices:", error)
        this.toastr.error("Failed to fetch voices.")
        this.loading = false
        this.allVoices = []
        this.filteredVoices = []
        this.paginatedVoices = []
        this.totalItems = 0
      },
    )
  }



  updatePaginatedVoices(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize
    this.paginatedVoices = this.filteredVoices.slice(startIndex, startIndex + this.pageSize)
  }



  onLanguageChange(language: string): void {
    this.selectedLanguage = language
    this.applyFilters()
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return

    this.currentPage = page
    this.stopAudio()
    this.updatePaginatedVoices()
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize)
  }

  formatUseCase(useCase: string): string {
    if (useCase === "all") return "All Use Cases"

    return useCase
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  toggleUseCaseSelector(): void {
    this.showUseCaseSelector = !this.showUseCaseSelector

    if (this.clickOutsideHandler) {
      document.removeEventListener("click", this.clickOutsideHandler)
      this.clickOutsideHandler = null
    }

    if (this.showUseCaseSelector) {
      this.useCaseSearchQuery = ""

      this.clickOutsideHandler = (event: MouseEvent) => {
        const useCasePopover = document.querySelector(".use-case-popover")
        const useCaseButton = document.querySelector(".custom-input-group")

        if (
          useCasePopover &&
          !useCasePopover.contains(event.target as Node) &&
          useCaseButton &&
          !useCaseButton.contains(event.target as Node)
        ) {
          this.showUseCaseSelector = false
          document.removeEventListener("click", this.clickOutsideHandler!)
          this.clickOutsideHandler = null
        }
      }

      setTimeout(() => {
        document.addEventListener("click", this.clickOutsideHandler!)
      }, 100)
    }
  }

  selectUseCase(useCase: string, event: MouseEvent): void {
    this.selectedUseCase = useCase
    event.stopPropagation()
    this.showUseCaseSelector = false

    if (this.clickOutsideHandler) {
      document.removeEventListener("click", this.clickOutsideHandler)
      this.clickOutsideHandler = null
    }

    this.applyFilters()
  }

  get filteredUseCases(): string[] {
    if (!this.useCaseSearchQuery) {
      return this.useCases
    }

    const query = this.useCaseSearchQuery.toLowerCase()
    return this.useCases.filter((useCase) => this.formatUseCase(useCase).toLowerCase().includes(query))
  }

  togglePlayPreview(voice: CombinedVoice): void {
    if (!voice.preview_url) {
      this.toastr.error("No preview available for this voice")
      return
    }

    if (this.currentPlayingVoiceId === voice.voice_id && this.currentAudio) {
      if (this.currentAudio.paused) {
        this.currentAudio
          .play()
          .then(() => {
            voice.isPlaying = true
          })
          .catch((err) => {
            console.error("Error playing audio:", err)
            this.toastr.error("Failed to play audio preview")
            voice.isPlaying = false
          })
      } else {
        this.currentAudio.pause()
        voice.isPlaying = false
      }
    } else {
      this.stopAudio()

      voice.isLoading = true

      this.currentAudio = new Audio(voice.preview_url)
      this.currentPlayingVoiceId = voice.voice_id

      this.currentAudio.oncanplaythrough = () => {
        voice.isLoading = false
      }

      this.currentAudio.onplay = () => {
        voice.isPlaying = true
        voice.isLoading = false
      }

      this.currentAudio.onpause = () => {
        voice.isPlaying = false
      }

      this.currentAudio.onended = () => {
        voice.isPlaying = false
        this.currentAudio = null
        this.currentPlayingVoiceId = null
      }

      this.currentAudio.onerror = () => {
        voice.isPlaying = false
        voice.isLoading = false
        this.toastr.error("Failed to load audio preview")
        this.currentAudio = null
        this.currentPlayingVoiceId = null
      }

      this.currentAudio.load()
      this.currentAudio
        .play()
        .then(() => {
          // Play started successfully
        })
        .catch((err) => {
          console.error("Error playing audio:", err)
          voice.isLoading = false
          voice.isPlaying = false
          this.toastr.error("Failed to play audio preview")
        })
    }
  }

  private stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0

      if (this.currentPlayingVoiceId) {
        const playingVoice = this.findVoiceById(this.currentPlayingVoiceId)
        if (playingVoice) {
          playingVoice.isPlaying = false
          playingVoice.isLoading = false
        }
      }

      this.currentAudio = null
      this.currentPlayingVoiceId = null
    }
  }

  private findVoiceById(voiceId: string): CombinedVoice | undefined {
    return this.allVoices.find((v) => v.voice_id === voiceId)
  }

  onSynthesizeClick(voice: CombinedVoice): void {
    this.selectedVoice = voice
    this.showSynthesizeForm = true

    // Set default output format based on voice type
    const defaultOutputFormat = voice.type_voice === "playht" ? "mp3" : "mp3_44100_128"

    // Reset form with default values
    this.synthesizeForm.patchValue({
      text: "",
      output_format: defaultOutputFormat,
      stability: 0.5,
      similarity_boost: 0.75,
      style_guidance: 0.5,
      use_speaker_boost: true,
      quality: "medium",
      speed: 1.0,
      sample_rate: 24000,
      seed: null,
      temperature: 1.0,
      voice_engine: "",
      emotion: "",
      voice_guidance: null,
      text_guidance: null,
    })

    // Scroll to the form
    setTimeout(() => {
      const formElement = document.getElementById("synthesize-form-section")
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  synthesizeSpeech(): void {
    if (!this.selectedVoice) {
      this.toastr.error("Please select a voice first.")
      return
    }

    if (this.synthesizeForm.invalid) {
      this.toastr.error("Please fill out all required fields.")
      return
    }

    const formValues = this.synthesizeForm.value
    const text = formValues.text || ""

    // Determine which API to use based on voice type
    if (this.selectedVoice.type_voice === "playht") {
      this.synthesizeWithPlayHt(text)
    } else {
      // For both elevenlabs and elevenlabs-standard
      this.synthesizeWithElevenLabs(text)
    }
  }

  private synthesizeWithElevenLabs(text: string): void {
    const formValues = this.synthesizeForm.value

    const requestBody = {
      text: text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: formValues.stability ? Number.parseFloat(formValues.stability) : 0.5,
        similarity_boost: formValues.similarity_boost ? Number.parseFloat(formValues.similarity_boost) : 0.75,
        style: formValues.style_guidance ? Number.parseFloat(formValues.style_guidance) : 0.5,
        use_speaker_boost: formValues.use_speaker_boost !== undefined ? formValues.use_speaker_boost : true,
      },
    }

    const outputFormat = formValues.output_format || "mp3_44100_128"
    const enableLogging = true
    const optimizeStreamingLatency = 0

    const apiUrl = `${this.baseUrl}/api/elevenlabs/text-to-speech/${this.selectedVoice!.voice_id}?output_format=${outputFormat}&enable_logging=${enableLogging}&optimize_streaming_latency=${optimizeStreamingLatency}`

    this.http.post(apiUrl, requestBody, { responseType: "arraybuffer" }).subscribe(
      (response: ArrayBuffer) => {
        this.handleAudioResponse(response, this.getContentType(outputFormat))
      },
      (error) => {
        console.error("ElevenLabs Synthesis Error:", error)
        this.toastr.error("Failed to synthesize speech with ElevenLabs.")
      },
    )
  }

  // Replace the synthesizeWithPlayHt method with this updated version
  private synthesizeWithPlayHt(text: string): void {
    const formValues = this.synthesizeForm.value
    const voice = this.selectedVoice!.voice_id

    // Convert language code to PlayHT format
    let languageCode = this.selectedVoice!.language || "en"
    // Remove any region suffix (e.g., "en-US" -> "en")
    languageCode = languageCode.split("-")[0].toLowerCase()
    // Map to PlayHT language format
    const language = this.playHtLanguageMap[languageCode] || "english"

    const outputFormat = formValues.output_format || "mp3"

    // Basic URL with required parameters
    let apiUrl = `${this.baseUrl}/api/playht/synthesize?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}&language=${encodeURIComponent(language)}`

    // For advanced options, use the advanced endpoint
    if (formValues.quality || formValues.speed || formValues.voice_engine) {
      apiUrl = `${this.baseUrl}/api/playht/synthesize/advanced`

      // Create form data for advanced parameters
      const formData = new FormData()
      formData.append("text", text)
      formData.append("voice", voice)
      formData.append("language", language)

      // Add optional parameters if they exist
      if (formValues.quality) formData.append("quality", formValues.quality)
      if (outputFormat) formData.append("output_format", outputFormat)
      if (formValues.speed) formData.append("speed", formValues.speed.toString())
      if (formValues.sample_rate) formData.append("sample_rate", formValues.sample_rate.toString())
      if (formValues.seed) formData.append("seed", formValues.seed.toString())
      if (formValues.temperature) formData.append("temperature", formValues.temperature.toString())
      if (formValues.voice_engine) formData.append("voice_engine", formValues.voice_engine)
      if (formValues.emotion) formData.append("emotion", formValues.emotion)

      // Convert float values to integers for PlayHT API with proper scaling
      if (formValues.voice_guidance) {
        // Scale to a maximum of 10 (PlayHT limit)
        const voiceGuidanceInt = Math.round(formValues.voice_guidance * 10)
        formData.append("voice_guidance", voiceGuidanceInt.toString())
      }

      if (formValues.style_guidance) {
        // Scale to a maximum of 10 (PlayHT limit)
        const styleGuidanceInt = Math.round(formValues.style_guidance * 10)
        formData.append("style_guidance", styleGuidanceInt.toString())
      }

      if (formValues.text_guidance) {
        // Scale to a maximum of 10 (PlayHT limit)
        const textGuidanceInt = Math.round(formValues.text_guidance * 10)
        formData.append("text_guidance", textGuidanceInt.toString())
      }

      this.http.post(apiUrl, formData, { responseType: "arraybuffer" }).subscribe(
        (response: ArrayBuffer) => {
          this.handleAudioResponse(response, this.getContentTypeForPlayHt(outputFormat))
        },
        (error) => {
          console.error("PlayHT Synthesis Error:", error)
          this.toastr.error("Failed to synthesize speech with PlayHT: " + this.extractErrorMessage(error))
        },
      )
    } else {
      // Add output format to the URL
      apiUrl += `&output_format=${encodeURIComponent(outputFormat)}`

      // Use simple GET request for basic synthesis
      this.http.get(apiUrl, { responseType: "arraybuffer" }).subscribe(
        (response: ArrayBuffer) => {
          this.handleAudioResponse(response, this.getContentTypeForPlayHt(outputFormat))
        },
        (error) => {
          console.error("PlayHT Synthesis Error:", error)
          this.toastr.error("Failed to synthesize speech with PlayHT: " + this.extractErrorMessage(error))
        },
      )
    }
  }

  // Helper method to extract error message from HTTP error
  private extractErrorMessage(error: any): string {
    if (error && error.error) {
      try {
        // Try to convert ArrayBuffer to string
        const errorText = new TextDecoder().decode(error.error)
        const errorObj = JSON.parse(errorText)
        if (errorObj && errorObj.error_message) {
          return errorObj.error_message
        }
      } catch (e) {
        // If parsing fails, return generic message
        console.error("Error parsing error message:", e)
      }
    }
    return "Check console for details"
  }

  private handleAudioResponse(response: ArrayBuffer, contentType: string): void {
    const blob = new Blob([response], { type: contentType })

    const audioElement = document.createElement("audio")
    audioElement.src = URL.createObjectURL(blob)
    audioElement.controls = true
    audioElement.style.width = "100%"
    audioElement.classList.add("custom-audio-player")

    // Add download button
    const downloadButton = document.createElement("button")
    downloadButton.className = "btn btn-sm mt-2 rounded-pill download-btn"
    downloadButton.style.cssText =
      "background: linear-gradient(135deg, #192840, #ce091c); color: white; transition: all 0.3s ease;"
    downloadButton.innerHTML = '<i class="bi bi-download me-1"></i> Download Audio'
    downloadButton.onclick = () => this.downloadAudio(blob)

    const audioContainer = document.getElementById("audio-container")
    if (audioContainer) {
      audioContainer.innerHTML = ""
      audioContainer.appendChild(audioElement)
      audioContainer.appendChild(downloadButton)
    }

    this.toastr.success("Speech synthesized successfully!")
  }

  private downloadAudio(blob: Blob): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = url

    // Create a filename based on voice name and current date
    const voiceName = this.selectedVoice?.name?.replace(/\s+/g, "_") || "voice"
    const date = new Date().toISOString().split("T")[0]
    const format = blob.type.split("/")[1]
    a.download = `${voiceName}_${date}.${format}`

    document.body.appendChild(a)
    a.click()

    // Clean up
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    this.toastr.success("Audio downloaded successfully!")
  }

  private getContentType(outputFormat: string): string {
    if (outputFormat.startsWith("mp3")) {
      return "audio/mp3"
    } else if (outputFormat.startsWith("pcm")) {
      return "audio/wav"
    } else if (outputFormat.startsWith("ogg")) {
      return "audio/ogg"
    } else {
      return "audio/mp3" // Default
    }
  }

  private getContentTypeForPlayHt(outputFormat: string): string {
    switch (outputFormat) {
      case "mp3":
        return "audio/mp3"
      case "wav":
        return "audio/wav"
      case "ogg":
        return "audio/ogg"
      case "flac":
        return "audio/flac"
      case "mulaw":
        return "audio/basic"
      default:
        return "audio/mp3" // Default
    }
  }

   getPaginationRange() {
    const range = [];
    const delta = 2; // Number of pages to show before and after current page

    let start = Math.max(2, this.currentPage - delta);
    let end = Math.min(this.totalPages - 1, this.currentPage + delta);

    // Adjust if we're near the beginning
    if (this.currentPage - delta < 2) {
      end = Math.min(this.totalPages - 1, end + (2 - (this.currentPage - delta)));
    }

    // Adjust if we're near the end
    if (this.currentPage + delta > this.totalPages - 1) {
      start = Math.max(2, start - ((this.currentPage + delta) - (this.totalPages - 1)));
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }

  // Method to get visible page numbers for pagination
    getVisiblePageNumbers() {
    const visiblePages = [];
    const totalVisiblePages = 5; // Maximum number of page numbers to show

    if (this.totalPages <= totalVisiblePages) {
      // If we have fewer pages than the max visible, show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Always show first page
      visiblePages.push(1);

      // Calculate start and end of visible pages around current page
      let startPage = Math.max(2, this.currentPage - Math.floor((totalVisiblePages - 3) / 2));
      let endPage = Math.min(this.totalPages - 1, startPage + totalVisiblePages - 4);

      // Adjust if we're near the beginning
      if (startPage > 2) {
        visiblePages.push('...');
      }

      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i);
      }

      // Adjust if we're near the end
      if (endPage < this.totalPages - 1) {
        visiblePages.push('...');
      }

      // Always show last page
      visiblePages.push(this.totalPages);
    }

    return visiblePages;
  }

  // Add these properties to your component class
selectedVoiceType = 'all';

// Add this method to your component class
selectVoiceType(voiceType: string): void {
  this.selectedVoiceType = voiceType;
  this.applyFilters();
}

// Add this method to your component class
getVoiceTypeColor(voiceType: string): { bg: string, text: string } {
  switch(voiceType) {
    case 'elevenlabs':
      return { bg: 'rgba(206, 9, 28, 0.1)', text: '#ce091c' };
    case 'elevenlabs-standard':
      return { bg: 'rgba(25, 40, 64, 0.1)', text: '#192840' };
    case 'playht':
      return { bg: 'rgba(25, 40, 64, 0.15)', text: '#192840' };
    default:
      return { bg: 'rgba(25, 40, 64, 0.1)', text: '#192840' };
  }
}

applyFilters(): void {
    let result = [...this.allVoices];

    // Calculate active filters count
    this.activeFiltersCount = 0;

    // Voice type filter
    if (this.selectedVoiceType !== 'all') {
      result = result.filter((voice) => {
        return voice.type_voice === this.selectedVoiceType;
      });
      this.activeFiltersCount++;
    }

    // Existing filters
    if (this.selectedLanguage !== "all") {
      result = result.filter((voice) => {
        if (voice.language) {
          return voice.language.toLowerCase().includes(this.selectedLanguage.toLowerCase());
        }
        return false;
      });
      this.activeFiltersCount++;
    }

    if (this.selectedGender !== "all") {
      result = result.filter((voice) => {
        return voice.gender?.toLowerCase() === this.selectedGender.toLowerCase();
      });
      this.activeFiltersCount++;
    }

    if (this.selectedAge !== "all") {
      result = result.filter((voice) => {
        return voice.age?.toLowerCase() === this.selectedAge.toLowerCase();
      });
      this.activeFiltersCount++;
    }

    if (this.selectedUseCase !== "all") {
      result = result.filter((voice) => {
        return voice.use_case?.toLowerCase() === this.selectedUseCase.toLowerCase();
      });
      this.activeFiltersCount++;
    }

    if (this.searchQuery && this.searchQuery.trim() !== "") {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter((voice) => {
        return (
          (voice.name && voice.name.toLowerCase().includes(query)) ||
          (voice.accent && voice.accent.toLowerCase().includes(query)) ||
          (voice.description && voice.description.toLowerCase().includes(query)) ||
          (voice.use_case && voice.use_case.toLowerCase().includes(query))
        );
      });
      // Don't count search as a filter for the badge
    }

    this.filteredVoices = result;
    this.totalItems = result.length;
    this.currentPage = 1;
    this.updatePaginatedVoices();
  }

  // Update your resetFilters method to reset expandedVoiceId
  resetFilters(): void {
    this.selectedVoiceType = 'all';
    this.selectedLanguage = "all";
    this.selectedGender = "all";
    this.selectedAge = "all";
    this.selectedUseCase = "all";
    this.searchQuery = "";
    this.expandedVoiceId = null;
    this.activeFiltersCount = 0;
    this.applyFilters();
    this.toastr.info("All filters have been reset");
  }


}
