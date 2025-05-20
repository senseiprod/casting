import { Component, OnInit } from '@angular/core';
import { TransactionService, TransactionssResponse, TransactionssDto } from '../../services/transaction.service';
import { FactureService, FactureSpeakerResponse, FactureSpeaker } from '../../services/facture.service';
import { DemandeService, DemandeRequest, DemandeResponse } from '../../services/demande.service';
import { ActionService, ActionRequest, Action,ActionResponse } from '../../services/action.service';
import { AuthService } from '../../services/auth.service';
import { catchError, finalize, forkJoin, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  subtext?: string;
  isUp?: boolean;
}

interface PaymentMethod {
  icon: string;
  name: string;
  details: string;
  isActive?: boolean;
}

interface TransactionDetail {
  uuid: string;
  code: string;
  date: string;
  amount: number;
  formattedAmount: string;
  type: string;
  status: string;
  description: string;
  factureUuid: string;
  factureCode?: string;
  demandeUuid?: string;
  demandeCode?: string;
  isWithdrawal: boolean;
  isPending: boolean;
}

interface ActionWithSelection extends ActionResponse {
  selected: boolean;
  amount: number;
}

@Component({
  selector: 'app-earning',
  templateUrl: './earning.component.html',
  styleUrls: ['./earning.component.css']
})
export class EarningComponent implements OnInit {
  // UI state
  loading = false;
  error: string | null = null;
  submitting = false;
  isDarkMode = false;
  showTransactionDetails = false;
  selectedTransaction: TransactionDetail | null = null;

  // Data from services
  transactions: TransactionssResponse[] = [];
  factures: FactureSpeakerResponse[] = [];
  demandes: DemandeResponse[] = [];
  speakerActions: ActionWithSelection[] = [];

  // Calculated values
  availableBalance = "$0.00";
  totalEarnings = "$0.00";
  pendingAmount = "$0.00";
  monthlyAverage = "$0.00";
  withdrawAmount = 0;
  pendingPaymentsCount = 0;
  currentUserUuid = '';

  // UI components
  statCards: StatCard[] = [];
  transactionDetails: TransactionDetail[] = [];
  withdrawForm: FormGroup;
  invoiceForm: FormGroup;

  // Signature upload
  signatureFile: File | null = null;
  signaturePreview: string | null = null;

  // Selected actions for invoice
  selectedActionsTotal = 0;

  // Current step in withdrawal process
  withdrawalStep = 1; // 1: Select actions, 2: Review and confirm

  paymentMethods: PaymentMethod[] = [
    { icon: "bi-bank", name: "Bank Transfer", details: "****6789 • Chase Bank", isActive: true },
    { icon: "bi-credit-card", name: "Credit Card", details: "****4321 • Visa", isActive: false },
    { icon: "bi-paypal", name: "PayPal", details: "john.doe@example.com", isActive: false },
  ];

