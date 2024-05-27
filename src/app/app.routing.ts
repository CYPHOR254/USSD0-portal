import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

// Import Containers
import { DefaultLayoutComponent } from "./containers";

import { P404Component } from "./views/error/404.component";
import { P500Component } from "./views/error/500.component";
import { AuthGuard } from "./shared/services/auth.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/overview",
    pathMatch: "full",
  },
  {
    path: "404",
    component: P404Component,
    data: {
      title: "Page 404",
    },
  },
  {
    path: "500",
    component: P500Component,
    data: {
      title: "Page 500",
    },
  },

  // {
  //   path: "register",
  //   component: RegisterComponent,
  //   data: {
  //     title: "Register Page",
  //   },
  // },

  {
    path: "",
    component: DefaultLayoutComponent,
    data: {
      title: "Home",
    },
    // canActivateChild: [AuthGuard],
    children: [
      {
        path: "ussd",
        loadChildren: () =>
          import("./ussd-pages/ussd-pages.module").then(
            (m) => m.UssdPagesModule
          ),
          data: {
            role: ['SYS_ADMIN']
          },
      },
      {
        path: "overview",
        loadChildren: () =>
          import("./views/dashboard/dashboard.module").then(
            (m) => m.DashboardModule
          ),
      },
      // {
      //   path: "theme",
      //   loadChildren: () =>
      //     import("./views/theme/theme.module").then((m) => m.ThemeModule),
      // },
    ],
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then((m) => m.AuthModule),
  },
  { path: "**", component: P404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes , {enableTracing:true})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
