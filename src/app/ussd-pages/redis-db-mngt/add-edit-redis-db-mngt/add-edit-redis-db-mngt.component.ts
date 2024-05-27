import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GlobalService } from '../../../shared/services/global-service.service';
import { HttpService } from '../../../shared/services/http-service.service';
import { AddusersModalComponent } from '../../users/addusers-modal/addusers-modal.component';

@Component({
  selector: 'app-add-edit-redis-db-mngt',
  templateUrl: './add-edit-redis-db-mngt.component.html',
  styleUrls: ['./add-edit-redis-db-mngt.component.scss']
})
export class AddEditRedisDbMngtComponent implements OnInit {
  usersCreated: any[] = [];

  dataSource: MatTableDataSource<Record<string, string>[]> =
    new MatTableDataSource<Record<string, string>[]>([]);
  createRedisdbMngt: FormGroup;
  createRedisdb$: Observable<any>;
  errorMsg: string;
  formData: Record<string, string | string[]>;
  isEdit = true;
  title: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _httpService: HttpService,
    private router: Router,
    private toastrService: ToastrService,
    private dialogRef: MatDialogRef<AddusersModalComponent>
  ) {
    this.isEdit = this.data ? this.data["userData"] : undefined;
    this.formData = this.data ? this.data["userData"] : undefined;
    this.title = this.formData
      ? "Edit Redis db Management"
      : "Add Redis db Management";
    this.createRedisdbMngt = new FormGroup({
      ip: new FormControl(this.formData ? this.formData["ip"] : "", [
        Validators.required,
        Validators.pattern(GlobalService.ipv4Regex),
      ]),
      port: new FormControl(this.formData ? this.formData["port"] : "", [
        Validators.required,
      ]),
      db: new FormControl(this.formData ? this.formData["db"] : "", [
        Validators.required,
        Validators.max(15),
      ]),
      allowedUsersId: new FormControl(
        this.formData ? this.formData["allowedUsers"] : ""
      ),
    });
  }

  ngOnInit(): void {
    this.fetchUserId();
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
      userId: Number(sessionStorage.getItem("adminId")),
      ip: this.createRedisdbMngt.value.ip,
      port: Number(this.createRedisdbMngt.value.port),
      db: Number(this.createRedisdbMngt.value.db),
      allowedUsers: this.createRedisdbMngt.value.allowedUsersId,
    };
    this._httpService
      .post("/ussd/create-redis-db-mngt", model)
      .subscribe((resp) => {
        if (resp.respCode == "00") {
          this.toastrService.success(
            resp.message,
            "Successfull"
          );
          this.dialogRef.close();
          return resp;
        } else {
          this.toastrService.error(resp.message, "Creation Failed");
          this.dialogRef.close();
          this.createRedisdbMngt.reset();
          throw new Error("Redis db management failed");
        }
      }),
      catchError((error) => {
        if (error.error instanceof ErrorEvent) {
          this.errorMsg = `Error: ${error.error.message}`;
          this.toastrService.error(this.errorMsg, "Redis creation error");
          this.dialogRef.close();
          this.createRedisdbMngt.reset();
        } else {
          this.errorMsg = `Error: ${error.message}`;
          this.toastrService.error(this.errorMsg, "Redis Creation Error");
          this.dialogRef.close();
          this.createRedisdbMngt.reset();
        }
        return of([]);
      });
  }

  submitEdit() {
    const model: any = {
      id: this.formData.id,
      userId: Number(sessionStorage.getItem("adminId")),
      ip: this.createRedisdbMngt.value.ip,
      port: Number(this.createRedisdbMngt.value.port),
      db: Number(this.createRedisdbMngt.value.db),
      allowedUsers: this.createRedisdbMngt.value.allowedUsersId,
    };
    this._httpService.editRedisdbMngt("/ussd/edit-redis-db-mngt", model).subscribe(
      (resp: any) => {
        if (resp.respCode === "00") {
          this.toastrService.success(
            resp.message,
            "Successful"
          );
        } else {
          this.toastrService.error(resp.message, "Failed");
        }
        this.dialogRef.close();
      },
      (error) => {
        if (error.error instanceof ErrorEvent) {
          this.errorMsg = `Error: ${error.error.message}`;
          this.toastrService.error(this.errorMsg, "Redis edit error");
        } else {
          this.errorMsg = `Error: ${error.message}`;
          this.toastrService.error(this.errorMsg, "Redis Edit Error");
        }
        this.dialogRef.close();
      }
    );
  }

  fetchUserId() {
    this._httpService.findAll("/auth/find-all").subscribe((resp: any) => {
      if (resp) {
        this.usersCreated = resp.listUsers
          .filter(
            (users) => users.createdBy == sessionStorage.getItem("adminId")
          )
          .map((user: any) => {
            let response: any = {
              id: user.id,
              email: user.email,
            };
            return response;
          });
        this.dataSource = new MatTableDataSource(this.usersCreated);
        return this.usersCreated;
      }
    });
  }
}