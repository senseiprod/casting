import { Routes } from '@angular/router';

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

// dragndrop
import { DragndropComponent } from './dragndrop';

// layouts
import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth-layout';

// pages
import { KnowledgeBaseComponent } from './pages/knowledge-base';
import { FaqComponent } from './pages/faq';
import { CreateVoiceComponent } from './apps/voice';
import { AudioComponent } from './apps/audio';
import { RequestComponent } from './apps/request';
import { PaymentComponent } from './apps/payment';
import { GenAudioComponent } from './apps/genaudios';
import { UnauthorizedComponent } from './service/Unauthorized';
import { TransactionsComponent } from './apps/transactions';
import { SharedVoicesComponent } from './apps/PremadeVoices';
import { CombinedVoicesComponent } from './apps/CombinedVoices';
import { CalendarComponent } from './apps/reservationCalendar';
import { SpeakerCalendarComponent } from './apps/speakerCalendar';
import { ClientOrdersComponent } from './apps/clientOrders';
import { RecordRequestComponent } from './apps/recordRequest';
import { AuthGuard } from './service/AuthGuard';


export const routes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [

            {
                path: 'unauthorized',
                component: UnauthorizedComponent
              },
            // dashboard
            { path: '', component: IndexComponent, data: { title: 'Sales Admin' } },
            { path: 'analytics', component: AnalyticsComponent, data: { title: 'Analytics Admin' } },
            { path: 'finance', component: FinanceComponent, data: { title: 'Finance Admin' } },
            { path: 'crypto', component: CryptoComponent, data: { title: 'Crypto Admin' } },

            // widgets
            { path: 'widgets', component: WidgetsComponent, data: { title: 'Widgets' } },

            // font-icons
            { path: 'font-icons', component: FontIconsComponent, data: { title: 'Font Icons' } },

            // charts
            { path: 'charts', component: ChartsComponent, data: { title: 'Charts' } },


            // voice
            {
                path: 'apps/voice',
                component: CreateVoiceComponent,
                data: { title: 'Voice' }
            },





            // audio
            {
                path: 'apps/audio',
                component: AudioComponent,
                data: { title: 'Audio' }
            },



            {
                path: 'apps/genaudios',
                component: GenAudioComponent,
                data: { title: 'Generated audios' }
            },


             // audio
             {
                path: 'apps/transactions',
                component: TransactionsComponent,
                data: { title: 'Transactions' }
            },

             //to speaker request
             {
                path: 'apps/request',
                component: RequestComponent,
                data: { title: 'Speaker account request' }
            },


             //speaker record request
             {
                path: 'apps/recordRequest',
                component: RecordRequestComponent,
                data: { title: 'Speaker record request' }
            },


             //to speaker request
             {
                path: 'apps/payment',
                component: PaymentComponent,
                data: { title: 'Speaker Payment request ' }
            },

            //premade voices
            {
                path: 'apps/PremadeVoices',
                component: SharedVoicesComponent,
                data: { title: 'Premade Voices ' }
            },


            //premade voices
            {
                path: 'apps/CombinedVoices',
                component: CombinedVoicesComponent,
                data: { title: 'Combined Voices ' }
            },

            //client orders
            {
                path: 'apps/clientOrders',
                component: ClientOrdersComponent,
                data: { title: 'Client Orders ' }
            },


            //Studio calendar
            {
                path: 'apps/reservationCalendar',
                component: CalendarComponent,
                data: { title: 'Calendar reservation' }
            },


             //Speaker calendar
             {
                path: 'apps/speakerCalendar',
                component: SpeakerCalendarComponent,
                data: { title: 'Calendar reservation' }
            },


            // dragndrop
            { path: 'dragndrop', component: DragndropComponent, data: { title: 'Dragndrop' } },

            // pages
            { path: 'pages/knowledge-base', component: KnowledgeBaseComponent, data: { title: 'Knowledge Base' } },
            { path: 'pages/faq', component: FaqComponent, data: { title: 'FAQ' } },

            //apps
            { path: '', loadChildren: () => import('./apps/apps.module').then((d) => d.AppsModule) },

            // components
            { path: '', loadChildren: () => import('./components/components.module').then((d) => d.ComponentsModule) },

            // elements
            { path: '', loadChildren: () => import('./elements/elements.module').then((d) => d.ElementsModule) },

            // forms
            { path: '', loadChildren: () => import('./forms/form.module').then((d) => d.FormModule) },

            // users
            { path: '', loadChildren: () => import('./users/user.module').then((d) => d.UsersModule) },

            // tables
            { path: 'tables', component: TablesComponent, data: { title: 'Tables' } },
            { path: '', loadChildren: () => import('./datatables/datatables.module').then((d) => d.DatatablesModule) },
        ],
    },

    {
        path: '',
        component: AuthLayout,
        children: [
            // pages
            //{ path: '', loadChildren: () => import('./pages/pages.module').then((d) => d.PagesModule) },

            // auth
            { path: '', loadChildren: () => import('./auth/auth.module').then((d) => d.AuthModule) },
        ],
    },
];
