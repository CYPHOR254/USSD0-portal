import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HttpService } from "../../shared/services/http-service.service";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { AddEditHostedUrlComponent } from "./components/add-edit-hosted-url/add-edit-hosted-url.component";
import { ToastrService } from "ngx-toastr";
import { NzModalService } from "ng-zorro-antd";

@Component({
  selector: "app-ussd-testing",
  templateUrl: "./ussd-testing.component.html",
  styleUrls: ["./ussd-testing.component.scss"],
})
export class UssdTestingComponent implements OnInit {
  paramsForm: FormGroup;
  hostedUssdForm: FormGroup;
  postResponse$: Observable<string>;
  ussdCodes$: Observable<any>;
  loading: boolean = false;
  isDialled: boolean = false;
  ussdName: string;

  hostedUrls$: Observable<Record<string, string>[]>;

  selectedUrl: Record<string, string>;

  dataSource: MatTableDataSource<Record<string, string>[]>;

  displayedColumns: string[] = ["protocol", "ip", "port", "action"];

  constructor(
    private httpService: HttpService,
    public dialog: MatDialog,
    private toastrService: ToastrService,
    private popConfirmModal: NzModalService
  ) {
    this.paramsForm = new FormGroup({
      engineIp: new FormControl("", Validators.required),
      enginePort: new FormControl(0, Validators.required),
      selectedUssd: new FormControl("", Validators.required),
      phoneNumber: new FormControl(""),
      input: new FormControl(""),
    });

    this.hostedUssdForm = new FormGroup({
      url: new FormControl(""),
    });
  }

  ngOnInit(): void {
    this.ussdName = sessionStorage.getItem("appName");
    this.paramsForm.controls["selectedUssd"].setValue(this.ussdName);

    let model = {
      userEmail: sessionStorage.getItem("email")!,
    };

    this.hostedUrls$ = this.httpService
      .listHostedUrls("/ussd/list-hosted-urls", model)
      .pipe(
        map((resp) => {
          this.dataSource = new MatTableDataSource(resp["data"]);
          return resp;
        })
      );
  }

  dialUssd() {
    this.loading = true;
    this.isDialled = true;

    let paramsObj = JSON.parse(this.selectedUrl["params"]);
    let keys = Object.keys(paramsObj);
    let paramStr: string = "";

    paramsObj['MOBILE_NUMBER'] = this.paramsForm.value.phoneNumber


    keys.forEach((key, idx) => {
      if (idx == keys.length - 1) {
        if (key == "USSD_BODY" || key == "INPUT") {
          paramStr += `${key}=${this.paramsForm.value.input}`;
        } else {
          paramStr += `${key}=${paramsObj[key]}`;
        }
      } else {
        if (key == "USSD_BODY" || key == "INPUT") {
          paramStr += `${key}=${this.paramsForm.value.input}&`;
        } else {
          paramStr += `${key}=${paramsObj[key]}&`;
        }
      }

      if (key == "USSD_BODY" || key == "INPUT") {
      }
      console.log(paramStr);
    });

    
    let data = {
      engineIp: this.selectedUrl["urlIP"],
      port: this.selectedUrl["urlPort"],
      protocol: this.selectedUrl["protocol"],
      params: paramStr,
      selectedUssd: this.paramsForm.value.selectedUssd,
    };



    this.postResponse$ = this.httpService.postmanReq(data);
    this.paramsForm.controls["input"].setValue("");
    this.loading = false;
  }

  cancelUssd() {
    this.isDialled = false;
    this.paramsForm.controls["input"].setValue("");
    this.selectedUrl = null;
    this.postResponse$ = null;
  }

  parseUrl() {
    let url = this.hostedUssdForm.value["url"];
    let protocol = url.split("://")[0];
    let ipAddr = url.split("://")[1].split("/?")[0].split(":")[0];
    let port = url.split("://")[1].split("/?")[0].split(":")[1].split("/")[0];
    let params = url.split("://")[1].split("/?")[1];
    let paramsArr = params.split("&");

    let paramsObj = {};
    paramsArr.map((item) => {
      let key = item.split("=")[0];
      let value = item.split("=")[1];
      paramsObj[key] = value;
    });

    let urlObj = {
      protocol,
      urlIP: ipAddr,
      urlPort: port,
      params: JSON.stringify(paramsObj),
    };

    let dialogRef = this.dialog.open(AddEditHostedUrlComponent, {
      data: {
        urlData: urlObj,
        isEdit: false,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.ngOnInit();
      this.hostedUssdForm.reset();
    });
  }

  populateUssdCode(element: any) {
    let ip = `${element.protocol}://${element.urlIP}`;
    let port = element.urlPort;

    this.paramsForm.controls["engineIp"].setValue(ip);
    this.paramsForm.controls["enginePort"].setValue(port);

    this.selectedUrl = element;

    let paramObj = JSON.parse(element['params'])
    let mobile = paramObj['MSISDN'] || paramObj['INPUT'] || paramObj['MOBILE_NUMBER']
    this.paramsForm.controls["phoneNumber"].setValue(mobile);

    
  }

  editUrl(element: any) {
    let dialogRef = this.dialog.open(AddEditHostedUrlComponent, {
      data: {
        urlData: element,
        isEdit: true,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.ngOnInit();
    });
  }

  deleteUrl(element: any) {
    let model = {
      userEmail: sessionStorage.getItem("email"),
      urlId: element["id"],
    };

    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete this item</b>?`,
      nzContent: '<b style="color:red;">It will be permanently DELETED</b>',
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        this.httpService
          .post("/ussd/delete-hosted-url", model)
          .subscribe((resp) => {
            console.log(resp);
            this.toastrService.success(
              "Hosted URL deleted successfully",
              "Deletion status"
            );
            this.ngOnInit();
          });
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.info("Hosted URL not deleted", "Deletion Status");
      },
    });
  }
}
