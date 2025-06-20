import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {UtilisateurService} from "../../../services/utilisateur-service.service";
import {SpeakerService} from "../../../services/speaker-service.service";
import {DemandeService} from "../../../services/demande-service.service";
import {FormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {
  userId: string | null = '';
  photoUrl: string | ArrayBuffer | null = null;
  sidebarOpen = false
  constructor(
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
  ) {}
  ngOnInit() {
    this.route.parent?.paramMap.subscribe(params => {
      this.userId = params.get('uuid') || '';
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
  }

  closeSidebar() {
    this.sidebarOpen = false
  }
  getPhoto(): void {
    this.utilisateurService.getPhoto(this.userId).subscribe(response => {
      const reader = new FileReader();
      reader.readAsDataURL(response); // response doit être un Blob (type: 'blob')
      reader.onload = () => {
        this.photoUrl = reader.result as string;
      };
    }, error => {
      console.error("Erreur lors du chargement de la photo", error);
    });
  }
  logout(): void{
    localStorage.clear();
  }
}
