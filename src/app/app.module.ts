import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import {
  LocationStrategy,
  HashLocationStrategy,
  registerLocaleData,
} from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { PERFECT_SCROLLBAR_CONFIG } from "ngx-perfect-scrollbar";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

import { AppComponent } from "./app.component";

// Import containers
import { DefaultLayoutComponent } from "./containers";

import { P404Component } from "./views/error/404.component";
import { P500Component } from "./views/error/500.component";

const APP_CONTAINERS = [DefaultLayoutComponent];

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule,
} from "@coreui/angular";

// Import routing module
import { AppRoutingModule } from "./app.routing";

// Import 3rd party components
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TabsModule } from "ngx-bootstrap/tabs";
import { ChartsModule } from "ng2-charts";
import { SharedModule } from "./shared/shared.module";
import { ToastrModule } from "ngx-toastr";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { FormsModule } from "@angular/forms";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NzTabsModule } from "ng-zorro-antd/tabs";
import { NZ_I18N } from "ng-zorro-antd/i18n";
import { en_US } from "ng-zorro-antd/i18n";
import en from "@angular/common/locales/en";
import { NzStepsModule } from "ng-zorro-antd/steps";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import { NzTreeModule } from "ng-zorro-antd/tree";
import { ChangepasswordComponent } from "./views/changepassword/changepassword.component";
import { ForgotpasswordComponent } from "./views/forgotpassword/forgotpassword.component";
import { AuthInterceptor } from "./shared/services/auth.interceptor";
import { AuthGuard } from "./shared/services/auth.guard";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatBadgeModule } from "@angular/material/badge";
// import { JsonEditorDialogComponent } from './json-editor-dialog/json-editor-dialog.component';
registerLocaleData(en);

@NgModule({
  imports: [
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    ToastrModule.forRoot(),
    FormsModule,
    HttpClientModule,
    NzDropDownModule,
    NzIconModule,
    NzTabsModule,
    NzStepsModule,
    NzModalModule,
    NzTagModule,
    NzToolTipModule,
    NzTreeModule,
    MatFormFieldModule,
    MatBadgeModule
  ],
  declarations: [AppComponent, ...APP_CONTAINERS, P404Component, P500Component,],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    { provide: NZ_I18N, useValue: en_US },
    AuthGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
