import { Component, OnInit } from '@angular/core';
import { toggleAnimation } from 'src/app/shared/animations';

// Data interfaces
interface Speaker {
  id: string;
  name: string;
  email: string;
  category: string;
  avatarUrl: string;
}

interface Transaction {
  id: string;
  speakerId: string;
  speaker?: Speaker; // For joined data
  date: Date;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  invoiceUrl?: string;
}

interface SpeakerStats {
  speakerId: string;
  speaker?: Speaker; // For joined data
  revenueGenerated: number;
  eventCount: number;
  audienceReach: number;
  growthPercentage: number;
}

interface SummaryStats {
  totalEarnings: number;
  totalEarningsGrowth: number;
  activeSpeakers: number;
  activeSpeakersGrowth: number;
  pendingPayments: number;
  pendingPaymentsGrowth: number;
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.html',
  animations: [toggleAnimation],
   // Create this file if you need custom styles beyond Tailwind
})
export class TransactionsComponent implements OnInit {
  // Active tab tracking
  activeTab: 'transactions' | 'statistics' = 'transactions';

  // Data containers
  transactions: Transaction[] = [];
  topPerformers: SpeakerStats[] = [];
  summaryStats: SummaryStats = {
    totalEarnings: 0,
    totalEarningsGrowth: 0,
    activeSpeakers: 0,
    activeSpeakersGrowth: 0,
    pendingPayments: 0,
    pendingPaymentsGrowth: 0
  };

  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  // Filters
  searchQuery: string = '';
  timeFilter: '30days' | '90days' | '12months' | 'alltime' = '30days';

  // Loading states
  isLoadingTransactions: boolean = false;
  isLoadingStats: boolean = false;

  constructor() { }

  ngOnInit(): void {
    // Load initial data
    this.loadTransactions();
    this.loadSummaryStats();
    this.loadTopPerformers();
  }

  // Tab switching
  setActiveTab(tab: 'transactions' | 'statistics'): void {
    this.activeTab = tab;

    // Load data if needed when switching tabs
    if (tab === 'statistics' && this.topPerformers.length === 0) {
      this.loadTopPerformers();
    }
  }

  // Data loading methods - these would connect to your services
  loadTransactions(): void {
    this.isLoadingTransactions = true;

    // Replace with actual API call
    setTimeout(() => {
      // Placeholder data - will be replaced with API response
      this.transactions = [
        // Your data will be loaded here from the backend
      ];

      this.totalItems = 12; // Example total count from API
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.isLoadingTransactions = false;
    }, 500);
  }

  loadSummaryStats(): void {
    // Replace with actual API call
    setTimeout(() => {
      // Placeholder data - will be replaced with API response
      this.summaryStats = {
        totalEarnings: 42500,
        totalEarningsGrowth: 12.5,
        activeSpeakers: 24,
        activeSpeakersGrowth: 8.3,
        pendingPayments: 8750,
        pendingPaymentsGrowth: -4.2
      };
    }, 500);
  }

  loadTopPerformers(): void {
    this.isLoadingStats = true;

    // Replace with actual API call
    setTimeout(() => {
      // Placeholder data - will be replaced with API response
      this.topPerformers = [
        // Your data will be loaded here from the backend
      ];

      this.isLoadingStats = false;
    }, 500);
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTransactions();
    }
  }

  // Search and filtering
  onSearch(): void {
    this.currentPage = 1; // Reset to first page when searching
    this.loadTransactions();
  }

  onTimeFilterChange(filter: '30days' | '90days' | '12months' | 'alltime'): void {
    this.timeFilter = filter;
    this.loadSummaryStats();
    this.loadTopPerformers();
  }

  // Helper methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // PDF handling
  viewInvoice(transaction: Transaction): void {
    if (transaction.invoiceUrl) {
      window.open(transaction.invoiceUrl, '_blank');
    }
  }
}
