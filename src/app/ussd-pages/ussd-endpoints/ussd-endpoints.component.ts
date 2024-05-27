import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NzModalService } from "ng-zorro-antd/modal";
import { ToastrService } from "ngx-toastr";
import { Observable, of } from "rxjs";
import { map } from "rxjs/internal/operators/map";
import { catchError } from "rxjs/operators";
import { HandleUssdJsonService } from "../../shared/services/handle-ussd-json.service";
import { AddEditEndpointComponent } from "./components/add-edit-endpoint/add-edit-endpoint.component";

@Component({
  selector: "app-ussd-endpoints",
  templateUrl: "./ussd-endpoints.component.html",
  styleUrls: ["./ussd-endpoints.component.scss"],
})
export class UssdEndpointsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  total: number = 23;
  pageSize: number = 23;
  page: number = 0;

  apiJsonData;
  configsFromRedis$: Observable<Record<string, string> | string>;

  allData$: Observable<Record<string, string>>;
  allData: Record<string, string>;
  errorMsg: string;

  dataSource: MatTableDataSource<Record<string, string>[]> =
    new MatTableDataSource<Record<string, string>[]>([]);
  displayedColumns: string[] = [
    "name",
    "request",
    "request-group",
    "success",
    "sValue",
    "error",
    "path",
    "action",
  ];
  endpointsArray = [];

  constructor(
    private handleJsonService: HandleUssdJsonService,
    private toastrService: ToastrService,
    private router: Router,
    public dialog: MatDialog,
    private popConfirmModal: NzModalService
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    try {
      this.allData$ = this.handleJsonService.allJsonData$.pipe(
        map((resp: Record<string, string>): Record<string, string> => {
          if (resp) {
            this.allData = { ...resp };
            this.apiJsonData = resp["api"];
            this.configsFromRedis$ = of(this.apiJsonData);

            let apiMainKey: string = Object.keys(this.apiJsonData)[0];
            let allEndpoints = Object.keys(
              this.apiJsonData[apiMainKey]["request-settings"]["endpoints"]
            );
            this.endpointsArray = [];
            allEndpoints.forEach((endpoint) => {
              let tempObj = {
                ...this.apiJsonData[apiMainKey]["request-settings"][
                  "endpoints"
                ][endpoint],
                name: endpoint,
              };
              this.endpointsArray.push(tempObj);
            });
            this.dataSource = new MatTableDataSource(this.endpointsArray);
            this.dataSource.paginator = this.paginator;
            return resp;
          }
          this.toastrService.error(
            "USSD choosen is invalid",
            "USSD Parsing Error"
          );
          this.router.navigate(["/overview"]);
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

  editEndpoint(endpointName: string) {
    let apiMainKey: string = Object.keys(this.apiJsonData)[0];
    let specificEndpoint =
      this.apiJsonData[apiMainKey]["request-settings"]["endpoints"][
        endpointName
      ];
    console.log(specificEndpoint);

    this.dialog.open(AddEditEndpointComponent, {
      data: { name: endpointName, value: specificEndpoint },
      width: "65%",
      minWidth: "46%",
      position: { right: "40px" },
    });

  }

  deleteEndpoint(endpointName: string) {
    let apiMainKey: string = Object.keys(this.apiJsonData)[0];
    let specificEndpoint =
      this.apiJsonData[apiMainKey]["request-settings"]["endpoints"][
        endpointName
      ];
    console.log(specificEndpoint);

    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete this item</b>?`,
      nzContent: '<b style="color:red;">It will be permanently DELETED</b>',
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        let itemBeingDeleted = this.endpointsArray.filter(
          (endpoint) => endpoint.name === endpointName
        )[0];
        let idx = this.endpointsArray.indexOf(itemBeingDeleted);
        this.endpointsArray.splice(idx, 1);
        this.dataSource = new MatTableDataSource(this.endpointsArray);
        this.dataSource.paginator = this.paginator;
        this.toastrService.success(
          "Item deleted successfully",
          "Deletion Status"
        );
        delete this.allData["api"][apiMainKey]["request-settings"]["endpoints"][
          endpointName
        ];
        this.handleJsonService.updateAllJsonData(this.allData);
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.warning("Item not deleted", "Deletion Status");
      },
    });
  }

  addNewEndpoint() {
    this.dialog.open(AddEditEndpointComponent, {
      data: undefined,
      width: "50%",
      minWidth: "46%",
    });
  }
}
