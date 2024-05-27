import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NzModalService } from "ng-zorro-antd/modal";
import { ToastrService } from "ngx-toastr";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { GlobalService } from "../../shared/services/global-service.service";
import { HandleUssdJsonService } from "../../shared/services/handle-ussd-json.service";

@Component({
  selector: "app-ussd-environments",
  templateUrl: "./ussd-environments.component.html",
  styleUrls: ["./ussd-environments.component.scss"],
})
export class UssdEnvironmentsComponent implements OnInit {
  apiServerForm: FormGroup;

  allData$: Observable<Record<string, string>>;
  allData: Record<string, string>;

  configsFromRedis$: Observable<Record<string, string> | string>;

  errorMsg: string;

  apiJsonData;
  configJsonData;
  choosenServerEnv: string;

  dataSource: MatTableDataSource<Record<string, string>[]> =
    new MatTableDataSource<Record<string, string>[]>([]);
  displayedColumns: string[] = [
    "name",
    "host",
    "port",
    "protocol",
    "method",
    "path",
    "action",
  ];
  serversArray = [];

  constructor(
    private handleJsonService: HandleUssdJsonService,
    private toastrService: ToastrService,
    private router: Router,
    private popConfirmModal: NzModalService
  ) {
    this.apiServerForm = new FormGroup({
      backendServer: new FormControl(""),
      serverName: new FormControl(""),
      host: new FormControl(""),
      port: new FormControl(""),
      protocol: new FormControl(""),
      method: new FormControl(""),
      path: new FormControl(""),
    });
  }

  ngOnInit(): void {
    try {
      this.allData$ = this.handleJsonService.allJsonData$.pipe(
        map((resp: Record<string, string>): Record<string, string> => {
          if (resp) {
            this.allData = { ...resp };

            for (let key in resp) {
              if (key === "api") {
                this.apiJsonData = resp[key];
                this.configsFromRedis$ = of(this.apiJsonData);

                let apiMainKey: string = Object.keys(this.apiJsonData)[0];

                let serverNames = Object.keys(
                  this.apiJsonData[apiMainKey]["data-sources"]
                );

                serverNames = serverNames.filter(
                  (server) =>
                    server !== "timeout" && server !== "offline-timeout"
                );

                this.serversArray = [];
                serverNames.map((server) => {
                  this.serversArray.push({
                    ...this.apiJsonData[apiMainKey]["data-sources"][server],
                    serverName: server,
                  });
                });

                this.dataSource = new MatTableDataSource(this.serversArray);
              }

              if (key === "config") {
                this.configJsonData = resp[key];

                this.choosenServerEnv = this.configJsonData["api-environment"];
                this.apiServerForm.controls["backendServer"].setValue(
                  this.choosenServerEnv
                );
                console.log(this.choosenServerEnv);
              }
            }
            return resp;
          }
          throw new Error("No configuration files to read from!!");
        }),
        catchError((error) => {
          if (error.error instanceof ErrorEvent) {
            this.errorMsg = `Error: ${error.error.message}`;
            this.toastrService.error(this.errorMsg, "Redis Error");
          } else {
            this.errorMsg = `Error: ${error.message}`;

            this.toastrService.error(this.errorMsg, "Redis Error");
          }
          this.router.navigate(["/overview"]);
          return of({});
        })
      );
    } catch (error) {
      this.toastrService.error(error, "Data Loading Error");
      this.router.navigate(["/overview"]);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addServer(formData: Record<string, string>) {
    let tempObj = {
      serverName: formData["serverName"],
      host: formData["host"],
      port: formData["port"],
      protocol: formData["protocol"],
      method: formData["method"],
      path: formData["path"],
    };

    console.log(tempObj);
    
    
    let existingServer = this.serversArray.filter(
      (server) => server["serverName"] == formData["serverName"]
      );
      
    if (
      existingServer.length > 0 ||
      !tempObj.serverName ||
      !tempObj.host ||
      !tempObj.method
    ) {
      this.apiServerForm.reset();
    } else {
      this.serversArray.unshift(tempObj);
      this.dataSource = new MatTableDataSource(this.serversArray);
      this.apiServerForm.reset();
      this.submit();
    }
  }

  editServer(element: Record<string, string>) {
    let idx = this.serversArray.indexOf(element);
    this.serversArray.splice(idx, 1);
    this.dataSource = new MatTableDataSource(this.serversArray);
    this.apiServerForm.setValue({
      serverName: element["serverName"],
      host: element["host"],
      port: element["port"],
      protocol: element["protocol"],
      method: element["method"],
      path: element["path"],
      backendServer: this.choosenServerEnv,
    });
  }

  removeServer(element: Record<string, string>) {
    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete this server</b>?`,
      nzContent: '<b style="color:red;">It will be permanently DELETED</b>',
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        let idx = this.serversArray.indexOf(element);
        this.serversArray.splice(idx, 1);
        this.dataSource = new MatTableDataSource(this.serversArray);
        this.toastrService.success("Item deleted", "Deletion Status");
        // this.ref.detectChanges();
        this.submit();
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.error("Item not deleted", "Deletion Status");
      },
    });
  }

  submit() {
    console.log(this.serversArray);
    let apiDataSourcesObj = {};
    this.serversArray.map((server) => {
      apiDataSourcesObj = Object.assign(
        { ...apiDataSourcesObj },
        {
          [server["serverName"]]: {
            host: server["host"],
            port: server["port"],
            protocol: server["protocol"],
            method: server["method"],
            path: server["path"],
          },
        }
      );
    });

    console.log(apiDataSourcesObj);

    let apiMainKey: string = Object.keys(this.apiJsonData)[0];
    this.apiJsonData[apiMainKey] = Object.assign(
      {
        ...this.apiJsonData[apiMainKey],
      },
      { "data-sources": { ...apiDataSourcesObj } }
    );

    this.configJsonData["api-environment"] = this.apiServerForm.controls[
      "backendServer"
    ].value
      ? this.apiServerForm.controls["backendServer"].value
      : this.configJsonData["api-environment"];

    this.allData["api"] = this.apiJsonData;
    this.allData["config"] = this.configJsonData;

    this.handleJsonService.updateAllJsonData(this.allData);
    this.toastrService.success('Changes made', 'Change Status')
  }
}
