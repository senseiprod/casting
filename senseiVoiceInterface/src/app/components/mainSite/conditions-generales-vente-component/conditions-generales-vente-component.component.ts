import { Component } from '@angular/core';

@Component({
  selector: 'app-conditions-generales-vente-component',
  templateUrl: './conditions-generales-vente-component.component.html',
  styleUrls: ['./conditions-generales-vente-component.component.css']
})
export class ConditionsGeneralesVenteComponentComponent {
  isSommaireOpen = false;

  constructor() {}

  toggleSommaire(): void {
    this.isSommaireOpen = !this.isSommaireOpen;
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    // Close the sommaire after clicking a link
    this.isSommaireOpen = false;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
}
