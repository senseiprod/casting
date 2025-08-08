import { Directive, ElementRef, OnDestroy, OnInit, Renderer2, Input } from '@angular/core';
// Assume you have an AuthService that can provide user info.
// If not, you can remove this and hardcode the text.
import { AuthService } from './services/auth.service'; 

@Directive({
  selector: '[appWatermark]'
})
export class WatermarkDirective implements OnInit, OnDestroy {
  private watermarkEl: HTMLDivElement | null = null;
  private resizeListener: (() => void) | null = null;
  private intervalId: number | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private authService: AuthService // Inject your auth service
  ) {}

  ngOnInit(): void {
    // Wait a moment for the view to be ready
    setTimeout(() => this.createWatermark(), 50);
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      this.resizeListener();
    }
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
    if (this.watermarkEl) {
      this.renderer.removeChild(this.el.nativeElement, this.watermarkEl);
    }
  }

  private createWatermark(): void {
    if (this.watermarkEl) {
      // If it already exists, just update it
      this.updateWatermarkBackground();
      return;
    }

    this.watermarkEl = this.renderer.createElement('div');
    this.renderer.setAttribute(this.watermarkEl, 'aria-hidden', 'true');
    
    // Style it to be a non-interactive overlay
    this.renderer.setStyle(this.watermarkEl, 'position', 'absolute');
    this.renderer.setStyle(this.watermarkEl, 'inset', '0');
    this.renderer.setStyle(this.watermarkEl, 'pointer-events', 'none');
    this.renderer.setStyle(this.watermarkEl, 'z-index', '9998'); // Below the shield, but above content

    this.updateWatermarkBackground();

    this.renderer.appendChild(this.el.nativeElement, this.watermarkEl);

    // Refresh on resize
    this.resizeListener = this.renderer.listen('window', 'resize', () => {
      this.updateWatermarkBackground();
    });

    // Refresh every 2 minutes to update the timestamp
    this.intervalId = window.setInterval(() => {
      this.updateWatermarkBackground();
    }, 120000);
  }

  private getWatermarkText(): string {
    // IMPORTANT: Replace with your actual user data logic
    const user = (this.authService as any)?.currentUser || { email: 'user@example.com' };
    const userId = user.email || 'confidential';
    const timestamp = new Date().toLocaleString();
    return `${userId} - ${timestamp}`;
  }

  private updateWatermarkBackground(): void {
    if (!this.watermarkEl) return;

    const text = this.getWatermarkText();
    const dataUrl = this.createWatermarkTile(text);

    this.renderer.setStyle(this.watermarkEl, 'background-image', `url("${dataUrl}")`);
    this.renderer.setStyle(this.watermarkEl, 'background-repeat', 'repeat');
  }

  private createWatermarkTile(text: string): string {
    const canvas = this.renderer.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const size = 400; // Tile size in pixels

    canvas.width = size;
    canvas.height = size;

    ctx.globalAlpha = 0.08; // Very subtle opacity
    ctx.font = '14px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    
    // Rotate and draw the text
    ctx.translate(size / 2, size / 2);
    ctx.rotate(-Math.PI / 4); // -45 degrees
    ctx.fillText(text, 0, 0);

    return canvas.toDataURL('image/png');
  }
}