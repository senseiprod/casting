import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionService, ActionResponse } from '../../../services/action.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Action data
  actionData: ActionResponse | null = null;
  actionUuid: string | null = null;
  
  // Component states
  isLoading = true;
  hasError = false;
  errorMessage = '';
  
  // Audio player states
  audioUrl: SafeUrl | null = null;
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  volume = 1;
  playbackRate = 1;
  
  // Audio element reference
  private audioElement: HTMLAudioElement | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionService: ActionService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.actionUuid = params['uuid'];
      if (this.actionUuid) {
        this.loadActionData();
      } else {
        this.handleError('No action UUID provided');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
  }

  private loadActionData(): void {
    if (!this.actionUuid) return;
    
    this.isLoading = true;
    this.hasError = false;
    
    this.actionService.getActionByUuid(this.actionUuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ActionResponse) => {
          this.actionData = response;
          this.isLoading = false;
          this.setupAudioPlayer();
        },
        error: (error) => {
          console.error('Error loading action data:', error);
          this.handleError('Failed to load action data. Please try again.');
        }
      });
  }

  private setupAudioPlayer(): void {
    if (this.actionData?.audioGenerated) {
      // Convert base64 or URL to safe URL
      if (this.actionData.audioGenerated.startsWith('data:') || this.actionData.audioGenerated.startsWith('http')) {
        this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(this.actionData.audioGenerated);
      } else {
        // Assume it's a base64 string
        const audioDataUrl = `data:audio/mpeg;base64,${this.actionData.audioGenerated}`;
        this.audioUrl = this.sanitizer.bypassSecurityTrustUrl(audioDataUrl);
      }
    }
  }

  private handleError(message: string): void {
    this.isLoading = false;
    this.hasError = true;
    this.errorMessage = message;
  }

  // Audio player controls
  onAudioLoaded(event: Event): void {
    const audio = event.target as HTMLAudioElement;
    this.audioElement = audio;
    this.duration = audio.duration;
    
    // Set up audio event listeners
    audio.addEventListener('timeupdate', () => {
      this.currentTime = audio.currentTime;
    });
    
    audio.addEventListener('ended', () => {
      this.isPlaying = false;
    });
  }

  togglePlayPause(): void {
    if (!this.audioElement) return;
    
    if (this.isPlaying) {
      this.audioElement.pause();
    } else {
      this.audioElement.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  seekTo(event: Event): void {
    if (!this.audioElement) return;
    
    const input = event.target as HTMLInputElement;
    const seekTime = (parseFloat(input.value) / 100) * this.duration;
    this.audioElement.currentTime = seekTime;
  }

  changeVolume(event: Event): void {
    if (!this.audioElement) return;
    
    const input = event.target as HTMLInputElement;
    this.volume = parseFloat(input.value) / 100;
    this.audioElement.volume = this.volume;
  }

  changePlaybackRate(event: any): void {
    const rate = parseFloat(event.target.value);
    if (!this.audioElement) return;
    
    this.playbackRate = rate;
    this.audioElement.playbackRate = rate;
  }

  downloadAudio(): void {
    if (!this.actionData?.audioGenerated) return;
    
    const link = document.createElement('a');
    link.href = this.actionData.audioGenerated;
    link.download = `audio-${this.actionData.code}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  shareAudio(): void {
    if (navigator.share && this.actionData) {
      navigator.share({
        title: `Generated Audio - ${this.actionData.code}`,
        text: this.actionData.text.substring(0, 100) + '...',
        url: window.location.href
      }).catch(err => {
        console.log('Error sharing:', err);
        this.copyToClipboard();
      });
    } else {
      this.copyToClipboard();
    }
  }

  private copyToClipboard(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      // You could show a toast notification here
      console.log('Link copied to clipboard');
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getProgressPercentage(): number {
    return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
  }

  retryLoading(): void {
    if (this.actionUuid) {
      this.loadActionData();
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  createNewGeneration(): void {
    this.router.navigate(['/generation']);
  }
}