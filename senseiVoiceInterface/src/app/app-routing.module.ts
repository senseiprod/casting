import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from "./components/mainSite/home/home.component";
import { ActorsComponent } from "./components/mainSite/actors/actors.component";
import { AboutComponent } from "./components/mainSite/about/about.component";
import { VoicesComponent } from "./components/mainSite/voices/voices.component";
import { ContactComponent } from "./components/mainSite/contact/contact.component";
import { SpeakerDetailsComponent } from "./components/mainSite/speaker-details/speaker-details.component";
import { SpeechGenerationComponent } from "./components/mainSite/speech-generation/speech-generation.component";
import { ErrorComponent } from "./components/mainSite/error/error.component";
import { LoginComponent } from "./components/login/login.component";
import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";
import { GenerationWithLanguageComponent } from "./components/mainSite/generation-with-language/generation-with-language.component";
import { GenerationWithSpeakerComponent } from "./components/mainSite/generation-with-speaker/generation-with-speaker.component";
import { ListWithSlectedLanguageComponent } from "./components/mainSite/list-with-slected-language/list-with-slected-language.component";
import { MainRouterComponent } from "./components/speakerDasboard/main-router/main-router.component";
import { DemandeComponent } from "./components/speakerDasboard/demande/demande.component";
import { GenerationRequestComponent } from "./components/speakerDasboard/generation-request/generation-request.component";
import { BanckComponent } from "./components/speakerDasboard/banck/banck.component";
import { ProfilComponent } from "./components/speakerDasboard/profil/profil.component";
import { RegisterComponent } from "./components/register/register.component";
import { GenerationComponent } from './components/speakerDasboard/generation/generation.component';
import { FooterComponent } from './components/mainSite/footer/footer.component';
import {AuthGuard} from "./guards/auth.guard";
import {GuestGuard} from "./guards/guest.guard";
import {HumainVoiceComponent} from "./components/mainSite/humain-voice/humain-voice.component";
import {
  GenerateWithSlectedVoiceComponent
} from "./components/speakerDasboard/generate-with-slected-voice/generate-with-slected-voice.component";import {
  GenerateWithVoiceSpeakerComponent
} from "./components/speakerDasboard/generate-with-voice-speaker/generate-with-voice-speaker.component";
import { PaymentSuccessComponent } from './components/speakerDasboard/payment-success/payment-success.component';
import { PaymentFailedComponent } from './components/speakerDasboard/payment-failed/payment-failed.component';
import { SuccessBalanceChargeComponent } from './components/speakerDasboard/success-balance-charge/success-balance-charge.component';
import { ConditionsGeneralesVenteComponentComponent } from './components/mainSite/conditions-generales-vente-component/conditions-generales-vente-component.component';
import { Register2Component} from './components/register2/register2.component';
import { Register3Component} from './components/register3/register3.component';





const routes: Routes = [

  { path: '', component: SpeechGenerationComponent ,
     children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'actors', component: ActorsComponent ,canActivate: [AuthGuard],},
      { path: 'about', component: AboutComponent },
      { path: 'voices', component: VoicesComponent,canActivate: [AuthGuard], },
      { path: 'contact', component: ContactComponent },
      { path: 'speaker-details/:uuid', component: SpeakerDetailsComponent,canActivate: [AuthGuard], }, { path: 'checkout', component: FooterComponent }, { path: 'profile', component: ProfilComponent },
      { path: 'error', component: ErrorComponent },
      { path: 'studio', component: GenerationWithLanguageComponent },
      { path: 'humain-voices', component: HumainVoiceComponent ,canActivate: [AuthGuard],},
       { path: 'voice-ai', component: GenerationWithSpeakerComponent ,canActivate: [AuthGuard],},
       { path: 'filter-by-language/:language', component: ListWithSlectedLanguageComponent ,canActivate: [AuthGuard],},
       { path: 'condition-of-sale', component: ConditionsGeneralesVenteComponentComponent },

     ]},

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'signup',
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  { path: 'signup2', component: Register2Component },

  { path: 'signup3', component: Register3Component },

    {
    path: 'reset',
    component: ResetPasswordComponent,
    canActivate: [GuestGuard]
  },
  // Dashboard sécurisé
  {
    path: 'speakerDasboard/:uuid',
    component: MainRouterComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: GenerationComponent, pathMatch: 'full' },
      { path: 'demande', component: DemandeComponent },
      { path: 'demande-generation', component: GenerationRequestComponent },
      { path: 'requests', component: BanckComponent },
      { path: 'profile', component: ProfilComponent },
      { path: 'generate', component: GenerationComponent },
      { path: 'generate-with-selected-voice/:voice_id/:voice_name/:voice_photo/:voice_gender/:voice_age/:voice_category/:voice_language/:voice_preview_url', component: GenerateWithSlectedVoiceComponent },
      { path: 'generate-with-speaker-voice/:uuid', component: GenerateWithVoiceSpeakerComponent },
      { path: 'payment-success/:uuid', component: PaymentSuccessComponent },
      { path: 'payment-failed', component: PaymentFailedComponent },
      { path: 'charge-success/:amount/:newBalance', component: SuccessBalanceChargeComponent },

      
    ]
  },

  { path: '**', redirectTo: '/error' } // Redirection vers une page d'erreur si la route est inconnue
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
