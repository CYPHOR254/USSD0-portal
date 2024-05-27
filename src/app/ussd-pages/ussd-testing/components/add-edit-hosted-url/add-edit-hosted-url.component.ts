import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { NzModalService } from "ng-zorro-antd/modal";
import { ToastrService } from "ngx-toastr";
import { HttpService } from "../../../../shared/services/http-service.service";

@Component({
  selector: "app-add-edit-hosted-url",
  templateUrl: "./add-edit-hosted-url.component.html",
  styleUrls: ["./add-edit-hosted-url.component.scss"],
})
export class AddEditHostedUrlComponent implements OnInit {
  urlForm: FormGroup;
  paramsForm: FormGroup;
  formData: Record<string, any>;
  paramsData: any;
  title: string;

  dataSource: MatTableDataSource<Record<string, string>[]> =
    new MatTableDataSource<Record<string, string>[]>([]);

  displayedColumns: string[] = ["key", "value", "action"];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastrService: ToastrService,
    private dialogRef: MatDialogRef<AddEditHostedUrlComponent>,
    private popConfirmModal: NzModalService,
    private httpService: HttpService
  ) {
    this.formData = this.data ? this.data["urlData"] : undefined;
    this.title = this.formData ? "Edit URL" : "Add URL";

    this.urlForm = new FormGroup({
      protocol: new FormControl(this.formData ? this.formData["protocol"] : ""),
      ip: new FormControl(this.formData ? this.formData["urlIP"] : ""),
      port: new FormControl(this.formData ? this.formData["urlPort"] : 0),
    });

    this.paramsData = this.formData ? JSON.parse(this.formData["params"]) : [];
    let dataArr: any = this.getParamsList(this.paramsData);
    this.dataSource = new MatTableDataSource(dataArr);
  }

  ngOnInit(): void {
    this.paramsForm = new FormGroup({
      key: new FormControl(""),
      value: new FormControl(""),
    });
  }

  getParamsList(data: any) {
    let keys = Object.keys(data);
    let dataArr: any = keys.map((item) => {
      return {
        key: item,
        value: this.paramsData[item],
      };
    });

    return dataArr;
  }

  addParam() {
    console.log(this.paramsForm.value);
    let key = this.paramsForm.value["key"];
    let value = this.paramsForm.value["value"];

    if (this.paramsData[key]) {
      this.toastrService.error(
        "A key already exists with the given name",
        "Addition Error"
      );
    } else {
      this.paramsData[key] = value;
      this.paramsForm.reset();

      this.toastrService.success(
        "Param Key added successfully",
        "Addition Success"
      );
    }
    let dataArr = this.getParamsList(this.paramsData);
    this.dataSource = new MatTableDataSource(dataArr);

    console.log(this.paramsData);
  }

  editParam(element: any) {
    console.log(element);

    this.paramsForm.setValue({
      key: element.key,
      value: element.value,
    });

    delete this.paramsData[element.key];

    let dataArr = this.getParamsList(this.paramsData);
    this.dataSource = new MatTableDataSource(dataArr);
  }

  removeParam(element: any) {
    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete this item</b>?`,
      nzContent: '<b style="color:red;">It will be permanently DELETED</b>',
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        delete this.paramsData[element.key];

        let dataArr = this.getParamsList(this.paramsData);
        this.dataSource = new MatTableDataSource(dataArr);
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.info("Param not deleted", "Deletion Status");
      },
    });
  }

  submit() {
    // if (this.paramsForm.value["key"] !== "null") {
    //   this.toastrService.info("Param Key not added", "Submission error");
    // }

    let model = {
      userEmail: sessionStorage.getItem("email"),
      ip: this.urlForm.value['ip'],
      protocol: this.urlForm.value['protocol'],
      port: parseInt(this.urlForm.value['port']),
      params: JSON.stringify(this.paramsData),
    };

    if(this.data['isEdit'] === false){
      this.httpService
      .createHostedUrl("/ussd/create-hosted-url", model)
      .subscribe((resp) => {
        console.log(resp);

        this.toastrService.success(
          "URL added successfully",
          "Addition Success"
        );
        this.dialogRef.close();
      });
    } else {
      model['urlId'] = this.formData['id']
      this.httpService
      .createHostedUrl("/ussd/edit-hosted-url", model)
      .subscribe((resp) => {
        console.log(resp);

        this.toastrService.success(
          "URL edited successfully",
          "Edit Success"
        );
        this.dialogRef.close();
      });
    }

    
  }
}
