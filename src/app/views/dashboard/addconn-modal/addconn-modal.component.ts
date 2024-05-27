import { Component, Inject, OnInit } from "@angular/core";
import { NzButtonSize } from "ng-zorro-antd";
import { HttpService } from "../../../shared/services/http-service.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { GlobalService } from "../../../shared/services/global-service.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Observable, of } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { catchError, map } from "rxjs/operators";

@Component({
  selector: "app-addconn-modal",
  templateUrl: "./addconn-modal.component.html",
  styleUrls: ["./addconn-modal.component.scss"],
})
export class AddconnModalComponent implements OnInit {
  isVisible: boolean;
  redisConnectForm: FormGroup;
  editConn$: Observable<any>;
  addConn$: Observable<any>;
  listOfData: any[] = [];
  port: number;
  ip: string;
  isEdit = true;
  title: string;
  formData: Record<string, string | string[]>;
  errorMsg: string;

  size: NzButtonSize = "large";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _httpService: HttpService,
    private toastrService: ToastrService,
    private dialogRef: MatDialogRef<AddconnModalComponent>
  ) {
    this.isEdit = this.data ? this.data["userData"] : undefined;
    this.formData = this.data ? this.data["userData"] : undefined;
    this.title = this.formData ? "Edit Connection" : "Add Connection";
    this.redisConnectForm = new FormGroup({
      ip: new FormControl(this.formData ? this.formData["redisIp"] : "", [
        Validators.required,
        Validators.pattern(GlobalService.ipv4Regex),
      ]),
      port: new FormControl(this.formData ? this.formData["redisPort"] : "", [
        Validators.required,
      ]),
    });
  }

  ngOnInit(): void {}

  handleOk() {
    if (this.isEdit) {
      return this.submitEditConn();
    } else {
      return this.submitAddConn();
    }
  }

  submitAddConn() {
    const model: any = {
      email: sessionStorage.getItem("email"),
      port: Number(this.redisConnectForm.value.port),
      ip: this.redisConnectForm.value.ip,
      password: "",
    };
    this.addConn$ = this._httpService
      .createConn("/ussd/create-conn", model)
      .pipe(
        map((resp: Record<string, string>): Record<string, string> => {
          if (resp && resp.respCode == "00") {
            this.toastrService.success(
              resp.msg,
              "Connection added successfully"
            );
            this.dialogRef.close();
            return resp;
          } else {
            this.toastrService.error(resp.msg, "Failed to add connection");
            this.dialogRef.close();
            throw new Error("Failed to add connection");
          }
        }),
        catchError((error) => {
          if (error.error instanceof ErrorEvent) {
            this.errorMsg = `Error: ${error.error.message}`;
            this.toastrService.error(this.errorMsg, "Connection adding error");
            this.dialogRef.close();
          } else {
            this.errorMsg = `Error: ${error.message}`;
            this.toastrService.error(this.errorMsg, "Connection adding error");
            this.dialogRef.close();
          }
          return of([]);
        })
      );
  }

  submitEditConn() {
    console.log(this.formData);
    const model: any = {
      id: Number(this.formData.id),
      email: sessionStorage.getItem("email"),
      ip: this.redisConnectForm.value.ip,
      port: Number(this.redisConnectForm.value.port),
    };
    this.editConn$ = this._httpService
      .editUser("/ussd/update-conn", model)
      .pipe(
        map((resp: Record<string, string>): Record<string, string> => {
          if (resp && resp.respCode == "00") {
            this.toastrService.success(
              resp.msg,
              "Connection updated successfully"
            );
            this.dialogRef.close();
            return resp;
          } else {
            this.toastrService.error(resp.msg, "Connection update error");
            this.dialogRef.close();
            throw new Error("Connection update error");
          }
        }),
        catchError((error) => {
          if (error.error instanceof ErrorEvent) {
            this.errorMsg = `Error: ${error.error.message}`;
            this.toastrService.error(this.errorMsg, "Connection update error");
          } else {
            this.errorMsg = `Error: ${error.message}`;
            this.toastrService.error(this.errorMsg, "Connection update error");
          }
          return of([]);
        })
      );
  }
}

// handleCancel(): void {
//   this.isVisible = false;
// }
