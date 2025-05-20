import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DemandeService, DemandeRequest, DemandeResponse } from '../../services/demande.service';
import { AuthService } from '../../services/auth.service';
import { catchError, finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
  showFilters = true;
  loading = false;
  error: string | null = null;
  isDarkMode = false;

  // Form for creating new requests
  newRequestForm: FormGroup;
  showNewRequestForm = false;
  submitting = false;

  // Data
  allDemandes: DemandeResponse[] = [];
  pendingDemandes: DemandeResponse[] = [];
  approvedDemandes: DemandeResponse[] = [];
  rejectedDemandes: DemandeResponse[] = [];

  // Current user
  currentUserUuid = '';

  // Stats
  totalDemandes = 0;
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  selectedDemande: DemandeResponse ;
  constructor(
    private demandeService: DemandeService,
    private utilisateurService: AuthService,
    private fb: FormBuilder,
    public translate: TranslateService
  ) {
    this.newRequestForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      type: ['support', Validators.required]
    });
  }

  ngOnInit(): void {
    this.utilisateurService.getUserConnect().subscribe((response)=>{
      this.currentUserUuid = response.uuid;
      this.loadDemandes();
    });
    this.checkDarkMode();
  }

  checkDarkMode(): void {
    // Check if dark mode is enabled in localStorage
    const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
    this.isDarkMode = darkModeEnabled;
    if (darkModeEnabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'enabled');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'disabled');
    }
  }

  loadDemandes(): void {
    this.loading = true;
    this.error = null;

    // Get the current user's UUID
    const userUuid = this.currentUserUuid;

    this.demandeService.getDemandesByDemandeurUuid(userUuid)
      .pipe(
        catchError(err => {
          console.error('Error loading demandes:', err);
          this.error = 'Failed to load requests. Please try again.';
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(demandes => {
        this.allDemandes = demandes;

        // Filter demandes by status
        this.pendingDemandes = demandes.filter(d => d.statut === 'EN_ATTENTE');
        this.approvedDemandes = demandes.filter(d => d.statut === 'APPROUVEE');
        this.rejectedDemandes = demandes.filter(d => d.statut === 'REJETEE');

        // Update counts
        this.totalDemandes = demandes.length;
        this.pendingCount = this.pendingDemandes.length;
        this.approvedCount = this.approvedDemandes.length;
        this.rejectedCount = this.rejectedDemandes.length;
      });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  viewDemandeDetails(demande: DemandeResponse): void {
    this.selectedDemande = demande;
  }

  acceptDemande(demande: DemandeResponse): void {
    this.loading = true;

    const updatedDemande = {
      ...demande,
      statut: 'APPROUVEE'
    };

    this.demandeService.updateDemande(updatedDemande)
      .pipe(
        catchError(err => {
          console.error('Error accepting request:', err);
          this.error = 'Failed to accept request. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(result => {
        if (result) {
          // Success - reload data
          this.loadDemandes();
        }
      });
  }

  rejectDemande(demande: DemandeResponse): void {
    this.loading = true;

    const updatedDemande = {
      ...demande,
      statut: 'REJETEE'
    };

    this.demandeService.updateDemande(updatedDemande)
      .pipe(
        catchError(err => {
          console.error('Error rejecting request:', err);
          this.error = 'Failed to reject request. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(result => {
        if (result) {
          // Success - reload data
          this.loadDemandes();
        }
      });
  }

  createNewDemande(): void {
    if (this.newRequestForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.newRequestForm.controls).forEach(key => {
        this.newRequestForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;

    const newDemande: DemandeRequest = {
      titre: this.newRequestForm.value.titre,
      description: this.newRequestForm.value.description,
      type: this.newRequestForm.value.type,
      utilisateurUuid: this.currentUserUuid
    };

    this.demandeService.createDemande(newDemande)
      .pipe(
        catchError(err => {
          console.error('Error creating request:', err);
          this.error = 'Failed to create request. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe(result => {
        if (result) {
          // Success - reset form and reload data
          this.newRequestForm.reset({
            type: 'support'
          });
          this.showNewRequestForm = false;
          this.loadDemandes();
        }
      });
  }

  // Helper methods
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'Pending';
      case 'APPROUVEE': return 'Approved';
      case 'REJETEE': return 'Rejected';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'pending';
      case 'APPROUVEE': return 'approved';
      case 'REJETEE': return 'rejected';
      default: return '';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'support': return 'Support Request';
      case 'commercial': return 'Commercial';
      case 'audiobook': return 'Audiobook';
      case 'videogame': return 'Video Game';
      default: return type;
    }
  }

  toggleNewRequestForm(): void {
    this.showNewRequestForm = !this.showNewRequestForm;
  }
}
