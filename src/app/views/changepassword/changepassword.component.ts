import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from '../../shared/services/global-service.service';
import { HttpService } from '../../shared/services/http-service.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss']
})
export class ChangepasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  obsv$: Observable<Record<string, string> | any[]>;
  errorMsg: string;
  hide = true;
  hide1 = true;
  hide2 = true;

  constructor(private _httpService: HttpService, private router: Router, private toastrService: ToastrService) { 
    this.changePasswordForm = new FormGroup(
      {
        email: new FormControl("", [Validators.required, Validators.email, Validators.pattern(GlobalService.emailRegex)]),
        oldPassword: new FormControl("", [Validators.required, Validators.minLength(8)]),
        password: new FormControl("", [Validators.required, Validators.minLength(8)]),
        confirmPassword: new FormControl("", [Validators.required, Validators.minLength(8)])
      },
        this.passMatchValidator
    );
   }

  ngOnInit(): void {
  }

  submit() {
    this.obsv$ = this._httpService.changePass("/auth/change_password", {
      email: this.changePasswordForm.value.email,
      password: this.changePasswordForm.value.password
    })
    .pipe(
      map((resp: Record<string, any>): Record<string, any> => {
        if (resp && resp.respCode == '00') {
          sessionStorage.setItem("token", resp.token);
          this.toastrService.success(resp.msg, "Password changed successfully.");
          this.router.navigate(["/overview"])
          return resp;
        } else {
          this.toastrService.error(resp.msg, "Password change failed");
          this.changePasswordForm.reset();
          return resp;
        }
      }),
      catchError((error) => {
        if (error.error instanceof ErrorEvent) {
          this.errorMsg = `Error: ${error.error.message}`;
          this.toastrService.error(this.errorMsg, 'Password change Error');
          this.changePasswordForm.reset();
        } else {
          this.errorMsg = `Error: ${error.message}`;
          this.toastrService.error(this.errorMsg, 'Password change Error');
          this.changePasswordForm.reset();
        }
        return of([]);
      })
    )
  }

  passMatchValidator(form: FormGroup): null | ValidationErrors {
    let newPass = form.controls["password"].value;
    let confPass = form.controls["confirmPassword"].value;

    if(!newPass || !confPass){
      return null;
    }
    if(confPass.length > 0 && newPass !== confPass) {
      return { mismatch: true }
    }
    return null;
  }
}
