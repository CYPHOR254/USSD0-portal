import { Component, Inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { GlobalService } from "../../../shared/services/global-service.service";
import { HttpService } from "../../../shared/services/http-service.service";
import { Observable, of } from "rxjs";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { catchError, map } from "rxjs/operators";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-addusers-modal",
  templateUrl: "./addusers-modal.component.html",
  styleUrls: ["./addusers-modal.component.scss"],
})
export class AddusersModalComponent implements OnInit {
  createUserForm: FormGroup;
  obsv$: Observable<any>;
  editUser$: Observable<any>;
  errorMsg: string;
  hide = true;
  hide1 = true;
  formData: Record<string, string | string[]>;
  isEdit = true;
  title: string;
  isBlocked: Boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _httpService: HttpService,
    private router: Router,
    private toastrService: ToastrService,
    private dialogRef: MatDialogRef<AddusersModalComponent>
  ) {
    (this.isEdit = this.data ? this.data["userData"] : undefined),
    (this.formData = this.data ? this.data["userData"] : undefined),
    (this.title = this.formData ? "Edit User" : "Add User"),
      this.createUserForm = new FormGroup({
        email: new FormControl(this.formData ? this.formData["email"] : "", [
          Validators.required,
          Validators.email,
          Validators.pattern(GlobalService.emailRegex),
        ]),
        password: new FormControl("", [
          Validators.required,
          Validators.minLength(8),
        ]),
        phoneNumber: new FormControl(
          this.formData ? this.formData["phoneNumber"] : "",
          [Validators.required, Validators.minLength(10)]
        ),
        idNumber: new FormControl(
          this.formData ? this.formData["idNumber"] : "",
          [Validators.required]
        ),
        block: new FormControl(""),
        confirmPassword: new FormControl("", [
          Validators.required,
          Validators.minLength(8),
        ]),
      },
      this.passMatchValidator
      );
  }

  ngOnInit(): void {
  }

  handleOk() {
    if (this.isEdit) {
      return this.submitEdit();
    } else {
      return this.submitAdd();
    }
  }

  submitAdd() {
    const model: any = {
      email: this.createUserForm.value.email,
      password: this.createUserForm.value.password,
      phoneNumber: Number(this.createUserForm.value.phoneNumber),
      idNumber: Number(this.createUserForm.value.idNumber),
      userId: Number(sessionStorage.getItem("adminId"))
    };
    const token = sessionStorage.getItem("token"); // get the token from sessionStorage
    this.obsv$ = this._httpService
      .createUser("/auth/create_user_account", model, token)
      .pipe(
        map((resp: Record<string, string>): Record<string, string> => {
          if (resp && resp.respCode === "00") {
            sessionStorage.setItem("token", resp.token);
            this.toastrService.success(resp.message, "Successfull");
            this.dialogRef.close();
            return resp;
          } else {
            this.toastrService.error(resp.message, "Failed");
            this.dialogRef.close();
            this.createUserForm.reset();
            throw new Error("User creation failed");
          }
        }),
        catchError((error) => {
          if (error.error instanceof ErrorEvent) {
            this.errorMsg = `Error: ${error.error.message}`;
            this.toastrService.error(this.errorMsg, "User Creation Error");
            this.dialogRef.close();
            this.createUserForm.reset();
          } else {
            this.errorMsg = `Error: ${error.message}`;
            this.toastrService.error(this.errorMsg, "User Creation Error");
            this.dialogRef.close();
            this.createUserForm.reset();
          }
          return of([]);
        })
      );
  }

  submitEdit() {
    const model: any = {
      id: this.formData.id,
      email: this.createUserForm.value.email,
      idNumber: Number(this.createUserForm.value.idNumber),
      phoneNumber: Number(this.createUserForm.value.phoneNumber),
      isBlocked: JSON.parse(this.createUserForm.value.block)
    };
    this.editUser$ = this._httpService
      .editUser("/auth/update-user", model)
      .pipe(
        map((resp: Record<string, string>): Record<string, string> => {
          if (resp && resp.respCode == "00") {
            this.toastrService.success(resp.message, "Success");
            this.dialogRef.close();
            return resp;
          } else {
            this.toastrService.error(resp.message, "Failed");
            this.dialogRef.close();
            throw new Error("User update failed");
          }
        }),
        catchError((error) => {
          if (error.error instanceof ErrorEvent) {
            this.errorMsg = `Error: ${error.error.message}`;
            this.toastrService.error(this.errorMsg, "User Update Error"); 
            this.dialogRef.close();
          } else {
            this.errorMsg = `Error: ${error.message}`;
            this.toastrService.error(this.errorMsg, "User Update Error");
            this.dialogRef.close();
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
