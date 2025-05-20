import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-statistics',
  templateUrl: 'clientOrders.html',

})
export class ClientOrdersComponent implements OnInit {
  // Placeholder statistics data
  statistics = {
    testsGratuits: 0,
    commandesEffectuees: 0,
    abandonsPaiement: 0
  };

  // Chart data for tests
  chartData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Tests Gratuits',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(206, 9, 28, 0.6)',
        borderColor: '#ce091c',
        borderWidth: 2
      },
      {
        label: 'Commandes',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(160, 7, 22, 0.6)',
        borderColor: '#a00716',
        borderWidth: 2
      }
    ]
  };

  constructor() { }

  ngOnInit(): void {
    // You would typically fetch real data here from your backend
  }

  // Methods to get total counts (these would eventually connect to real data)
  getTotalTestsGratuits(): number {
    return this.statistics.testsGratuits;
  }

  getTotalCommandes(): number {
    return this.statistics.commandesEffectuees;
  }

  getTotalAbandons(): number {
    return this.statistics.abandonsPaiement;
  }

  // Method to calculate conversion rate
  getConversionRate(): string {
    if (this.statistics.testsGratuits === 0) return '0%';
    const rate = (this.statistics.commandesEffectuees / this.statistics.testsGratuits) * 100;
    return rate.toFixed(1) + '%';
  }

  // Method to calculate abandonment rate
  getAbandonmentRate(): string {
    const totalAttempts = this.statistics.commandesEffectuees + this.statistics.abandonsPaiement;
    if (totalAttempts === 0) return '0%';
    const rate = (this.statistics.abandonsPaiement / totalAttempts) * 100;
    return rate.toFixed(1) + '%';
  }
}
