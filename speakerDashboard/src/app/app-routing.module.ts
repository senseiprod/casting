import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {RequestsComponent} from "./components/requests/requests.component";
import {EarningComponent} from "./components/earning/earning.component";
import {ProfilComponent} from "./components/profil/profil.component";
import {InovoiceComponent} from "./components/inovoice/inovoice.component";
import {SettingComponent} from "./components/setting/setting.component";
import {ActivityLogsComponent} from "./components/activity-logs/activity-logs.component";
import {ScheduleComponent} from "./components/shedule/shedule.component";
import {LoginComponent} from "./components/login/login.component";
import {AuthGuard} from "./guards/auth.guard";
import {GuestGuard} from "./guards/guest.guard";
import {ActionComponent} from "./components/action/action.component";
import {MainRouterComponent} from "./components/main-router/main-router.component";
import { SupportHelpComponent } from './components/support-help/support-help.component';

const routes: Routes = [     { path: '', component: MainRouterComponent ,
children :[
                          { path: '', component: DashboardComponent, pathMatch: 'full' ,canActivate: [AuthGuard]},
                          { path: 'earning', component: EarningComponent ,canActivate: [AuthGuard]},
                          { path: 'request', component: RequestsComponent ,canActivate: [AuthGuard]},
                          { path: 'profile', component: ProfilComponent ,canActivate: [AuthGuard]},
                          { path: 'invoice', component: InovoiceComponent ,canActivate: [AuthGuard]},
                          { path: 'setting', component: SettingComponent ,canActivate: [AuthGuard]},
                          { path: 'logs', component: ActivityLogsComponent ,canActivate: [AuthGuard]},
                          { path: 'actions', component: ActionComponent ,canActivate: [AuthGuard]},
                          { path: 'help', component: SupportHelpComponent ,canActivate: [AuthGuard]},
]
},

                          { path: 'login', component: LoginComponent ,canActivate: [GuestGuard]},
                          { path: '**', redirectTo: '' },
                         ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
