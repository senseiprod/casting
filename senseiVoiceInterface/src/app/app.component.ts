import { Component } from '@angular/core';
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    // Translation service is initialized automatically through dependency injection
  }
}
