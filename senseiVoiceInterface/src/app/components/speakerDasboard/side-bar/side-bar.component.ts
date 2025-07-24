import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { UtilisateurService } from "../../../services/utilisateur-service.service";
import { ClientResponse, ClientService } from "../../../services/client-service.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {
  userId: string | null = null;
  photoUrl: SafeUrl | null = null;
  sidebarOpen = false;
  speaker: ClientResponse = new ClientResponse();

  constructor(
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
    private clientService: ClientService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    // Get the user's UUID from the route snapshot, exactly like in MenuComponent.
    // This works because this component is loaded as a child of the route with the parameter.
    this.userId = this.route.snapshot.paramMap.get('uuid');

    if (this.userId) {
      this.loadUserData();
      this.getPhoto();
    } else {
      console.error('SidebarComponent could not find "uuid" in the route snapshot. Ensure it is a child of a route like "client/:uuid".');
    }
  }

  loadUserData(): void {
    if (!this.userId) {
      return;
    }

    this.clientService.getClientByUuid(this.userId).subscribe({
      next: (data) => {
        this.speaker = data;
      },
      error: (error) => {
        console.error("Erreur lors du chargement des données de l'utilisateur pour la sidebar", error);
      },
    });
  }

  getPhoto(): void {
    if (!this.userId) {
      return;
    }

    this.utilisateurService.getPhoto(this.userId).subscribe({
      next: (photoBlob: Blob) => {
        const objectURL = URL.createObjectURL(photoBlob);
        this.photoUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: (error) => {
        // It's common for a 404 error if the user has no photo.
        // You can choose to ignore this specific error if it's not critical.
        if (error.status !== 404) {
           console.error("Erreur lors du chargement de la photo pour la sidebar", error);
        }
      },
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout(): void {
    localStorage.clear();
    // Navigate to login page if you have a router instance
    // Example: this.router.navigate(['/login']);
    // For now, it will just clear storage.
  }
}