import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthRoutingModule } from "./auth.routing";
import { SharedModule } from "../shared/shared.module";
import { MatFormFieldModule } from "@angular/material/form-field";
import { LoginComponent } from "../views/login/login.component";
import { MatInputModule } from "@angular/material/input";
import { RegisterComponent } from "../views/register/register.component";
import { ChangepasswordComponent } from "../views/changepassword/changepassword.component";
import { ForgotpasswordComponent } from "../views/forgotpassword/forgotpassword.component";

@NgModule({
  declarations: [LoginComponent, RegisterComponent, ChangepasswordComponent, ForgotpasswordComponent],
  imports: [CommonModule, SharedModule, AuthRoutingModule, MatFormFieldModule, MatInputModule],
})
export class AuthModule {}
