import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxPaginationModule } from 'ngx-pagination';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgOptimizedImage } from '@angular/common';

// Import all components
import { AppComponent } from './app.component';
// Main site components
import { HomeComponent } from './components/mainSite/home/home.component';
import { AboutComponent } from './components/mainSite/about/about.component';
import { ContactComponent } from './components/mainSite/contact/contact.component';
import { VoicesComponent } from './components/mainSite/voices/voices.component';
import { ActorsComponent } from './components/mainSite/actors/actors.component';
import { HeaderComponent } from './components/mainSite/header/header.component';
import { FooterComponent } from './components/mainSite/footer/footer.component';
import { SpeakerDetailsComponent } from './components/mainSite/speaker-details/speaker-details.component';
import { SpeechGenerationComponent } from './components/mainSite/speech-generation/speech-generation.component';
import { CheckoutComponent } from './components/mainSite/checkout/checkout.component';
import { ErrorComponent } from './components/mainSite/error/error.component';
import { GenerationWithLanguageComponent } from './components/mainSite/generation-with-language/generation-with-language.component';
import { GenerationWithSpeakerComponent } from './components/mainSite/generation-with-speaker/generation-with-speaker.component';
import { HumainVoiceComponent } from './components/mainSite/humain-voice/humain-voice.component';
import { ReservationModalComponent } from './components/mainSite/reservation-modal/reservation-modal.component';
import { BookingComponent } from './components/mainSite/booking/booking.component';
import { FooterHomeComponent } from './components/mainSite/footer-home/footer-home.component';
import { ListWithSlectedLanguageComponent } from './components/mainSite/list-with-slected-language/list-with-slected-language.component';

// Auth components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

// Speaker dashboard components
import { DashboardComponent } from './components/speakerDasboard/dashboard/dashboard.component';
import { DemandeComponent } from './components/speakerDasboard/demande/demande.component';
import { BanckComponent } from './components/speakerDasboard/banck/banck.component';
import { ProfilComponent } from './components/speakerDasboard/profil/profil.component';
import { SideBarComponent } from './components/speakerDasboard/side-bar/side-bar.component';
import { MenuComponent } from './components/speakerDasboard/menu/menu.component';
import { MainRouterComponent } from './components/speakerDasboard/main-router/main-router.component';
import { GenerationRequestComponent } from './components/speakerDasboard/generation-request/generation-request.component';
import { RequestDetailsComponent } from './components/speakerDasboard/request-details/request-details.component';
import { GenerationComponent } from './components/speakerDasboard/generation/generation.component';
import { GenerateWithSlectedVoiceComponent } from './components/speakerDasboard/generate-with-slected-voice/generate-with-slected-voice.component';
import { DeleteAccountComponent } from './components/speakerDasboard/delete-account/delete-account.component';
import { GenerateWithVoiceSpeakerComponent } from './components/speakerDasboard/generate-with-voice-speaker/generate-with-voice-speaker.component';

// Guards and interceptors
import { AuthGuard } from './guards/auth.guard';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    // Main site components
    HomeComponent,
    AboutComponent,
    ContactComponent,
    VoicesComponent,
    ActorsComponent,
    HeaderComponent,
    FooterComponent,
    SpeakerDetailsComponent,
    SpeechGenerationComponent,
    CheckoutComponent,
    ErrorComponent,
    GenerationWithLanguageComponent,
    GenerationWithSpeakerComponent,
    HumainVoiceComponent,
    ReservationModalComponent,
    BookingComponent,
    FooterHomeComponent,
    ListWithSlectedLanguageComponent,

    // Auth components
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,

    // Speaker dashboard components
    DashboardComponent,
    DemandeComponent,
    BanckComponent,
    ProfilComponent,
    SideBarComponent,
    MenuComponent,
    MainRouterComponent,
    GenerationRequestComponent,
    RequestDetailsComponent,
    GenerationComponent,
    GenerateWithSlectedVoiceComponent,
    DeleteAccountComponent,
    GenerateWithVoiceSpeakerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    NgxPaginationModule,
    BrowserAnimationsModule,
    NgOptimizedImage,
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'voices', component: VoicesComponent },
      { path: 'actors', component: ActorsComponent },
      { path: 'speaker/:id', component: SpeakerDetailsComponent },
      { path: 'generation', component: SpeechGenerationComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'generation-language/:id', component: GenerationWithLanguageComponent },
      { path: 'generation-speaker/:id', component: GenerationWithSpeakerComponent },
      { path: 'human-voice', component: HumainVoiceComponent },
      { path: 'booking', component: BookingComponent },
      { path: 'language/:id', component: ListWithSlectedLanguageComponent },

      // Speaker dashboard routes
      { path: 'dashboard', component: MainRouterComponent, canActivate: [AuthGuard] },
      { path: 'dashboard/profile', component: ProfilComponent, canActivate: [AuthGuard] },
      { path: 'dashboard/bank', component: BanckComponent, canActivate: [AuthGuard] },
      { path: 'dashboard/requests', component: DemandeComponent, canActivate: [AuthGuard] },
      { path: 'dashboard/request/:id', component: RequestDetailsComponent, canActivate: [AuthGuard] },
      { path: 'dashboard/generation', component: GenerationComponent, canActivate: [AuthGuard] },
      { path: 'dashboard/voice/:id', component: GenerateWithSlectedVoiceComponent, canActivate: [AuthGuard] },
      { path: 'dashboard/voice-speaker/:id', component: GenerateWithVoiceSpeakerComponent, canActivate: [AuthGuard] },
      { path: 'dashboard/delete-account', component: DeleteAccountComponent, canActivate: [AuthGuard] },

      // Error route
      { path: '**', component: ErrorComponent }
    ]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      defaultLanguage: 'en'
    })
  ],
  providers: [
    AuthGuard
    // Note: HTTP_INTERCEPTORS was removed as it wasn't fully defined in the original
    // If you need to add it back, use:
    // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
