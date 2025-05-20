import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../app/service/request.service';
import { HttpClient } from '@angular/common/http';
import { toggleAnimation } from 'src/app/shared/animations';

interface DemandeResponse {
  utilisateurUuid: string;
  titre: string;
  description: string;
  type: string;
  uuid: string;

  // Add other expected properties
}

@Component({
  selector: 'app-record-request',
  templateUrl: 'recordRequest.html',
  animations: [toggleAnimation],
})
export class RecordRequestComponent implements OnInit {
  demandes: DemandeResponse[] = [];
  clients: { [key: string]: string } = {};

  constructor(private requestService: RequestService, private http: HttpClient) {}

  ngOnInit(): void {
    this.getDemandes();
    console.log('Demandes:', this.demandes);
  }

  getDemandes(): void {
    this.requestService.getDemandes().subscribe(
      (data: DemandeResponse[]) => {
        this.demandes = data.filter(demande => demande.type === 'RECORDE'); // Filter demandes
        this.fetchClients();
      },
      (error) => {
        console.error('Error fetching demandes', error);
      }
    );
  }


  fetchClients(): void {
    this.demandes.forEach((demande) => {

      this.requestService.getClientByUuid(demande.utilisateurUuid).subscribe(
        (client: { nom: string }) => {
          this.clients[demande.utilisateurUuid] = client.nom;
        },
        (error) => {
          console.error(`Error fetching client for UUID ${demande.utilisateurUuid}`, error);
        }
      );
    });
  }

  updateDemande(uuid: string, status: string): void {
    this.http.put(`http://localhost:8080/api/demandes/update/${uuid}?status=${status}`, null)
      .subscribe(
        (response) => {
          console.log('Demande updated successfully:', response);
          this.loadDemandes();
        },
        (error) => {
          console.error('Error updating demande:', error);
        }
      );
  }

  loadDemandes(): void {
    this.http.get<DemandeResponse[]>(`http://localhost:8080/api/demandes/en-attente`)
      .subscribe(
        (response) => {
          this.demandes = response.filter(demande => demande.type === 'COMPTE');

          console.log('Demandes loaded:', this.demandes);
        },
        (error) => {
          console.error('Error loading demandes:', error);
        }
      );
  }
}
