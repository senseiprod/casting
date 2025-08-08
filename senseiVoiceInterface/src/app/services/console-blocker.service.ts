import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsoleBlockerService {
  private originalConsole: any = {};
  private isBlocked = false;

  /**
   * Disables console logging by replacing the methods with empty functions.
   * This should be called as early as possible in the application lifecycle.
   */
  block(): void {
    if (this.isBlocked) {
      return;
    }

    // A list of console methods to override
    const methodsToBlock = ['log', 'info', 'warn', 'error', 'debug', 'table', 'trace'];

    methodsToBlock.forEach(method => {
      // Save the original method if it exists
      if ((window.console as any)[method]) {
        this.originalConsole[method] = (window.console as any)[method];
        // Replace it with an empty function
        (window.console as any)[method] = () => {};
      }
    });

    this.isBlocked = true;
  }

  /**
   * Restores the original console methods.
   * This should only be called for authorized users.
   */
  unblock(): void {
    if (!this.isBlocked) {
      return;
    }

    Object.keys(this.originalConsole).forEach(method => {
      (window.console as any)[method] = this.originalConsole[method];
    });

    this.isBlocked = false;
    console.log('%cConsole access granted for developer.', 'color: #4caf50; font-weight: bold;');
  }
}