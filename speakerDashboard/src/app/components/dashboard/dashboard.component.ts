import { Component, OnInit } from '@angular/core';
import { TransactionService, TransactionssResponse, TransactionssDto } from '../../services/transaction.service';
import { FactureService, FactureSpeakerResponse, FactureSpeaker } from '../../services/facture.service';
import { DemandeService, DemandeRequest, DemandeResponse } from '../../services/demande.service';
import { ActionService, ActionRequest, Action,ActionResponse } from '../../services/action.service';
import { AuthService } from '../../services/auth.service';
import { catchError, finalize, forkJoin } from 'rxjs';
import { of } from 'rxjs';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  subtext?: string;
  isUp?: boolean;
  percentage?: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

interface RecentActivity {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  icon: string;
  color: string;
  status?: string;
  statusColor?: string;
  amount?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // UI state
  loading = false;
  error: string | null = null;
  isDarkMode = false;

  // Data from services
  transactions: TransactionssResponse[] = [];
  factures: FactureSpeakerResponse[] = [];
  demandes: DemandeResponse[] = [];
  actions: ActionResponse[] = [];

  // Dashboard statistics
  totalEarnings = "$0.00";
  totalActions = 0;
  totalFactures = 0;
  totalDemandes = 0;
  totalTransactions = 0;
  completedActions = 0;
  pendingActions = 0;
  pendingFactures = 0;
  pendingDemandes = 0;

  // Current user
  currentUserUuid = '';

  // UI components
  statCards: StatCard[] = [];
  recentActivities: RecentActivity[] = [];

  // Chart data
  earningsChartData: ChartData = {
    labels: [],
    datasets: [{
      label: 'Earnings',
      data: [],
      borderColor: '#CB1025',
      borderWidth: 2,
      fill: false
    }]
  };

