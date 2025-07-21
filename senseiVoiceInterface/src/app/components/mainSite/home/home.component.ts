import { Component,  OnInit,  OnDestroy } from "@angular/core"
import  { SpeakerResponse, SpeakerService } from "../../../services/speaker-service.service"
import  { UtilisateurService } from "../../../services/utilisateur-service.service"

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit, OnDestroy {
  speakers: SpeakerResponse[] = []
  searchQuery = ""
  photoUrls: { [key: string]: string } = {}
  currentAudio: HTMLAudioElement | null = null
  currentPlayingId: string | null = null

  constructor(
    private speakerService: SpeakerService,
    private utilisateurService: UtilisateurService,
  ) {}

  ngOnInit(): void {
    this.loadSpeakers()
  }

  ngOnDestroy(): void {
    // Clean up any playing audio when component is destroyed
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }
  }

  loadSpeakers() {
    this.speakerService.getAllSpeakers().subscribe((data) => {
      // Load specific speakers by index
      if (data.length > 4) this.speakers.push(data[4])
      if (data.length > 1) this.speakers.push(data[1])
      if (data.length > 2) this.speakers.push(data[2])
      if (data.length > 3) this.speakers.push(data[3])

      this.speakers.forEach((speaker) => this.loadPhoto(speaker.uuid))
    })
  }

  loadPhoto(userId: string) {
    this.utilisateurService.getPhoto(userId).subscribe((response) => {
      const reader = new FileReader()
      reader.readAsDataURL(response)
      reader.onload = () => {
        this.photoUrls[userId] = reader.result as string
      }
    })
  }

  toggleAudio(audioId: string): void {
    const audio = document.getElementById(audioId) as HTMLAudioElement

    if (!audio) {
      console.error("Audio element not found:", audioId)
      return
    }

    // If this audio is currently playing, pause it
    if (this.currentPlayingId === audioId && this.currentAudio === audio) {
      this.pauseCurrentAudio()
      return
    }

    // Pause any currently playing audio
    this.pauseCurrentAudio()

    // Play the selected audio
    this.playAudio(audio, audioId)
  }

  private playAudio(audioElement: HTMLAudioElement, audioId: string): void {
    audioElement
      .play()
      .then(() => {
        this.currentAudio = audioElement
        this.currentPlayingId = audioId
        // Add playing class to the button for additional styling
        const playButton = audioElement.parentElement?.querySelector(".play-button")
        if (playButton) {
          playButton.classList.add("playing")
        }
      })
      .catch((error) => {
        console.error("Error playing audio:", error)
        this.currentPlayingId = null
      })
  }

  private pauseCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0

      // Remove playing class from the button
      const playButton = this.currentAudio.parentElement?.querySelector(".play-button")
      if (playButton) {
        playButton.classList.remove("playing")
      }

      this.currentAudio = null
      this.currentPlayingId = null
    }
  }

  onAudioEnded(audioId: string): void {
    if (this.currentPlayingId === audioId) {
      // Remove playing class from the button
      const audio = document.getElementById(audioId) as HTMLAudioElement
      const playButton = audio?.parentElement?.querySelector(".play-button")
      if (playButton) {
        playButton.classList.remove("playing")
      }

      this.currentPlayingId = null
      this.currentAudio = null
    }
  }

  // Helper method to check if audio is playing
  isAudioPlaying(audioId: string): boolean {
    return this.currentPlayingId === audioId
  }

  getPhoto(userId: string): string {
    return this.photoUrls[userId] || "assets/img/team/team-d-1-1.jpg"
  }

  searchSpeakers() {
    if (this.searchQuery.trim()) {
      this.speakerService.searchSpeakers(this.searchQuery).subscribe((data) => {
        this.speakers = data
        this.speakers.forEach((speaker) => this.loadPhoto(speaker.uuid))
      })
    } else {
      this.loadSpeakers()
    }
  }
}
