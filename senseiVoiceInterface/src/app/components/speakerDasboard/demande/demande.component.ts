import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DemandeRequest, DemandeResponse, DemandeService } from "../../../services/demande-service.service";
import { UtilisateurService } from "../../../services/utilisateur-service.service";
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import {ActivatedRoute} from "@angular/router";


@Component({
  selector: 'app-demande',
  templateUrl: './demande.component.html',
  styleUrls: ['./demande.component.css']
})
export class DemandeComponent implements OnInit {
  showNewRequestForm = false;
  newRequestForm: FormGroup;
  requests: DemandeResponse[] = [];
  filteredRequests: DemandeResponse[] = [];
  userId: string | null = '';


  // UI state
  loading = false;
  error: string | null = null;
  submitting = false;

  // Filters
  searchTerm = '';
  selectedType = 'all';
  selectedStatus = 'all';

  // Stats
  totalRequests = 0;
  pendingRequests = 0;
  approvedRequests = 0;
  rejectedRequests = 0;

  constructor(
    private fb: FormBuilder,
    private demandeService: DemandeService,
    private utilisateurService: UtilisateurService,
    private route: ActivatedRoute,

  ) {
    this.newRequestForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      preferredDate: ['', Validators.required],
      duration: ['', Validators.required],
      location: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      this.userId = params.get('uuid') || '';
    });
    this.loadDemandes();
    this.loadStats();
  }

  loadDemandes(): void {
    this.loading = true;
    this.error = null;

    // Get the current user's UUID
    const userUuid = this.userId;

    this.demandeService.getDemandesByDemandeurUuid(userUuid)
      .pipe(
        catchError(err => {
          this.error = 'Failed to load requests. Please try again later.';
          console.error('Error loading requests:', err);
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(demandes => {
        this.requests = demandes;
        this.filterRequests();
      });
  }

  loadStats(): void {
    // Get counts for different statuses
    this.demandeService.countDemandesEnAttente()
      .subscribe(count => {
        this.pendingRequests = count;
        this.updateTotalRequests();
      });

    this.demandeService.countDemandesAcceptees()
      .subscribe(count => {
        this.approvedRequests = count;
        this.updateTotalRequests();
      });

    this.demandeService.countDemandesRefusees()
      .subscribe(count => {
        this.rejectedRequests = count;
        this.updateTotalRequests();
      });
  }

  updateTotalRequests(): void {
    this.totalRequests = this.pendingRequests + this.approvedRequests + this.rejectedRequests;
  }

  toggleNewRequestForm(): void {
    this.showNewRequestForm = !this.showNewRequestForm;
    if (!this.showNewRequestForm) {
      this.newRequestForm.reset();
    }
  }

  submitNewRequest(): void {
    if (this.newRequestForm.invalid) {
      // Mark all form controls as touched to trigger validation messages
      Object.keys(this.newRequestForm.controls).forEach(key => {
        this.newRequestForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;

    // Get the current user's UUID
    const userUuid = this.userId;

    const newDemande: DemandeRequest = {
      titre: this.newRequestForm.value.title,
      description: this.newRequestForm.value.description,
      utilisateurUuid: userUuid || '',
      type: this.newRequestForm.value.type
    };

    this.demandeService.createDemande(newDemande)
      .pipe(
        catchError(err => {
          this.error = 'Failed to create request. Please try again later.';
          console.error('Error creating request:', err);
          return of(null);
        }),
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe(response => {
        if (response) {
          this.toggleNewRequestForm();
          this.loadDemandes();
          this.loadStats();
        }
      });
  }

  updateRequestStatus(uuid: string, status: string): void {
    this.demandeService.updateDemande(uuid, status)
      .pipe(
        catchError(err => {
          this.error = 'Failed to update request status. Please try again later.';
          console.error('Error updating request status:', err);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.loadDemandes();
          this.loadStats();
        }
      });
  }

  deleteRequest(uuid: string): void {
    if (confirm('Are you sure you want to delete this request?')) {
      this.demandeService.deleteDemande(uuid)
        .pipe(
          catchError(err => {
            this.error = 'Failed to delete request. Please try again later.';
            console.error('Error deleting request:', err);
            return of(null);
          })
        )
        .subscribe(() => {
          this.loadDemandes();
          this.loadStats();
        });
    }
  }

  filterRequests(): void {
    this.filteredRequests = this.requests.filter(request => {
      // Filter by search term
      const matchesSearch = this.searchTerm === '' ||
        request.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filter by type
      const matchesType = this.selectedType === 'all' || request.type === this.selectedType;

      // Filter by status
      const matchesStatus = this.selectedStatus === 'all' || this.mapStatusToUI(request.statut) === this.selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filterRequests();
  }

  onTypeChange(event: Event): void {
    this.selectedType = (event.target as HTMLSelectElement).value;
    this.filterRequests();
  }

  onStatusChange(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.filterRequests();
  }

  getStatusClass(status: string): string {
    const uiStatus = this.mapStatusToUI(status);
    switch (uiStatus) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'studio': return 'bi-mic';
      case 'podcast': return 'bi-broadcast';
      case 'speaker': return 'bi-person-badge';
      default: return 'bi-question-circle';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'studio': return 'Studio Recording';
      case 'podcast': return 'Podcast Appearance';
      case 'speaker': return 'Speaker Request';
      default: return type;
    }
  }

  // Map backend status to UI status
  mapStatusToUI(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'pending';
      case 'ACCEPTEE': return 'approved';
      case 'EN_COURS': return 'in-progress';
      case 'TERMINEE': return 'completed';
      case 'REFUSEE': return 'rejected';
      default: return status.toLowerCase();
    }
  }

  // Map UI status to backend status
  mapUIToBackend(status: string): string {
    switch (status) {
      case 'pending': return 'EN_ATTENTE';
      case 'approved': return 'ACCEPTEE';
      case 'in-progress': return 'EN_COURS';
      case 'completed': return 'TERMINEE';
      case 'rejected': return 'REFUSEE';
      default: return status.toUpperCase();
    }
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
