import { ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { GlobalService } from "../../shared/services/global-service.service";
import { HandleUssdJsonService } from "../../shared/services/handle-ussd-json.service";

import { HttpService } from "../../shared/services/http-service.service";
import { HttpClient } from "@angular/common/http";
import { NzButtonSize, NzModalService } from "ng-zorro-antd";
import { MatDialog } from "@angular/material/dialog";
import { AddconnModalComponent } from "./addconn-modal/addconn-modal.component";
import { MatTableDataSource } from "@angular/material/table";
import { AddussdModalComponent } from "./addussd-modal/addussd-modal.component";

@Component({
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  pageSize = 10;
  pageIndex = 1;
  total = 0;

  dataSource: MatTableDataSource<Record<string, string>[]> =
    new MatTableDataSource<Record<string, string>[]>([]);

  displayedColumns: string[] = ["ip", "port", "action"];

  appName: string;
  metaData: any;
  projectDetails: any;
  hide = true;
  loading: boolean;
  isVisible: boolean;

  size: NzButtonSize = "large";

  listOfData: any[] = [];

  redisConnectForm: FormGroup;
  ussdApps: FormControl = new FormControl("");
  ussdName: FormControl = new FormControl("");

  appNames: string[] = []; //Store existing USSD App names.
  connectedToRedis: boolean = false;
  isRedisConnected: boolean = false;

  fetchConfigs$: Observable<Object>;
  redisConnect$: Observable<Object>;
  createConfig$: Observable<Object>;
  errorMsg: string;
  listConnections$: Observable<any>;

  constructor(
    private _httpService: HttpService,
    private router: Router,
    private handleJsonService: HandleUssdJsonService,
    private toastrService: ToastrService,
    private http: HttpClient,
    public dialog: MatDialog,
    private ref: ChangeDetectorRef,
    private popConfirmModal: NzModalService
  ) {
    this.redisConnectForm = new FormGroup({
      ip: new FormControl("", [
        Validators.required,
        Validators.pattern(GlobalService.ipv4Regex),
      ]),
      port: new FormControl(6379, [Validators.required]),
      db: new FormControl("", [Validators.required, Validators.max(15)]),
      password: new FormControl(""),
    });
  }

  ngOnInit() {
    this.loadData();
  }

  connectToRedis(): void {
    let formData = {
      ip: this.redisConnectForm.value.ip,
      port: Number(this.redisConnectForm.value.port),
      db: Number(this.redisConnectForm.value.db),
      password: this.redisConnectForm.value.password == null ? '' : this.redisConnectForm.value.password,
      userId: Number(sessionStorage.getItem("adminId"))
    };

    this.redisConnect$ = this._httpService
      .connectRedis("/ussd/connect", formData)
      .pipe(
        map((resp: Object) => {
          if (resp) {
            if (resp["configs"].length < 1) {
              this.toastrService.warning(
                "The selected Redis DB contains no USSD Configs",
                "Missing USSD Configs"
              );
              sessionStorage.setItem(
                "redisDB",
                this.redisConnectForm.controls["db"].value
              );
              this.redisConnectForm.controls["db"].reset();

              this.isRedisConnected = true;
              this.connectedToRedis = true;

              return resp;
            }
            this.isRedisConnected = true;
            this.appNames = resp["configs"];
            this.connectedToRedis = true;
            return resp;
          }
          throw new Error("Something went wrong");
        }),
        catchError((error) => {
          if (error.error instanceof ErrorEvent) {
            this.errorMsg = `Error: ${error.error.message}`;
            this.toastrService.error(this.errorMsg, "Error");
            this.redisConnectForm.reset();
          } else {
            // this.errorMsg = `Error: ${error.message}`;
            this.toastrService.error(this.errorMsg, "redis is not conneted check connection nd try again");
            this.redisConnectForm.reset();
          }
          return of([]);
        })
      );
  }

  fetchUSSDConfigs() {
    let appName: string = this.ussdApps.value;

    this.fetchConfigs$ = this._httpService
      .fetchUSSDConfigurations("/ussd/fetch-configs", appName)
      .pipe(
        map((resp: Object) => {
          if (resp) {
            let data: Record<string, string> = resp["allData"];
            this.handleJsonService.updateAllJsonData(data, false);
            sessionStorage.setItem("appName", appName);

            for (let key in data) {
              sessionStorage.setItem(key, JSON.stringify(data[key]));
            }
            this.router.navigate(["/ussd/ussd-setup"]);
            return resp;
          }
          throw new Error("Could not fetch configs");
        })
      );
  }

  loadData() {
    const model: string = sessionStorage.getItem("email");
    this.loading = true;

    this.listConnections$ = this._httpService
      .fetchConnList("/ussd/list-conn", model)
      .pipe(
        map((resp: any) => {
          if (resp) {
            this.listOfData = resp.connections.map((item) => {
              let response: any = {
                id: item.id,
                redisPort: item.redisPort,
                redisIp: item.redisIP,
              };
              return response;
            });
            this.dataSource = new MatTableDataSource(this.listOfData);
            this.loading = false;
            return this.listOfData;
          }
        })
      );
  }

  createNewUssdConfig() {
    const dialogRef = this.dialog.open(AddussdModalComponent, {});

    dialogRef.afterClosed().subscribe(() => {
      this.connectedToRedis = false;
      this.isRedisConnected = false;
      this.ref.detectChanges();
    });
  }

  addConnection() {
    let dialogRef = this.dialog.open(AddconnModalComponent, {});

    dialogRef.afterClosed().subscribe(() => {
      this.loadData();
      this.ref.detectChanges();
    });
  }

  populateConn(element: any) {
    this.redisConnectForm.patchValue({
      ip: element.redisIp,
      port: element.redisPort,
      db: 0,
    });
  }

  editConn(element) {
    let dialogRef = this.dialog.open(AddconnModalComponent, {
      data: {
        userData: element,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadData();
      this.ref.detectChanges();
    });
  }

  removeConn(element: any) {
    const model = {
      userId: element["id"],
      userEmail: sessionStorage.getItem("email"),
    };
    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete this item</b>?`,
      nzContent: `<b style="color: red;">It will be permanently DELETED</b>`,
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        this._httpService.post("/ussd/delete-conn", model).subscribe((resp) => {
          if (resp.respCode == "00") {
            this.toastrService.success(
              "Connection deleted successfully",
              "Deletion status"
            );
            this.ngOnInit();
          }
          this.ref.detectChanges();
        });
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.info("Connection not deleted", "Deletion Status");
      },
    });
  }

  onPageIndexChange(pageIndex: number) {
    this.pageIndex = pageIndex;
    // Fetch the data for the new page here
  }
}
