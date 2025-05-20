import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SpeakerResponse, SpeakerService} from "../../../services/speaker-service.service";
import {UtilisateurService} from "../../../services/utilisateur-service.service";
import {AudioService} from "../../../services/oudio.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit,AfterViewInit{
  speakers: SpeakerResponse[] = [];
  searchQuery: string = '';
  photoUrls: { [key: string]: string } = {};
  currentAudio: HTMLAudioElement | null = null;
  audioList: string[] = [];
  audio: string = '';
  @ViewChild("svgContainer") svgContainer!: ElementRef
  animationState = "start"
  // Stocker les URLs des photos

  constructor(
    private speakerService: SpeakerService,
    private audioService: AudioService,
    private utilisateurService: UtilisateurService
  ) {}

  ngOnInit(): void {
    this.loadSpeakers();
    this.toggleAnimationState();
  }

  loadSpeakers() {
    this.speakerService.getAllSpeakers().subscribe((data) => {
      // @ts-ignore
      this.speakers.push(data.at(4))
      // @ts-ignore
      this.speakers.push(data.at(1))
      // @ts-ignore
      this.speakers.push(data.at(2))
      this.speakers.push(data.at(3))
      this.speakers.forEach(speaker => this.loadPhoto(speaker.uuid));
    });
  }

  loadPhoto(userId: string) {
    this.utilisateurService.getPhoto(userId).subscribe(response => {
      const reader = new FileReader();
      reader.readAsDataURL(response);
      reader.onload = () => {
        this.photoUrls[userId] = reader.result as string;
      };
    });
  }

  searchSpeakers() {
    if (this.searchQuery.trim()) {
      this.speakerService.searchSpeakers(this.searchQuery).subscribe((data) => {
        this.speakers = data;
        this.speakers.forEach(speaker => this.loadPhoto(speaker.uuid));
      });
    } else {
      this.loadSpeakers();
    }
  }

  getPhoto(userId: string): string {
    return this.photoUrls[userId] || 'assets/img/team/team-d-1-1.jpg';
  }
  ngAfterViewInit(): void {
    // Initialize the SVG
    this.initSvg()
  }

  toggleAnimationState(): void {
    // Toggle between animation states to create continuous animation
    this.animationState = this.animationState === "start" ? "end" : "start"

    // Continue the animation loop
    setTimeout(() => {
      this.toggleAnimationState()
    }, 15000) // Match the animation duration
  }
  loadAudios(speakerId: string | null) : string[] {
    let audioss : string[] =[];
    this.audioService.getAllAudiosBySpeaker(speakerId).subscribe(
      (audios) => {
        audioss = audios;
      },
      (error) => {
        console.error('Erreur lors du chargement des audios', error);
      }
    );
    return audioss;
  }
  initSvg(): void {
    // Get all paths in the SVG
    const paths = this.svgContainer.nativeElement.querySelectorAll("path")

    // Add staggered animation delay to each path
    paths.forEach((path: SVGPathElement, index: number) => {
      path.style.animationDelay = `${index * 0.1}s`
    })
  }
  toggleAudio(audioId: string): void {
    const audio = document.getElementById(audioId) as HTMLAudioElement;

    if (!audio) return;
    if (this.currentAudio && this.currentAudio !== audio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    if (audio.paused) {
      audio.play();
      this.currentAudio = audio;
    } else {
      audio.pause();
      this.currentAudio = null;
    }
  }
}
