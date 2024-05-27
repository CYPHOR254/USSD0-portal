import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { GlobalService } from "../../shared/services/global-service.service";
import { HttpService } from "../../shared/services/http-service.service";

@Component({
  selector: "app-login",
  templateUrl: "login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  loginForm: FormGroup;
  show: boolean = false;
  obsv$: Observable<Record<string, string> | any[]>;
  errorMsg: string;
  hide = true;
  // firstTimeLogin: boolean = true;

  constructor(
    private _httpService: HttpService,
    private toastrService: ToastrService,
    private router: Router
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl("", [
        Validators.email,
        Validators.pattern(GlobalService.emailRegex),
      ]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
  }

  submit() {
    this.obsv$ = this._httpService
      .login("/auth/signin", {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      })
      .pipe(
        map((resp: Record<string, any>): Record<string, string> => {
          if (resp && resp.respCode === "00") {
            sessionStorage.setItem("userType", resp.userType);
            sessionStorage.setItem("token", resp.token);
            sessionStorage.setItem("email", this.loginForm.value.email);
            sessionStorage.setItem("adminId", resp.id);
            this.toastrService.success(resp.msg, "Login Successful");
            if (resp.firstTimeLogin === true) {
              this.router.navigate(["auth/changepassword"]);
            } else {
              this.router.navigate(["overview"]);
            }
            return resp;
          } else {
            this.toastrService.error(resp.msg, "Login Failure");
            this.loginForm.reset();
            return resp;
          }
        }),
        catchError((error) => {
          console.log(error);
          this.toastrService.error(error.error.message, "Login Error");
          this.loginForm.reset();
          return of([]);
        })
      );
  }
}
