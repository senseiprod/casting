import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RequestsComponent } from './components/requests/requests.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { HeaderComponent } from './components/header/header.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { EarningComponent } from './components/earning/earning.component';
import { ProfileComponent } from './components/profile/profile.component';
import { InovoiceComponent } from './components/inovoice/inovoice.component';
import { SettingComponent } from './components/setting/setting.component';
import { ActivityLogsComponent } from './components/activity-logs/activity-logs.component';
import {ScheduleComponent } from './components/shedule/shedule.component';
import { LoginComponent } from './components/login/login.component';
import { SpeakerDashboardComponent } from './components/speaker-dashboard/speaker-dashboard.component';
import {TranslateLoader, TranslateModule, TranslatePipe} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import { ActionComponent } from './components/action/action.component';
import { MainRouterComponent } from './components/main-router/main-router.component';
import { DeleteAccountFormComponent } from './components/delete-account-form/delete-account-form.component';
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    RequestsComponent,
    SideBarComponent,
    HeaderComponent,
    EarningComponent,
    ProfileComponent,
    InovoiceComponent,
    SettingComponent,
    ActivityLogsComponent,
    ScheduleComponent,
    LoginComponent,
    SpeakerDashboardComponent,
    ActionComponent,
    MainRouterComponent,
    DeleteAccountFormComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
