import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "../views/login/login.component";
import { RegisterComponent } from "../views/register/register.component";
import { ChangepasswordComponent } from "../views/changepassword/changepassword.component";
import { ForgotpasswordComponent } from "../views/forgotpassword/forgotpassword.component";
const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
    data: {
      title: "Login",
      breadcrumb: "Login",
    },
  },
  {
    path: "register",
    component: RegisterComponent,
    data: {
      title: "Register",
      breadcrumb: "Register",
    },
  },
  {
    path: "changepassword",
    component: ChangepasswordComponent,
    data: {
      title: "Changepassword",
      breadcrumb: "Changepassword",
    },
  },
  {
    path: "forgotpassword",
    component: ForgotpasswordComponent,
    data: {
      title: "Forgotpassword",
      breadcrumb: "Forgotpassword",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
