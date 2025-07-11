import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/mainSite/home/home.component';
import { AboutComponent } from './components/mainSite/about/about.component';
import { ContactComponent } from './components/mainSite/contact/contact.component';
import { VoicesComponent } from './components/mainSite/voices/voices.component';
import { ActorsComponent } from './components/mainSite/actors/actors.component';
import { HeaderComponent } from './components/mainSite/header/header.component';
import { FooterComponent } from './components/mainSite/footer/footer.component';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from "@angular/common/http";
import { SpeakerDetailsComponent } from './components/mainSite/speaker-details/speaker-details.component';
import { SpeechGenerationComponent } from './components/mainSite/speech-generation/speech-generation.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { CheckoutComponent } from './components/mainSite/checkout/checkout.component';
import { ErrorComponent } from './components/mainSite/error/error.component';
import { LoginComponent } from './components/login/login.component';
import { GenerationWithLanguageComponent } from './components/mainSite/generation-with-language/generation-with-language.component';
import { GenerationWithSpeakerComponent } from './components/mainSite/generation-with-speaker/generation-with-speaker.component';
import {NgOptimizedImage} from "@angular/common";
import { DashboardComponent } from './components/speakerDasboard/dashboard/dashboard.component';
import { DemandeComponent } from './components/speakerDasboard/demande/demande.component';
import { BanckComponent } from './components/speakerDasboard/banck/banck.component';
import { ProfilComponent } from './components/speakerDasboard/profil/profil.component';
import { SideBarComponent } from './components/speakerDasboard/side-bar/side-bar.component';
import { MenuComponent } from './components/speakerDasboard/menu/menu.component';
import { MainRouterComponent } from './components/speakerDasboard/main-router/main-router.component';
import { GenerationRequestComponent } from './components/speakerDasboard/generation-request/generation-request.component';
import { RequestDetailsComponent } from './components/speakerDasboard/request-details/request-details.component';
import {NgxPaginationModule} from "ngx-pagination";
import { RegisterComponent } from './components/register/register.component';
import {AuthInterceptor} from "./interceptors/auth.interceptor";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { GenerationComponent } from './components/speakerDasboard/generation/generation.component';
import { CommonModule } from "@angular/common";
import {AuthGuard} from "./guards/auth.guard";
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import {TranslateLoader, TranslateModule, TranslatePipe} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import { HumainVoiceComponent } from './components/mainSite/humain-voice/humain-voice.component';
import { GenerateWithSlectedVoiceComponent } from './components/speakerDasboard/generate-with-slected-voice/generate-with-slected-voice.component';

import { ReservationModalComponent } from './components/mainSite/reservation-modal/reservation-modal.component';
import { GenerateWithVoiceSpeakerComponent } from './components/speakerDasboard/generate-with-voice-speaker/generate-with-voice-speaker.component';
import { BookingComponent } from './components/mainSite/booking/booking.component';
import { FooterHomeComponent } from './components/mainSite/footer-home/footer-home.component';
import { ListWithSlectedLanguageComponent } from './components/mainSite/list-with-slected-language/list-with-slected-language.component';
import { DeleteAccountComponent } from './components/speakerDasboard/delete-account/delete-account.component';
import { PaymentSuccessComponent } from './components/speakerDasboard/payment-success/payment-success.component';
import { PaymentFailedComponent } from './components/speakerDasboard/payment-failed/payment-failed.component';
import { SuccessBalanceChargeComponent } from './components/speakerDasboard/success-balance-charge/success-balance-charge.component';
import { ConditionsGeneralesVenteComponentComponent } from './components/mainSite/conditions-generales-vente-component/conditions-generales-vente-component.component';
import { CgvModalComponent } from './components/speakerDasboard/cgv-modal/cgv-modal.component';
import { Register2Component } from './components/register2/register2.component';
import { Register3Component } from './components/register3/register3.component';
import { NotificationComponent } from './components/speakerDasboard/notification/notification.component';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
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
    LoginComponent,
    GenerationWithLanguageComponent,
    GenerationWithSpeakerComponent,
    DashboardComponent,
    DemandeComponent,
    BanckComponent,
    ProfilComponent,
    SideBarComponent,
    MenuComponent,
    MainRouterComponent,
    GenerationRequestComponent,
    RequestDetailsComponent,
    RegisterComponent,
    GenerationComponent,
    ResetPasswordComponent,
    HumainVoiceComponent,
    GenerateWithSlectedVoiceComponent,
    DeleteAccountComponent,
    ReservationModalComponent,
    GenerateWithVoiceSpeakerComponent,
    BookingComponent,
    FooterHomeComponent,
    ListWithSlectedLanguageComponent,
    PaymentSuccessComponent,
    PaymentFailedComponent,
    SuccessBalanceChargeComponent,
    ConditionsGeneralesVenteComponentComponent,
    CgvModalComponent,
    Register2Component,
    Register3Component,
    NotificationComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        NgOptimizedImage,
        BrowserAnimationsModule,
        NgxPaginationModule,
        CommonModule,
          TranslateModule.forRoot({
      defaultLanguage: 'en',
            loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
    ],
  providers: [
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }



