import { Component, OnInit } from '@angular/core';
import { ActionService, ActionResponse } from '../../services/action.service';
import { ClientService, ClientResponse } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css']
})
export class ActionComponent implements OnInit {
  // Filter values
  statusFilter = "";
  languageFilter = "";
  searchFilter = "";
  client : ClientResponse =new ClientResponse();

  // Loading and error states
  loading = false;
  error: string | null = null;
  processing = false;

  // Current user
  currentSpeakerUuid = '';

  // Actions data
  actions: ActionResponse[] = [];
  selectedAction: ActionResponse | null = null;

  // Action stats
  totalActions = 0;
  pendingActions = 0;
  inProgressActions = 0;
  completedActions = 0;

  constructor(
    private actionService: ActionService,
    private utilisateurService: AuthService,
    private clientSrvice : ClientService
  ) {}

  ngOnInit(): void {
    this.utilisateurService.getUserConnect().subscribe((response)=>{
      this.currentSpeakerUuid = response.uuid;
      this.loadActions();
    });

  }

  loadActions(): void {
    this.loading = true;
    this.error = null;

    this.actionService.getActionBySpeakerUuid(this.currentSpeakerUuid)
      .pipe(
        catchError(err => {
          console.error('Error loading actions:', err);
          this.error = 'Failed to load actions. Please try again.';
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(actions => {
        this.actions = actions;
        this.calculateStats(actions);
      });
  }

  calculateStats(actions: ActionResponse[]): void {
    this.totalActions = actions.length;

    // Reset counters
    this.pendingActions = 0;
    this.inProgressActions = 0;
    this.completedActions = 0;

    // Calculate stats
    actions.forEach(action => {
      if (action.statutAction === 'EN_ATTENTE') {
        this.pendingActions++;
      } else if (action.statutAction === 'EN_COURS') {
        this.inProgressActions++;
      } else if (action.statutAction === 'TERMINEE') {
        this.completedActions++;
      }
    });
  }

  viewAction(action: ActionResponse): void {
    this.clientSrvice.getClientByUuid(action.utilisateurUuid).subscribe((response)=>{
      this.client = response ;
    })
    this.selectedAction = action;
  }

  validateAction(action: ActionResponse): void {
    this.processing = true;

    this.actionService.validateAction(action.uuid)
      .pipe(
        catchError(err => {
          console.error('Error validating action:', err);
          this.error = 'Failed to validate action. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe(result => {
        if (result) {
          // Success - reload data
          this.loadActions();

          // Close modal if open
          if (this.selectedAction && this.selectedAction.uuid === action.uuid) {
            document.getElementById('closeActionModal')?.click();
          }
        }
      });
  }

  rejectAction(action: ActionResponse): void {
    if (!confirm('Are you sure you want to reject this action?')) {
      return;
    }

    this.processing = true;

    this.actionService.rejectAction(action.uuid)
      .pipe(
        catchError(err => {
          console.error('Error rejecting action:', err);
          this.error = 'Failed to reject action. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe(result => {
        if (result) {
          // Success - reload data
          this.loadActions();

          // Close modal if open
          if (this.selectedAction && this.selectedAction.uuid === action.uuid) {
            document.getElementById('closeActionModal')?.click();
          }
        }
      });
  }

  sendNotification(action: ActionResponse): void {
    this.processing = true;

    this.actionService.sendNotification(action.utilisateurUuid, this.currentSpeakerUuid, action.uuid)
      .pipe(
        catchError(err => {
          console.error('Error sending notification:', err);
          this.error = 'Failed to send notification. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe(result => {
        if (result) {
          alert('Notification sent successfully!');
        }
      });
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'Pending';
      case 'EN_COURS': return 'In Progress';
      case 'TERMINEE': return 'Completed';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'pending';
      case 'EN_COURS': return 'in-progress';
      case 'TERMINEE': return 'completed';
      default: return '';
    }
  }

  // Filter methods
  applyFilters(): ActionResponse[] {
    return this.actions.filter(action => {
      // Status filter
      if (this.statusFilter && action.statutAction !== this.statusFilter) {
        return false;
      }

      // Language filter
      if (this.languageFilter && action.language !== this.languageFilter) {
        return false;
      }

      // Search filter (text or code)
      if (this.searchFilter) {
        const searchTerm = this.searchFilter.toLowerCase();
        return action.text.toLowerCase().includes(searchTerm) ||
          action.code.toLowerCase().includes(searchTerm);
      }

      return true;
    });
  }

  getUniqueLanguages(): string[] {
    const languages = new Set<string>();
    this.actions.forEach(action => {
      if (action.language) {
        languages.add(action.language);
      }
    });
    return Array.from(languages);
  }
}
