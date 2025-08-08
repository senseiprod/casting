import { Component, HostListener, Input } from '@angular/core';
import { AudioMuteService } from '../services/audio-mute.service';

@Component({
  selector: 'app-screen-shield',
  templateUrl: './screen-shield.component.html',
  styleUrls: ['./screen-shield.component.css']
})
export class ScreenShieldComponent {
  isShieldActive: boolean = false;

  constructor(private audioMuteService: AudioMuteService) {}

  ngOnInit(): void {
    // Bind the event listener with the correct 'this' context
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  ngOnDestroy(): void {
    // Clean up the event listener when the component is destroyed
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  // --- Event Handlers ---

  // Handles switching to another application (like OBS, Streamlabs)
  @HostListener('window:blur')
  onWindowBlur() {
    this.activateShield();
  }

  // Handles returning to this application
  @HostListener('window:focus')
  onWindowFocus() {
    this.deactivateShield();
  }

  // Handles switching to another browser tab
  // We need to bind this manually to preserve the 'this' context
  handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.activateShield();
    } else {
      this.deactivateShield();
    }
  }

  // --- Shield Logic ---

  private activateShield(): void {
    if (!this.isShieldActive) {
      this.isShieldActive = true;
      this.audioMuteService.muteAll();
    }
  }

  private deactivateShield(): void {
    // Only deactivate if the window is focused AND the tab is visible
    if (document.hasFocus() && !document.hidden) {
      if (this.isShieldActive) {
        this.isShieldActive = false;
        this.audioMuteService.unmuteAll();
      }
    }
  }
}