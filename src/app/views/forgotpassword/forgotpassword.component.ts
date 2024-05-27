import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpService } from '../../shared/services/http-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss']
})
export class ForgotpasswordComponent implements OnInit {
  forgotForm: FormGroup;
  obsv$: Observable<Record<string, string> | any[]>;
  errorMsg: string;

  constructor(private _httpService: HttpService, private toastrService: ToastrService, private router: Router) { 
    this.forgotForm = new FormGroup({ 
    email: new FormControl("", [Validators.required, Validators.email]) 
  }) 
}

  ngOnInit(): void {
  }

  submit() {
    const model = {
      email: this.forgotForm.value.email,
    }
    console.log(model)

    this.obsv$ = this._httpService.forgotPass('/auth/forgot_password', model)
    .pipe
    (map((resp: Record<string, string>): Record<string, string> => {
      if (resp && resp.respCode === "00"){
        sessionStorage.setItem("token", resp.token);
        this.toastrService.success(resp.message, "Successfull");
        // this.router.navigate([""]);
        return resp;
      } else {
        this.toastrService.error(resp.message, "Unsuccessfull");
        this.forgotForm.reset();
        return resp;
      }
    }),
    catchError((error) => {
      if (error.error instanceof ErrorEvent) {
        this.errorMsg = `Error: ${error.error.message}`;
        this.toastrService.error(this.errorMsg, "Password Reset Error");
        this.forgotForm.reset();
      } else {
        this.errorMsg = `Error: ${error.message}`;
        this.toastrService.error(this.errorMsg, "Password Reset Error");
        this.forgotForm.reset();
      }
      return of([]);
    }))
  }

}
