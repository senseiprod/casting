import { Component } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'speakerDashboard';
  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    // Translation service is initialized automatically through dependency injection
  }
}