  constructor(
    private transactionService: TransactionService,
    private factureService: FactureService,
    private demandeService: DemandeService,
    private actionService: ActionService,
    private utilisateurService: AuthService,
    private fb: FormBuilder
  ) {
    this.withdrawForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1)]],
      description: ['Withdrawal of funds', Validators.required],
      paymentMethodIndex: [0, Validators.required]
    });

    this.invoiceForm = this.fb.group({
      invoiceTitle: ['Invoice for completed actions', Validators.required],
      invoiceDescription: ['Payment for voice generation services', Validators.required],
      signature: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.utilisateurService.getUserConnect().subscribe((response)=>{
      this.currentUserUuid = response.uuid;
      this.loadData();
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

  loadData(): void {
    this.loading = true;
    this.error = null;

    // Get the current user's UUID
    const speakerUuid = this.currentUserUuid;

    // Load transactions, factures, demandes, and actions
    forkJoin({
      transactions: this.transactionService.getTransactionsBySpeaker(speakerUuid).pipe(
        catchError(err => {
          console.error('Error loading transactions:', err);
          return of([]);
        })
      ),
      factures: this.factureService.getFacturesSpeaker(speakerUuid).pipe(
        catchError(err => {
          console.error('Error loading factures:', err);
          return of([]);
        })
      ),
      demandes: this.demandeService.getDemandesByDemandeurUuid(speakerUuid).pipe(
        catchError(err => {
          console.error('Error loading demandes:', err);
          return of([]);
        })
      ),
      actions: this.actionService.getActionBySpeakerUuid(speakerUuid).pipe(
        catchError(err => {
          console.error('Error loading actions:', err);
          return of([]);
        })
      )
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(result => {
      this.transactions = result.transactions;
      this.factures = result.factures;
      this.demandes = result.demandes;

      // Process actions and add selection property
      this.speakerActions = result.actions.map(action => ({
        ...action,
        selected: false,
        amount: this.calculateActionAmount(action) // Calculate amount for each action
      }));

      // Process the data
      this.calculateStatistics();
      this.prepareStatCards();
      this.prepareTransactionDetails();
    });
  }

  calculateActionAmount(action: ActionResponse): number {
    // This is a placeholder - in a real app, you'd have a proper calculation
    // based on action type, length, etc.
    return action.text.length * 0.05; // Example: $0.05 per character
  }

  calculateStatistics(): void {
    // Calculate total earnings
    const totalAmount = this.transactions
      .filter(t => !this.isWithdrawal(t))
      .reduce((sum, t) => sum + t.montant, 0);
    this.totalEarnings = this.formatCurrency(totalAmount);

    // Calculate available balance (total minus withdrawals)
    const withdrawals = this.transactions
      .filter(t => this.isWithdrawal(t))
      .reduce((sum, t) => sum + Math.abs(t.montant), 0);
    const availableAmount = totalAmount - withdrawals;
    this.availableBalance = this.formatCurrency(availableAmount);
    this.withdrawAmount = Math.min(1000, availableAmount);
    this.withdrawForm.get('amount')?.setValue(this.withdrawAmount);

    // Calculate pending payments
    const pendingFactures = this.factures.filter(f => f.statut === 'EN_ATTENTE');
    this.pendingPaymentsCount = pendingFactures.length;
    const pendingAmount = pendingFactures.reduce((sum, f) => sum + f.montant, 0);
    this.pendingAmount = this.formatCurrency(pendingAmount);

    // Calculate monthly average
    const now = new Date();
    const currentYear = now.getFullYear();
    const transactionsThisYear = this.transactions.filter(t => {
      const transactionDate = new Date(t.dateTransaction);
      return transactionDate.getFullYear() === currentYear && !this.isWithdrawal(t);
    });

    const monthsWithTransactions = new Set(
      transactionsThisYear.map(t => new Date(t.dateTransaction).getMonth())
    );

    const monthCount = monthsWithTransactions.size || 1; // Avoid division by zero
    const monthlyAvg = totalAmount / monthCount;
    this.monthlyAverage = this.formatCurrency(monthlyAvg);
  }

  prepareStatCards(): void {
    // Calculate year-over-year growth (mock data for now)
    const yearOverYearGrowth = 15;
    const monthOverMonthGrowth = 8;

    this.statCards = [
      {
        title: "Total Earnings (YTD)",
        value: this.totalEarnings,
        icon: "bi-currency-dollar",
        color: "primary",
        subtext: `${yearOverYearGrowth}% from last year`,
        isUp: yearOverYearGrowth > 0,
      },
      {
        title: "Available Balance",
        value: this.availableBalance,
        icon: "bi-wallet",
        color: "success",
        subtext: "Ready to withdraw",
      },
      {
        title: "Pending Payments",
        value: this.pendingAmount,
        icon: "bi-hourglass-split",
        color: "warning",
        subtext: `${this.pendingPaymentsCount} payments pending`,
      },
      {
        title: "Monthly Average",
        value: this.monthlyAverage,
        icon: "bi-bar-chart",
        color: "info",
        subtext: `${monthOverMonthGrowth}% from last month`,
        isUp: monthOverMonthGrowth > 0,
      },
    ];
  }

  prepareTransactionDetails(): void {
    // Create detailed transaction objects with related facture and demande info
    this.transactionDetails = this.transactions.map(transaction => {
      const isWithdrawal = this.isWithdrawal(transaction);
      const isPending = this.isPendingTransaction(transaction);

      // Find related facture
      const facture = this.factures.find(f => f.uuid === transaction.factureUuid);

      // Find related demande (if any)
      const demande = this.demandes.find(d => {
        // This is a simplified relationship - in a real app, you'd have a direct link
        // between demande and facture or transaction
        return d.type === 'retrait' &&
          d.code.includes(transaction.code) ||
          (facture && d.code.includes(facture.code));
      });

      return {
        uuid: transaction.uuid,
        code: transaction.code,
        date: this.formatDate(transaction.dateTransaction),
        amount: transaction.montant,
        formattedAmount: this.formatAmount(transaction.montant, isWithdrawal, isPending),
        type: isWithdrawal ? 'Withdrawal' : 'Payment',
        status: isPending ? 'Pending' : 'Completed',
        description: this.getTransactionDescription(transaction),
        factureUuid: transaction.factureUuid,
        factureCode: facture?.code,
        demandeUuid: demande?.uuid,
        demandeCode: demande?.code,
        isWithdrawal: isWithdrawal,
        isPending: isPending
      };
    });

    // Sort by date (newest first)
    this.transactionDetails.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  // Helper methods
  isWithdrawal(transaction: TransactionssResponse): boolean {
    return transaction.montant < 0;
  }

  isPendingTransaction(transaction: TransactionssResponse): boolean {
    // Check if this transaction is associated with a pending facture
    const facture = this.factures.find(f => f.uuid === transaction.factureUuid);
    return facture ? facture.statut === 'EN_ATTENTE' : false;
  }

  getTransactionDescription(transaction: TransactionssResponse): string {
    if (this.isWithdrawal(transaction)) {
      return "Withdrawal to Bank Account";
    }

    const facture = this.factures.find(f => f.uuid === transaction.factureUuid);
    return facture ? `Invoice ${facture.code}` : "Payment";
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatAmount(amount: number, isWithdrawal: boolean, isPending: boolean): string {
    if (isPending) {
      return this.formatCurrency(amount);
    }
    return (isWithdrawal ? '-' : '+') + this.formatCurrency(Math.abs(amount));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // UI actions
  exportReport(): void {
    console.log("Exporting report...");
    // Implement export functionality
  }

  viewTransactionDetails(transaction: TransactionDetail): void {
    this.selectedTransaction = transaction;
    this.showTransactionDetails = true;
  }

  closeTransactionDetails(): void {
    this.showTransactionDetails = false;
    this.selectedTransaction = null;
  }

  // Action selection methods
  toggleActionSelection(action: ActionWithSelection): void {
    action.selected = !action.selected;
    this.updateSelectedActionsTotal();
  }

  updateSelectedActionsTotal(): void {
    this.selectedActionsTotal = this.speakerActions
      .filter(action => action.selected)
      .reduce((sum, action) => sum + action.amount, 0);
  }

  selectAllActions(): void {
    this.speakerActions.forEach(action => action.selected = true);
    this.updateSelectedActionsTotal();
  }

  deselectAllActions(): void {
    this.speakerActions.forEach(action => action.selected = false);
    this.updateSelectedActionsTotal();
  }

  // Signature upload methods
  onSignatureUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Check if file is a PNG
      if (file.type !== 'image/png') {
        alert('Please upload a PNG image for your signature');
        return;
      }

      this.signatureFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.signaturePreview = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Update form control
      this.invoiceForm.get('signature')?.setValue(file);
    }
  }

  clearSignature(): void {
    this.signatureFile = null;
    this.signaturePreview = null;
    this.invoiceForm.get('signature')?.setValue(null);
  }

  // Withdrawal process methods
  openWithdrawalModal(): void {
    // Reset the withdrawal process
    this.withdrawalStep = 1;
    this.deselectAllActions();
    this.clearSignature();
    this.invoiceForm.reset({
      invoiceTitle: 'Invoice for completed actions',
      invoiceDescription: 'Payment for voice generation services'
    });
  }

  nextStep(): void {
    if (this.withdrawalStep === 1) {
      // Validate step 1
      if (this.speakerActions.filter(a => a.selected).length === 0) {
        alert('Please select at least one action to include in your invoice');
        return;
      }

      if (!this.invoiceForm.get('signature')?.valid) {
        alert('Please upload your signature');
        return;
      }

      this.withdrawalStep = 2;
    }
  }

  previousStep(): void {
    if (this.withdrawalStep === 2) {
      this.withdrawalStep = 1;
    }
  }

  submitWithdrawal(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    if (this.selectedActionsTotal <= 0) {
      alert('Please select at least one action to include in your invoice');
      return;
    }

    if (!this.signatureFile) {
      alert('Please upload your signature');
      return;
    }

    this.submitting = true;

    // Get selected actions
    const selectedActions = this.speakerActions.filter(action => action.selected);
    const selectedActionUuids = selectedActions.map(action => action.uuid);

    // Create FormData for the invoice with signature
    const formData = new FormData();
    formData.append('title', this.invoiceForm.get('invoiceTitle')?.value);
    formData.append('description', this.invoiceForm.get('invoiceDescription')?.value);
    formData.append('amount', this.selectedActionsTotal.toString());
    formData.append('speakerUuid', this.currentUserUuid);
    formData.append('signature', this.signatureFile as Blob);
    formData.append('actionUuids', JSON.stringify(selectedActionUuids));

    // 1. Create a facture with the selected actions and signature
    this.factureService.ajouterFactureSpeaker(formData)
      .pipe(
        switchMap(facture => {
          // 2. Create a withdrawal request (demande)
          const withdrawalRequest: DemandeRequest = {
            titre: `Withdrawal Request - ${this.formatCurrency(this.selectedActionsTotal)}`,
            description: this.invoiceForm.get('invoiceDescription')?.value,
            utilisateurUuid: this.currentUserUuid,
            type: 'retrait'
          };

          return this.demandeService.createDemande(withdrawalRequest).pipe(
            switchMap(demande => {
              // 3. Create a withdrawal transaction
              const withdrawalTransaction: TransactionssDto = {
                code: `WT-${Date.now()}`,
                montant: -this.selectedActionsTotal, // Negative amount for withdrawals
                dateTransaction: new Date().toISOString(),
                factureUuid: facture.uuid
              };

              return this.transactionService.createTransaction(withdrawalTransaction);
            })
          );
        }),
        catchError(err => {
          this.error = 'Failed to process withdrawal. Please try again later.';
          console.error('Error processing withdrawal:', err);
          return of(null);
        }),
        finalize(() => {
          this.submitting = false;
        })
      )
      .subscribe(response => {
        if (response) {
          // Close the modal
          const modalElement = document.getElementById('withdrawModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            if (modal) {
              modal.hide();
            }
          }

          // Reset form
          this.invoiceForm.reset({
            invoiceTitle: 'Invoice for completed actions',
            invoiceDescription: 'Payment for voice generation services'
          });
          this.clearSignature();
          this.deselectAllActions();

          // Reload data
          this.loadData();
        }
      });
  }

  selectPaymentMethod(index: number): void {
    this.paymentMethods.forEach((method, i) => {
      method.isActive = i === index;
    });
    this.withdrawForm.get('paymentMethodIndex')?.setValue(index);
  }
  // Dans ton component.ts
   selectedActionsCount(): number {
    return this.speakerActions.filter(a => a.selected).length;
  }

}
