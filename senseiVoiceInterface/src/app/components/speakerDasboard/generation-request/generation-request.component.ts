// Updated methods for the component
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionService } from '../../../services/action.service';
import { ProjectService, Project, Action } from '../../../services/project.service';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-generation-request',
  templateUrl: './generation-request.component.html',
  styleUrls: ['./generation-request.component.css']
})
export class GenerationRequestComponent implements OnInit {
  audioUrls: { [key: number]: string } = {};
  private destroy$ = new Subject<void>();
  // Projects data
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  recentActions: Action[] = [];

  // UI state
  loading = true;
  error: string | null = null;
  showNewProjectForm = false;
  newProjectForm: FormGroup;
  submitting = false;

  // Project expansion tracking
  expandedProjects: { [key: number]: boolean } = {};
  projectLoading: { [key: number]: boolean } = {};
  projectErrors: { [key: number]: string } = {};

  // Audio player
  showAudioPlayer = false;
  currentAudio: Action | null = null;
  showFullText: { [key: number]: boolean } = {};

  // Filters and pagination
  searchTerm = '';
  filters = {
    type: '',
    status: ''
  };
  sortOption = 'dateDesc';
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private actionService: ActionService,
    private router: Router
  ) {
    this.newProjectForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = null;

    this.projectService.getAllProjects()
      .pipe(
        catchError(err => {
          this.error = 'Failed to load projects. Please try again later.';
          console.error('Error loading projects:', err);
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(projects => {
        this.projects = projects;
        this.applyFilters();
        this.loadRecentActions();
      });
  }

  loadRecentActions(): void {
    // This would be a service call in a real app
    // For now, we'll just collect the first action from each project
    const recentActions: Action[] = [];
    this.projects.forEach(project => {
      if (project.actions && project.actions.length > 0) {
        const action = {...project.actions[1]};
        action.project = project;
        recentActions.push(action);
      }
    });

    this.recentActions = recentActions.slice(0, 5);
  }

  loadProjectActions(projectId: number): void {
    if (!this.expandedProjects[projectId]) {
      return;
    }

    this.projectLoading[projectId] = true;
    this.projectErrors[projectId] = '';

    // In a real app, this would be a service call to get actions for a specific project
    // For now, we'll just simulate it
    setTimeout(() => {
      const project = this.projects.find(p => p.id === projectId);
      if (project && (!project.actions || project.actions.length === 0)) {
        // If the project doesn't have actions, we'll add some mock data
        project.actions = [];
      }
      this.projectLoading[projectId] = false;
    }, 1000);
  }

  toggleProjectExpansion(projectId: number): void {
    this.expandedProjects[projectId] = !this.expandedProjects[projectId];

    // Load project actions if expanding and not already loaded
    if (this.expandedProjects[projectId]) {
      const project = this.projects.find(p => p.id === projectId);
      if (project && (!project.actions || project.actions.length === 0)) {
        this.loadProjectActions(projectId);
      }
    }
  }

  applyFilters(): void {
    let filtered = [...this.projects];

    // Apply search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(term) ||
        (project.description && project.description.toLowerCase().includes(term))
      );
    }


    // Apply status filter
    if (this.filters.status) {
      filtered = filtered.filter(project =>
        (project.actions && project.actions.some(a => a.statutAction === this.filters.status))
      );
    }

    // Apply sorting
    filtered = this.sortProjects(filtered);

    // Update total pages
    this.totalPages = Math.ceil(filtered.length / this.pageSize);

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredProjects = filtered.slice(startIndex, startIndex + this.pageSize);
  }

  sortProjects(projects: Project[]): Project[] {
    switch (this.sortOption) {
      case 'dateAsc':
        return [...projects].sort((a, b) =>
          new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime()
        );
      case 'nameAsc':
        return [...projects].sort((a, b) => a.name.localeCompare(b.name));
      case 'nameDesc':
        return [...projects].sort((a, b) => b.name.localeCompare(a.name));
      case 'dateDesc':
      default:
        return [...projects].sort((a, b) =>
          new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
        );
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.applyFilters();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if there are few
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show a subset of pages with current page in the middle
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;

      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  toggleNewProjectForm(): void {
    this.showNewProjectForm = !this.showNewProjectForm;
    if (!this.showNewProjectForm) {
      this.newProjectForm.reset();
    }
  }

  submitNewProject(): void {
    if (this.newProjectForm.invalid) {
      // Mark all form controls as touched to trigger validation messages
      Object.keys(this.newProjectForm.controls).forEach(key => {
        this.newProjectForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;

    const newProject = {
      name: this.newProjectForm.value.name,
      type: this.newProjectForm.value.type,
      description: this.newProjectForm.value.description,
      dateDue: this.newProjectForm.value.dueDate ? new Date(this.newProjectForm.value.dueDate) : null
    };

    // In a real app, this would be a service call
    setTimeout(() => {
      this.submitting = false;
      this.toggleNewProjectForm();
      this.loadProjects();
    }, 1000);
  }

  navigateToGeneration(projectId: number): void {
    this.router.navigate(['/generation'], { queryParams: { projectId } });
  }

  playAudio(action: Action): void {
    this.currentAudio = action;
    this.showAudioPlayer = true;
  }

  closeAudioPlayer(): void {
    this.showAudioPlayer = false;
    this.currentAudio = null;
  }

  ngOnDestroy(): void {
    // Clean up any created blob URLs to prevent memory leaks
    Object.values(this.audioUrls).forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    this.destroy$.next();
    this.destroy$.complete();
  }

// Replace your getAudioUrl method with this
  getAudioUrl(action: Action): string {
    if (!action.audioGenerated) {
      return '';
    }

    // Return cached URL if we have it
    if (action.id && this.audioUrls[action.id]) {
      return this.audioUrls[action.id];
    }

    // Create a new URL and cache it
    this.projectService.createAudioUrl(action)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        url => {
          if (action.id) {
            this.audioUrls[action.id] = url;
          }
        },
        error => console.error('Error getting audio URL:', error)
      );

    return action.id && this.audioUrls[action.id] ? this.audioUrls[action.id] : '';
  }

// Replace your downloadAudio method with this
  downloadAudio(action: Action): void {
    if (!action.audioGenerated) {
      alert('No audio available for download');
      return;
    }

    const filename = `${action.voice?.name || 'audio'}_${action.id || 'download'}.mp3`;

    this.projectService.downloadAudio(action, filename)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        success => {
          if (!success) {
            alert('Failed to download audio. Please try again later.');
          }
        },
        error => {
          console.error('Error downloading audio:', error);
          alert('Failed to download audio. Please try again later.');
        }
      );
  }

  getAudioStatus(action: Action): string {
    if (!action.statutAction) {
      return 'Unknown';
    }

    switch (action.statutAction) {
      case 'COMPLETED':
        return 'Completed';
      case 'PROCESSING':
        return 'Processing';
      case 'FAILED':
        return 'Failed';
      case 'PENDING':
      case 'EN_ATTENTE':
        return 'Pending';
      default:
        return action.statutAction;
    }
  }

  toggleFullText(action: Action): void {
    this.showFullText[action.id] = !this.showFullText[action.id];
  }

  viewAllAudio(): void {
    this.router.navigate(['/audio-library']);
  }


}
