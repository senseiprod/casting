import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpBackend, HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

//Routes
import { routes } from './app.route';

import { AppComponent } from './app.component';

// store
import { StoreModule } from '@ngrx/store';
import { indexReducer } from './store/index.reducer';

// shared module
import { SharedModule } from 'src/shared.module';

// i18n
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// AOT compilation support
export function HttpLoaderFactory(httpHandler: HttpBackend): TranslateHttpLoader {
    return new TranslateHttpLoader(new HttpClient(httpHandler));
}

// dashboard
import { IndexComponent } from './index';
import { AnalyticsComponent } from './analytics';
import { FinanceComponent } from './finance';
import { CryptoComponent } from './crypto';

// widgets
import { WidgetsComponent } from './widgets';

// tables
import { TablesComponent } from './tables';

// font-icons
import { FontIconsComponent } from './font-icons';

// charts
import { ChartsComponent } from './charts';


import { ClientOrdersComponent } from './apps/clientOrders';

import { CalendarComponent } from './apps/reservationCalendar';

// dragndrop
import { DragndropComponent } from './dragndrop';

// pages
import { KnowledgeBaseComponent } from './pages/knowledge-base';
import { FaqComponent } from './pages/faq';

// Layouts
import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth-layout';

import { HeaderComponent } from './layouts/header';
import { FooterComponent } from './layouts/footer';
import { SidebarComponent } from './layouts/sidebar';
import { ThemeCustomizerComponent } from './layouts/theme-customizer';
import { CreateVoiceComponent } from './apps/voice';
import { AudioComponent } from './apps/audio';
import { RequestComponent } from './apps/request';
import { RecordRequestComponent } from './apps/recordRequest';
import { SpeakerCalendarComponent } from './apps/speakerCalendar';
import { SharedVoicesComponent } from './apps/PremadeVoices';
import { CombinedVoicesComponent } from './apps/CombinedVoices';
import { PaymentComponent } from './apps/payment';
import { TransactionsComponent } from './apps/transactions';
import { UnauthorizedComponent } from './service/Unauthorized';
import { GenAudioComponent } from './apps/genaudios';
import { ToastrModule } from 'ngx-toastr';
import { AuthInterceptor } from './service/auth.interceptor';



@NgModule({
    imports: [
        RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpBackend],
            },
        }),
        StoreModule.forRoot({ index: indexReducer }),
        SharedModule.forRoot(),
        ToastrModule.forRoot(),
    ],
    declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        SidebarComponent,
        ThemeCustomizerComponent,
        TablesComponent,
        FontIconsComponent,
        ChartsComponent,
        IndexComponent,
        AnalyticsComponent,
        FinanceComponent,
        CryptoComponent,
        WidgetsComponent,
        DragndropComponent,
        AppLayout,
        AuthLayout,
        KnowledgeBaseComponent,
        FaqComponent,
        CreateVoiceComponent,
        AudioComponent,
        RequestComponent,
        RecordRequestComponent,
        PaymentComponent,
        GenAudioComponent,
        TransactionsComponent,
        SharedVoicesComponent,
        ClientOrdersComponent,
        CombinedVoicesComponent,
        CalendarComponent,
        SpeakerCalendarComponent,
        UnauthorizedComponent,

    ],

    schemas: [CUSTOM_ELEMENTS_SCHEMA],

    providers: [Title,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
          }
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
