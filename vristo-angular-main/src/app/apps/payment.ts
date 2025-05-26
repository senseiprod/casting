import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../app/service/payment.service';
import { toggleAnimation } from 'src/app/shared/animations';
import { RequestService } from '../../app/service/request.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, tap } from 'rxjs';
import { FactureService } from '../service/facture.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

interface DemandeResponse {
  utilisateurUuid: string;
  titre: string;
  description: string;
  type: string;
  uuid: string;
  factureId: number;
  // Add other expected properties
}

interface FactureResponse {
    uuid: string;
    code: number;
    dateEmission: string; // Assuming it's a string, adjust the type if needed
    datePaiement: string; // Assuming it's a string, adjust the type if needed
    montant: number;
    statut: string;
    speakerUuid: string;
    factureId: number;
    pdfData: string;
    // Add other expected properties
  }

@Component({
  selector: 'app-payment-speaker-requests',
  templateUrl: 'payment.html',
  animations: [toggleAnimation],
})
export class PaymentComponent implements OnInit {
  demandes: DemandeResponse[] = [];
  factures: FactureResponse[] = []; // Array to hold facture data
  speakers: { [key: string]: string } = {}; // Object to hold speaker names by UUID
  isLoading = true; // Flag to show loading state
  pdfUrls: { [key: number]: SafeResourceUrl } = {};
   private baseUrl = environment.apiUrl;


  constructor(
    private paymentService: PaymentService,
    private requestService: RequestService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private factureService: FactureService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  // Method to fetch payments from the service
  loadPayments(): void {
    this.paymentService.getPayments().subscribe({
      next: (data: DemandeResponse[]) => {
        this.demandes = data.filter(demande => demande.type === 'RETRAIT');
        this.fetchSpeakers();


        console.log('Payments loaded:', this.demandes);
      },
      error: (error) => {
        console.error('Error fetching demandes:', error);
      }
    });
  }

  openPdfInNewTab(factureId: number): void {
    // First, get the facture details which includes the UUID
    this.factureService.getFactureById(factureId).subscribe(
      (facture: FactureResponse) => {
        console.log('Facture loaded:', facture);

        // Now use the UUID from the facture to download the PDF
        this.factureService.getFacturePdf(facture.uuid).subscribe(
          (pdfBlob: Blob) => {
            // Create blob URL with the correct MIME type
            const pdfUrl = URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
            this.pdfUrls[factureId] = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
            window.open(pdfUrl, '_blank');
          },
          (error: any) => console.error('Error fetching PDF:', error)
        );
      },
      (error) => {
        console.error('Error fetching facture details:', error);
      }
    );
  }

  loadFacturePdf(factureId: number): void {

    this.factureService.getFactureById(factureId).subscribe(
      (facture: FactureResponse) => {

        console.log('Facture loaded:', facture);
      }
    );

    this.factureService.getFacturePdf(factureId.toString()).subscribe(
      (pdfBlob: Blob) => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        this.pdfUrls[factureId] = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
      },
      (error: any) => console.error('Error fetching PDF:', error)
    );
  }


  fetchSpeakers(): void {
    this.demandes.forEach((demande) => {
      this.requestService.getSpeakerByUuid(demande.utilisateurUuid).subscribe(
        (speaker: { nom: string }) => {
          this.speakers[demande.utilisateurUuid] = speaker.nom;
        },
        (error: any) => {
          console.error(`Error fetching speaker for UUID ${demande.utilisateurUuid}`, error);
        }
      );
    });
    this.isLoading = false; // Set loading to false after fetching speakers
  }

  validatePayment(uuid: string, status: string): void {
    const payoutUrl = `${this.baseUrl}/payment/payout`;

    // Convert numeric values to strings as required by the backend
    const params = new HttpParams()
      .set('recipientEmail', 'sb-nqm43f38414845@personal.example.com')
      .set('amount', '300')
      .set('currency', 'USD')
      .set('note', 'validated payment admin casting voix off request')
      .set('senderUuid', 'd616c0360ca4aef2141cede9f700bc7e91810d432186a22561f715ed71870362');

    console.log('Sending payout request with params:', params.toString());

    // First make the payout request with full error response
    this.http.post(payoutUrl, null, {
      params,
      observe: 'response',
      responseType: 'text'
    }).subscribe(
      (response) => {
        console.log('Payout successful:', response.body);

        // After successful payout, update the request status
        const updateUrl = `${this.baseUrl}/api/demandes/update/${uuid}?status=${status}`;

        this.http.put(updateUrl, null).subscribe(
          () => {
            console.log('Status updated successfully');
            this.loadPayments(); // Reload the payments to reflect changes
          },
          (updateError) => {
            console.error('Error updating status:', updateError);
          }
        );
      },
      (error) => {
        console.error('Error processing payout. Status:', error.status);
        console.error('Error details:', error.error);

        // Try to get more detailed error information
        if (error.error) {
          try {
            // Check if the error is a JSON string
            const errorDetails = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
            console.error('Parsed error details:', errorDetails);
          } catch (e) {
            console.error('Error response (raw):', error.error);
          }
        }
      }
    );
  }

   loadDemandes(): void {
    this.http.get<DemandeResponse[]>(`${this.baseUrl}/api/demandes/en-attente`)
      .subscribe(
        (response) => {
          this.demandes = response;
          console.log('Demandes loaded:', this.demandes);
        },
        (error) => {
          console.error('Error loading demandes:', error);
        }
      );
  }

  refusePayment() {
    console.log('Payment refused');
  }
}
