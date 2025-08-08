import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // This makes the service available app-wide automatically
})
export class AudioMuteService {
  // We use a Map to store the original state (muted or not) of each media element
  private originalStates = new Map<HTMLMediaElement, { muted: boolean }>();

  constructor() { }

  /**
   * Finds all <audio> and <video> elements on the page,
   * saves their current muted state, and then mutes them.
   */
  public muteAll(): void {
    const mediaElements = document.querySelectorAll('audio, video') as NodeListOf<HTMLMediaElement>;

    mediaElements.forEach(element => {
      // Only save the state the first time we mute, to avoid overwriting it
      if (!this.originalStates.has(element)) {
        this.originalStates.set(element, { muted: element.muted });
      }
      // Mute the element
      element.muted = true;
    });
  }

  /**
   * Restores all media elements to their original saved state.
   */
  public unmuteAll(): void {
    this.originalStates.forEach((state, element) => {
      // If the element still exists in the DOM, restore its state
      if (document.body.contains(element)) {
        element.muted = state.muted;
      }
    });

    // Clear the map for the next time
    this.originalStates.clear();
  }
}