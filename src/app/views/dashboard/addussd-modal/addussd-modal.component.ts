import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from '../../../shared/services/http-service.service';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-addussd-modal',
  templateUrl: './addussd-modal.component.html',
  styleUrls: ['./addussd-modal.component.scss']
})
export class AddussdModalComponent implements OnInit {
  errorMsg: string;
  createConfig$: Observable<Object>;
  addUSSDForm: FormGroup;

  constructor(
    private _httpService: HttpService, 
    private toastrService: ToastrService,
    private dialogRef: MatDialogRef<AddussdModalComponent>) { 
    this.addUSSDForm = new FormGroup({
      ussdName: new FormControl("", [Validators.required])
    })
  }

  ngOnInit(): void {
  }

  createNewUssdConfig() {
    const model: any = {
      ussdName: this.addUSSDForm.value.ussdName,
    }

    this.createConfig$ = this._httpService.fetchUSSDname("/ussd/create-new-ussd", model)
    .pipe(
      map((resp: any) => {
        if(resp) {
          this.toastrService.success(
            resp.msg,
            "USSD added successfully"
          );
          this.dialogRef.close();
          return resp;
        } else {
          this.toastrService.error(resp.msg, "Failed to create USSD");
          this.dialogRef.close();
          throw new Error("Failed to create USSD");
        }
      }),
      catchError((error) => {
        if (error.error instanceof ErrorEvent) {
          this.errorMsg = `Error: ${error.error.message}`;
          this.toastrService.error(this.errorMsg, "USSD creation error");
          this.dialogRef.close();
        } else {
          this.errorMsg = `Error: ${error.message}`;
          this.toastrService.error('Ussd with given name already exists in the selected DB');
          this.dialogRef.close();
        }
        return of([]);
      })
    )
  }
}
