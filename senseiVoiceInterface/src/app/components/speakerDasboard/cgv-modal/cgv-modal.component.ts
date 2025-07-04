import { Component, EventEmitter, Input, Output } from "@angular/core"

@Component({
  selector: "app-cgv-modal",
  template: `
    <div class="cgv-modal" *ngIf="isVisible" (click)="onBackdropClick($event)">
      <div class="cgv-modal-content" (click)="$event.stopPropagation()">
        <div class="cgv-modal-header">
          <h3>{{ 'cgv.title' | translate }}</h3>
          <button class="modal-close-btn" (click)="onClose()">
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <div class="cgv-modal-body">
          <div class="cgv-content">
            <div class="cgv-section">
              <h2>Conditions Générales de Vente (CGV)</h2>
              <p class="cgv-date"><strong>Dernière mise à jour : 2 juillet 2025</strong></p>
              
              <p>Le présent document constitue les conditions générales de vente (ci‑après « CGV ») du site <strong>castingvoixoff.ma</strong> (ci‑après « le Site »), édité par <strong>Sensei Prod SARL‑AU</strong>, société de droit marocain au capital social de 100 000,00 MAD, immatriculée au RC de 339357, dont le siège social est sis 9 Rue Abou Moussa El jazouli, 1er étage, N°1, Maarif, Casablanca, Maroc, (ci‑après « la Société », « nous », « notre »).</p>
              
              <div class="cgv-attention">
                <strong>ATTENTION :</strong> ces CGV peuvent évoluer. La version applicable est celle accessible en ligne au jour de la commande.
              </div>
            </div>

            <div class="cgv-section">
              <h3>1. Définitions</h3>
              <div class="cgv-table">
                <div class="cgv-table-row">
                  <div class="cgv-table-header">Terme</div>
                  <div class="cgv-table-header">Définition</div>
                </div>
                <div class="cgv-table-row">
                  <div class="cgv-table-cell"><strong>Client</strong></div>
                  <div class="cgv-table-cell">Toute personne physique ou morale qui crée un compte et achète des crédits vocaux sur le Site.</div>
                </div>
                <div class="cgv-table-row">
                  <div class="cgv-table-cell"><strong>Speaker</strong></div>
                  <div class="cgv-table-cell">Personne dont la voix est enregistrée ou clonée par la Société et mise à disposition via le Site.</div>
                </div>
                <div class="cgv-table-row">
                  <div class="cgv-table-cell"><strong>Crédit</strong></div>
                  <div class="cgv-table-cell">Unité de facturation exprimée en caractères générés (hors espaces).</div>
                </div>
                <div class="cgv-table-row">
                  <div class="cgv-table-cell"><strong>Voix clonée / TTS</strong></div>
                  <div class="cgv-table-cell">Fichier audio généré par synthèse vocale, à partir d'un texte fourni par le Client, en utilisant l'empreinte vocale d'un Speaker.</div>
                </div>
                <div class="cgv-table-row">
                  <div class="cgv-table-cell"><strong>Commande</strong></div>
                  <div class="cgv-table-cell">Toute demande de génération vocale validée et payée via le Site.</div>
                </div>
                <div class="cgv-table-row">
                  <div class="cgv-table-cell"><strong>Services</strong></div>
                  <div class="cgv-table-cell">Ensemble des prestations proposées par la Société : génération TTS, cloning multilingue, enregistrement studio, options d'exclusivité, etc.</div>
                </div>
              </div>
            </div>

            <div class="cgv-section">
              <h3>2. Objet et champ d'application</h3>
              <p>Les présentes CGV régissent :</p>
              <ul>
                <li>L'accès et l'utilisation du Site ;</li>
                <li>Les modalités d'achat de Crédits et de génération de Voix clonées ;</li>
                <li>Les relations contractuelles entre la Société, les Clients et les Speakers.</li>
              </ul>
              <p>Tout Client déclare avoir pris connaissance et accepté sans réserve les CGV avant toute Commande.</p>
            </div>

            <div class="cgv-section">
              <h3>3. Description des Services</h3>
              <ul>
                <li><strong>Génération instantanée TTS</strong> en plusieurs langues, dont la darija marocaine, à partir de modèles d'IA entraînés par nos soins ou via des API tierces.</li>
                <li><strong>Clonage de voix</strong> sur demande, après validation expresse du Speaker concerné.</li>
                <li><strong>Enregistrement studio</strong> avec un Speaker, sur devis séparé.</li>
                <li><strong>Programme d'affiliation Speaker</strong>, permettant au Speaker de promouvoir sa voix via un lien affilié et de percevoir une commission.</li>
              </ul>
            </div>

            <div class="cgv-section">
              <h3>4. Processus de commande</h3>
              <ol>
                <li><strong>Création de compte.</strong> Le Client renseigne des informations exactes et à jour.</li>
                <li><strong>Essai gratuit.</strong> Chaque nouvelle Voix donne droit à 100 caractères gratuits sans option de téléchargement. Objectif : pré‑écoute avant achat.</li>
                <li><strong>Achat de Crédits.</strong> Le Client sélectionne la Voix, la langue, la quantité de caractères et procède au paiement.</li>
                <li><strong>Validation du texte :</strong> Speakers premium / célébrités : soumission obligatoire du texte pour approbation préalable. La non‑validation entraîne annulation ou modification du texte.</li>
                <li><strong>Génération et livraison.</strong> L'audio est rendu disponible au format .mp3 (ou .wav sur option). Une fois généré et validé, l'audio ne peut plus être modifié ni remboursé, sauf article 9.</li>
              </ol>
            </div>

            <div class="cgv-section">
              <h3>5. Tarifs et facturation</h3>
              <ul>
                <li><strong>Prix par caractère :</strong> fixé par chaque Speaker et validé avec la Société.</li>
                <li>Les prix affichés s'entendent Hors Taxes, la TVA applicable étant ajoutée lors du paiement.</li>
                <li><strong>Sessions studio :</strong> tarif communiqué sur devis, variable selon le Speaker.</li>
                <li><strong>Options d'exclusivité ou de signature :</strong> sur devis, après consultation de la Société et accord du Speaker.</li>
                <li><strong>Frais de service :</strong> un pourcentage est prélevé par la Société sur chaque transaction afin d'assurer l'hébergement, la maintenance et le support.</li>
              </ul>
            </div>

            <div class="cgv-section">
              <h3>6. Paiement</h3>
              <ul>
                <li><strong>Moyens acceptés :</strong> carte bancaire, PayPal, virement bancaire, Wafacash.</li>
                <li><strong>Frais de transfert :</strong> pour les virements/Wafacash, le Client assume les frais d'envoi.</li>
                <li>Les Crédits sont crédités après réception intégrale des fonds.</li>
                <li><strong>Compte prépayé :</strong> le Client peut recharger un solde pour des usages ultérieurs.</li>
                <li><strong>Sécurité :</strong> les paiements par carte sont traités via une passerelle certifiée PCI‑DSS.</li>
              </ul>
            </div>

            <div class="cgv-section">
              <h3>8. Engagements et obligations du Client</h3>
              <ul>
                <li><strong>Usage éthique :</strong> interdiction absolue d'utiliser les Voix clonées pour des contenus offensants, illégaux, diffamatoires, pornographiques, discriminatoires ou trompeurs.</li>
                <li><strong>Conformité texte :</strong> le Client garantit que le texte soumis ne viole aucun droit de tiers et respecte la législation marocaine.</li>
                <li><strong>Respect des instructions darija :</strong> le Client suit les guidelines fournies pour obtenir une qualité optimale.</li>
                <li><strong>Interdiction de rétro‑ingénierie :</strong> il est prohibé de tenter d'extraire ou de ré‑entraîner nos modèles à partir des audios générés.</li>
              </ul>
            </div>

            <div class="cgv-section">
              <h3>9. Absence de droit de rétractation – Politique de remboursement</h3>
              <p>Conformément à l'article ___ de la loi 31‑08 sur la protection du consommateur, les produits numériques personnalisés ne bénéficient pas du droit de rétractation.</p>
              <p><strong>Remboursement unique :</strong> uniquement si le fichier audio livré est inutilisable en raison d'un défaut technique imputable à la Société (bruit excessif, fichier corrompu).</p>
              <p>Le Client doit signaler le défaut sous 48 heures suivant la livraison. La Société pourra : (a) régénérer l'audio sans frais ; ou (b) procéder au remboursement des Crédits concernés.</p>
            </div>

            <div class="cgv-section">
              <h3>15. Droit applicable et juridiction compétente</h3>
              <p>Les CGV sont soumises au droit marocain.</p>
              <p>Tout litige sera porté devant les tribunaux compétents de Casablanca, sauf compétence exclusive d'une autre juridiction.</p>
            </div>

            <div class="cgv-section">
              <h3>16. Contact</h3>
              <p>Pour toute question concernant les CGV, veuillez nous écrire à : <strong>legal@castingvoixoff.ma</strong>.</p>
              <p class="cgv-footer">© 2025 Sensei Prod SARL‑AU. Tous droits réservés.</p>
            </div>
          </div>
        </div>
        
        <div class="cgv-modal-footer">
          <div class="cgv-acceptance">
            <label class="cgv-checkbox-label">
              <input type="checkbox" 
                     class="cgv-checkbox" 
                     [(ngModel)]="hasAccepted"
                     (change)="onAcceptanceChange($event)">
              <span class="cgv-checkmark"></span>
              <span class="cgv-acceptance-text">
                {{ 'cgv.acceptanceText' | translate }}
              </span>
            </label>
          </div>
          <div class="cgv-actions">
            <button class="btn-secondary" (click)="onClose()">
              {{ 'cgv.decline' | translate }}
            </button>
            <button class="btn-primary" 
                    [disabled]="!hasAccepted"
                    (click)="onAccept()">
              <i class="bi bi-check-circle me-1"></i>
              {{ 'cgv.acceptAndContinue' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./cgv-modal.component.css"],
})
export class CgvModalComponent {
  @Input() isVisible = false
  @Output() accepted = new EventEmitter<boolean>()
  @Output() closed = new EventEmitter<void>()

  hasAccepted = false

  onAcceptanceChange(event: any) {
    this.hasAccepted = event.target.checked
  }

  onAccept() {
    if (this.hasAccepted) {
      this.accepted.emit(true)
    }
  }

  onClose() {
    this.hasAccepted = false
    this.closed.emit()
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose()
    }
  }
}
