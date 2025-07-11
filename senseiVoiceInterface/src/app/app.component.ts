import { Component } from '@angular/core';
import { TranslationService } from './services/translation.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    constructor(private translationService: TranslationService,
    private router: Router) {}

  ngOnInit(): void {
    // Translation service is initialized automatically through dependency injection
     this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