  actionsChartData: ChartData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      label: 'Actions',
      data: [0, 0, 0],
      backgroundColor: ['#198754', '#0dcaf0', '#ffc107']
    }]
  };

  facturesChartData: ChartData = {
    labels: ['Paid', 'Pending'],
    datasets: [{
      label: 'Factures',
      data: [0, 0],
      backgroundColor: ['#198754', '#ffc107']
    }]
  };

  demandesChartData: ChartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      label: 'Demandes',
      data: [0, 0, 0],
      backgroundColor: ['#198754', '#ffc107', '#dc3545']
    }]
  };

  constructor(
    private transactionService: TransactionService,
    private factureService: FactureService,
    private demandeService: DemandeService,
    private actionService: ActionService,
    private utilisateurService: AuthService
  ) {}

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

    // Load all data
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
      this.actions = result.actions;

      // Process the data
      this.calculateStatistics();
      this.prepareStatCards();
      this.prepareChartData();
      this.prepareRecentActivities();
    });
  }

  calculateStatistics(): void {
    // Calculate total earnings
    const totalAmount = this.transactions
      .filter(t => t.montant > 0)
      .reduce((sum, t) => sum + t.montant, 0);
    this.totalEarnings = this.formatCurrency(totalAmount);

    // Count totals
    this.totalActions = this.actions.length;
    this.totalFactures = this.factures.length;
    this.totalDemandes = this.demandes.length;
    this.totalTransactions = this.transactions.length;

    // Count by status
    this.completedActions = this.actions.filter(a => a.statutAction === 'TERMINEE').length;
    this.pendingActions = this.actions.filter(a => a.statutAction === 'EN_ATTENTE').length;
    this.pendingFactures = this.factures.filter(f => f.statut === 'EN_ATTENTE').length;
    this.pendingDemandes = this.demandes.filter(d => d.statut === 'EN_ATTENTE').length;
  }

  prepareStatCards(): void {
    // Calculate growth percentages (mock data for demonstration)
    const actionGrowth = 12;
    const factureGrowth = 8;
    const demandeGrowth = -3;
    const earningsGrowth = 15;

    this.statCards = [
      {
        title: "Total Actions",
        value: this.totalActions.toString(),
        icon: "bi-mic",
        color: "primary",
        subtext: `${this.completedActions} completed, ${this.pendingActions} pending`,
        isUp: actionGrowth > 0,
        percentage: actionGrowth
      },
      {
        title: "Total Earnings",
        value: this.totalEarnings,
        icon: "bi-currency-dollar",
        color: "success",
        subtext: `${earningsGrowth}% from last month`,
        isUp: earningsGrowth > 0,
        percentage: earningsGrowth
      },
      {
        title: "Invoices",
        value: this.totalFactures.toString(),
        icon: "bi-receipt",
        color: "info",
        subtext: `${this.pendingFactures} pending approval`,
        isUp: factureGrowth > 0,
        percentage: factureGrowth
      },
      {
        title: "Requests",
        value: this.totalDemandes.toString(),
        icon: "bi-file-earmark-text",
        color: "warning",
        subtext: `${this.pendingDemandes} pending approval`,
        isUp: demandeGrowth > 0,
        percentage: demandeGrowth
      },
    ];
  }

  prepareChartData(): void {
    // Prepare earnings chart data (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    // Get last 6 months
    const last6Months = Array.from({length: 6}, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      return months[monthIndex];
    }).reverse();

    // Calculate earnings per month
    const earningsData = last6Months.map(month => {
      // This is a simplified calculation - in a real app, you'd filter transactions by month
      const monthIndex = months.indexOf(month);
      return this.transactions
        .filter(t => {
          const transactionDate = new Date(t.dateTransaction);
          return transactionDate.getMonth() === monthIndex && t.montant > 0;
        })
        .reduce((sum, t) => sum + t.montant, 0);
    });

    this.earningsChartData = {
      labels: last6Months,
      datasets: [{
        label: 'Earnings',
        data: earningsData,
        borderColor: '#CB1025',
        borderWidth: 2,
        fill: false
      }]
    };

    // Prepare actions chart data
    const completedActions = this.actions.filter(a => a.statutAction === 'TERMINEE').length;
    const inProgressActions = this.actions.filter(a => a.statutAction === 'EN_COURS').length;
    const pendingActions = this.actions.filter(a => a.statutAction === 'EN_ATTENTE').length;

    this.actionsChartData.datasets[0].data = [completedActions, inProgressActions, pendingActions];

    // Prepare factures chart data
    const paidFactures = this.factures.filter(f => f.statut === 'PAYEE').length;
    const pendingFactures = this.factures.filter(f => f.statut === 'EN_ATTENTE').length;

    this.facturesChartData.datasets[0].data = [paidFactures, pendingFactures];

    // Prepare demandes chart data
    const approvedDemandes = this.demandes.filter(d => d.statut === 'APPROUVEE').length;
    const pendingDemandes = this.demandes.filter(d => d.statut === 'EN_ATTENTE').length;
    const rejectedDemandes = this.demandes.filter(d => d.statut === 'REJETEE').length;

    this.demandesChartData.datasets[0].data = [approvedDemandes, pendingDemandes, rejectedDemandes];
  }

  prepareRecentActivities(): void {
    const activities: RecentActivity[] = [];

    // Add recent actions
    this.actions.slice(0, 3).forEach(action => {
      activities.push({
        id: action.code,
        title: `Voice Generation: ${action.text.substring(0, 30)}${action.text.length > 30 ? '...' : ''}`,
        subtitle: `Language: ${action.language}`,
        date: this.formatDate(action.dateCreation.toString()),
        icon: 'bi-mic',
        color: 'primary',
        status: this.getActionStatusText(action.statutAction),
        statusColor: this.getActionStatusColor(action.statutAction)
      });
    });

    // Add recent factures
    this.factures.slice(0, 3).forEach(facture => {
      activities.push({
        id: facture.code,
        title: `Invoice Created: ${facture.code}`,
        subtitle: `Amount: ${this.formatCurrency(facture.montant)}`,
        date: this.formatDate(facture.dateEmission.toString()),
        icon: 'bi-receipt',
        color: 'info',
        status: this.getFactureStatusText(facture.statut),
        statusColor: this.getFactureStatusColor(facture.statut),
        amount: this.formatCurrency(facture.montant)
      });
    });

    // Add recent demandes
    this.demandes.slice(0, 3).forEach(demande => {
      activities.push({
        id: demande.code,
        title: `Request: ${demande.titre}`,
        subtitle: `Type: ${this.getDemandeTypeText(demande.type)}`,
        date: this.formatDate(demande.dateCreation.toString()),
        icon: 'bi-file-earmark-text',
        color: 'warning',
        status: this.getDemandeStatusText(demande.statut),
        statusColor: this.getDemandeStatusColor(demande.statut)
      });
    });

    // Add recent transactions
    this.transactions.slice(0, 3).forEach(transaction => {
      const isWithdrawal = transaction.montant < 0;
      activities.push({
        id: transaction.code,
        title: isWithdrawal ? 'Withdrawal' : 'Payment Received',
        subtitle: `Transaction ID: ${transaction.code}`,
        date: this.formatDate(transaction.dateTransaction),
        icon: isWithdrawal ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle',
        color: isWithdrawal ? 'danger' : 'success',
        amount: this.formatCurrency(Math.abs(transaction.montant))
      });
    });

    // Sort by date (newest first)
    activities.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    this.recentActivities = activities.slice(0, 10);
  }

  // Helper methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getActionStatusText(status: string): string {
    switch (status) {
      case 'TERMINEE': return 'Completed';
      case 'EN_COURS': return 'In Progress';
      case 'EN_ATTENTE': return 'Pending';
      default: return status;
    }
  }

  getActionStatusColor(status: string): string {
    switch (status) {
      case 'TERMINEE': return 'success';
      case 'EN_COURS': return 'info';
      case 'EN_ATTENTE': return 'warning';
      default: return 'secondary';
    }
  }

  getFactureStatusText(status: string): string {
    switch (status) {
      case 'PAYEE': return 'Paid';
      case 'EN_ATTENTE': return 'Pending';
      default: return status;
    }
  }

  getFactureStatusColor(status: string): string {
    switch (status) {
      case 'PAYEE': return 'success';
      case 'EN_ATTENTE': return 'warning';
      default: return 'secondary';
    }
  }

  getDemandeStatusText(status: string): string {
    switch (status) {
      case 'APPROUVEE': return 'Approved';
      case 'EN_ATTENTE': return 'Pending';
      case 'REJETEE': return 'Rejected';
      default: return status;
    }
  }

  getDemandeStatusColor(status: string): string {
    switch (status) {
      case 'APPROUVEE': return 'success';
      case 'EN_ATTENTE': return 'warning';
      case 'REJETEE': return 'danger';
      default: return 'secondary';
    }
  }

  getDemandeTypeText(type: string): string {
    switch (type) {
      case 'retrait': return 'Withdrawal';
      case 'support': return 'Support';
      default: return type;
    }
  }

  // UI actions
  exportDashboard(): void {
    console.log("Exporting dashboard...");
    // Implement export functionality
  }
}
