import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FactureService, FactureSpeakerResponse, FactureSpeaker } from '../../services/facture.service';
import { AuthService } from '../../services/auth.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-invoice',
  templateUrl: './inovoice.component.html',
  styleUrls: ['./inovoice.component.css']
})
export class InovoiceComponent implements OnInit {
  // Filter values
  statusFilter = "";
  dateFilter = "all";
  searchFilter = "";

  // Loading and error states
  loading = false;
  error: string | null = null;
  submitting = false;

  // Current user
  currentSpeakerUuid = '';

  // Invoices data
  invoices: FactureSpeakerResponse[] = [];
  selectedInvoice: FactureSpeakerResponse | null = null;

  // File upload
  selectedFile: File | null = null;

  // New invoice form
  newInvoiceForm: FormGroup;

  // Invoice stats
  totalInvoices = 0;
  paidInvoices = 0;
  pendingInvoices = 0;
  overdueInvoices = 0;
  totalAmount = 0;
  paidAmount = 0;
  pendingAmount = 0;
  overdueAmount = 0;

  constructor(
    private factureService: FactureService,
    private utilisateurService: AuthService,
    private fb: FormBuilder
  ) {
    this.newInvoiceForm = this.fb.group({
      dateEmission: ['', Validators.required],
      datePaiement: [''],
      montant: [0, [Validators.required, Validators.min(0)]],
      statut: ['EN_ATTENTE', Validators.required],
      file: [null]
    });
  }

  ngOnInit(): void {
    this.utilisateurService.getUserConnect().subscribe((response)=>{
      this.currentSpeakerUuid = response.uuid;
      this.loadInvoices();
    });

  }

  loadInvoices(): void {
    this.loading = true;
    this.error = null;

    this.factureService.getFacturesSpeaker(this.currentSpeakerUuid)
      .pipe(
        catchError(err => {
          console.error('Error loading invoices:', err);
          this.error = 'Failed to load invoices. Please try again.';
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(invoices => {
        this.invoices = invoices;
        this.calculateStats(invoices);
      });
  }

  calculateStats(invoices: FactureSpeakerResponse[]): void {
    this.totalInvoices = invoices.length;

    // Reset counters
    this.paidInvoices = 0;
    this.pendingInvoices = 0;
    this.overdueInvoices = 0;
    this.totalAmount = 0;
    this.paidAmount = 0;
    this.pendingAmount = 0;
    this.overdueAmount = 0;

    // Calculate stats
    invoices.forEach(invoice => {
      this.totalAmount += invoice.montant;

      if (invoice.statut === 'PAYEE') {
        this.paidInvoices++;
        this.paidAmount += invoice.montant;
      } else if (invoice.statut === 'EN_ATTENTE') {
        this.pendingInvoices++;
        this.pendingAmount += invoice.montant;
      } else if (invoice.statut === 'EN_RETARD') {
        this.overdueInvoices++;
        this.overdueAmount += invoice.montant;
      }
    });
  }

  viewInvoice(invoice: FactureSpeakerResponse): void {
    this.selectedInvoice = invoice;
  }

  downloadInvoice(invoice: FactureSpeakerResponse): void {
    this.loading = true;

    this.factureService.downloadPdf(invoice.uuid)
      .pipe(
        catchError(err => {
          console.error('Error downloading invoice:', err);
          this.error = 'Failed to download invoice. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(blob => {
        if (blob) {
          // Create a URL for the blob
          const url = window.URL.createObjectURL(blob);

          // Create a link element
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${invoice.code}.pdf`;

          // Append to the document and trigger the download
          document.body.appendChild(a);
          a.click();

          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.newInvoiceForm.patchValue({
        file: file
      });
    }
  }

  createInvoice(): void {
    if (this.newInvoiceForm.invalid || !this.selectedFile) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.newInvoiceForm.controls).forEach(key => {
        this.newInvoiceForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;

    const formData = new FormData();
    formData.append('dateEmission', '2025-04-11T12:30:00');
    formData.append('datePaiement', '2025-04-11T12:30:00');
    formData.append('montant', this.newInvoiceForm.value.montant);
    formData.append('statut', this.newInvoiceForm.value.statut);
    formData.append('speakerUuid', this.currentSpeakerUuid);
    formData.append('pdfData', this.selectedFile);

    this.factureService.ajouterFactureSpeaker(formData)
      .pipe(
        catchError(err => {
          console.error('Error creating invoice:', err);
          this.error = 'Failed to create invoice. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe(result => {
        if (result) {
          // Success - reset form and reload data
          this.resetForm();
          this.loadInvoices();

          // Close modal
          document.getElementById('createInvoiceModal')?.click();
        }
      });
  }

  uploadInvoicePdf(invoice: FactureSpeakerResponse): void {
    if (!this.selectedFile) {
      this.error = 'Please select a file to upload.';
      return;
    }

    this.loading = true;

    this.factureService.uploadPdf(invoice.uuid, this.selectedFile)
      .pipe(
        catchError(err => {
          console.error('Error uploading PDF:', err);
          this.error = 'Failed to upload PDF. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(result => {
        if (result) {
          // Success - reload data
          this.loadInvoices();
          this.selectedFile = null;
        }
      });
  }

  resetForm(): void {
    this.newInvoiceForm.reset({
      dateEmission: '',
      datePaiement: '',
      montant: 0,
      statut: 'EN_ATTENTE',
      file: null
    });
    this.selectedFile = null;
  }

  generateInvoiceCode(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAYEE': return 'Paid';
      case 'EN_ATTENTE': return 'Pending';
      case 'EN_RETARD': return 'Overdue';
      case 'BROUILLON': return 'Draft';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAYEE': return 'paid';
      case 'EN_ATTENTE': return 'pending';
      case 'EN_RETARD': return 'overdue';
      case 'BROUILLON': return 'draft';
      default: return '';
    }
  }
}
