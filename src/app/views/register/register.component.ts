import { Component } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { GlobalService } from "../../shared/services/global-service.service";
import { HttpService } from "../../shared/services/http-service.service";

@Component({
  selector: "app-register",
  templateUrl: "register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent {
  registerForm: FormGroup;
  show: boolean = false;
  obsv$: Observable<any>;
  errorMsg: string;

  constructor(
    private _httpService: HttpService,
    private router: Router,
    private toastrService: ToastrService
  ) {
    this.registerForm = new FormGroup(
      {
        fname: new FormControl("", [
          Validators.required,
          Validators.minLength(3),
        ]),
        lname: new FormControl("", [
          Validators.required,
          Validators.minLength(3),
        ]),
        mobile: new FormControl("", [
          Validators.required,
          Validators.minLength(10),
        ]),
        email: new FormControl("", [
          Validators.required,
          Validators.email,
          Validators.pattern(GlobalService.emailRegex),
        ]),
        password: new FormControl("", [
          Validators.required,
          Validators.minLength(8),
        ]),
        confirmPassword: new FormControl("", [
          Validators.required,
          Validators.minLength(8),
        ]),
      },
      this.passMatchValidator
    );
  }

  submit() {

    this.obsv$ = this._httpService
      .register("/auth/signin", {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        firstname: this.registerForm.value.fname,
        lastname: this.registerForm.value.lname,
        mobile: this.registerForm.value.mobile
      })
      .pipe(
        map((resp: Record<string, string>): Record<string, string> => {
          if (resp && resp.respCode === "00") {
            this.toastrService.success(resp.msg, "Registration Success");
            this.router.navigate(["/auth/login"]);
            return resp;
          } else {
            this.toastrService.error(resp.msg, "Registration Failure");
            this.registerForm.reset();
            throw new Error("Registration Failed");
          }
        }),
        catchError((error) => {
          if (error.error instanceof ErrorEvent) {
            this.errorMsg = `Error: ${error.error.message}`;
            this.toastrService.error(this.errorMsg, "Login Error");
            this.registerForm.reset();
          } else {
            this.errorMsg = `Error: ${error.message}`;
            this.toastrService.error(this.errorMsg, "Login Error");
            this.registerForm.reset();
          }
          return of([]);
        })
      );
  }

  passMatchValidator(form: FormGroup): null | ValidationErrors {
    let pass = form.controls["password"].value;
    let confPass = form.controls["confirmPassword"].value;

    if (!pass || !confPass) {
      return null;
    }

    if (confPass.length > 0 && pass !== confPass) {
      return { mismatch: true };
    }

    return null;
  }
}
