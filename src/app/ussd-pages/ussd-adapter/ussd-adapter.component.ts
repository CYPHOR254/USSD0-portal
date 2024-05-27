import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { HandleUssdJsonService } from "../../shared/services/handle-ussd-json.service";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { catchError, map } from "rxjs/operators";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { AddEditPromptStepComponent } from "../ussd-simulator/components/add-edit-prompt-step/add-edit-prompt-step.component";
import { AddEditEndpointComponent } from "../ussd-endpoints/components/add-edit-endpoint/add-edit-endpoint.component";
import { MatTableDataSource } from "@angular/material/table";
import { NzModalService } from "ng-zorro-antd";
import { AddEditAdapterRuleComponent } from "./components/add-edit-adapter-rule/add-edit-adapter-rule.component";
import { MatPaginator } from "@angular/material/paginator";
import { AddEditLookupStatusComponent } from "./components/add-edit-lookup-status/add-edit-lookup-status.component";
import { AddEditMapperObjComponent } from "./components/add-edit-mapper-obj/add-edit-mapper-obj.component";

@Component({
  selector: "app-ussd-adapter",
  templateUrl: "./ussd-adapter.component.html",
  styleUrls: ["./ussd-adapter.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UssdAdapterComponent implements OnInit {
  @ViewChild("paginator") paginator!: MatPaginator;
  @ViewChild("mapperPaginator") mapperPaginator!: MatPaginator;

  allData$: Observable<Record<string, string>>;
  allData: Record<string, any>;
  adapterData: Record<string, string>;
  configData: Record<string, string>;
  apiData: Record<string, string>;

  responsePrompt$: Observable<any>;

  lookupEndpoint: string;
  endpointData: any;
  lookupStatuses: any;
  adapterMappers: string[];
  adapterRules: any;
  mappersDataArr: any[] = [];

  ussdConfigDataForm: FormGroup;
  ussdLookupForm: FormGroup;

  errorMsg: string;
  currentPromptTitle: string;
  currentPrompt: string;
  currentPromptStep: Record<string, string>;
  currentPromptIndex: number;

  dataSource: MatTableDataSource<Record<string, string>[]>;
  displayedColumns: string[] = [
    "name",
    "path",
    "default",
    "format-as",
    "validation",
    "matches",
    "action",
  ];
  mappersDataSource: MatTableDataSource<Record<string, string>[]>;
  mappersDisplayedColumns: string[] = ["key", "value", "inAccDtl", "action"];

  constructor(
    private handleJsonService: HandleUssdJsonService,
    private router: Router,
    private toastrService: ToastrService,
    public dialog: MatDialog,
    private popConfirmModal: NzModalService,
    private ref: ChangeDetectorRef
  ) {
    this.ussdConfigDataForm = new FormGroup({
      registrationEnabled: new FormControl(""),
      registrationCheck: new FormControl({ value: "", disabled: true }),
      internalAuth: new FormControl(""),
      blockedAccCheck: new FormControl({ value: "", disabled: true }),
      firstLoginCheck: new FormControl({ value: "", disabled: true }),
      imsiCheck: new FormControl({ value: "", disabled: true }),
    });
    this.ussdLookupForm = new FormGroup({
      lookupEndpoint: new FormControl(""),
      apiCrossCheckField: new FormControl(""),
      selectedMapper: new FormControl(""),
    });
  }

  ngOnInit(): void {
    try {
      this.allData$ = this.handleJsonService.allJsonData$.pipe(
        map((resp: Record<string, string>): Record<string, string> => {
          if (resp) {
            this.allData = { ...resp };
            this.adapterData = this.allData["adapter"];

            // let langArr = new Set();
            let apiName = this.allData["config"]["api-name"];

            this.apiData = this.allData["api"][apiName]["request-settings"];

            this.lookupEndpoint =
              this.allData["config"]["api-user-profile-route"];
            this.configData = { ...this.allData["config"] };

            this.endpointData = this.apiData["endpoints"][this.lookupEndpoint];
            console.log(this.apiData, "apidata", this.endpointData);
            this.ussdLookupForm.controls["lookupEndpoint"].setValue(
              this.lookupEndpoint
            );

            this.ussdConfigDataForm.setValue({
              registrationEnabled: this.configData["register"],
              registrationCheck: this.configData["registration-check"],
              internalAuth: this.configData["internal-authentication"],
              blockedAccCheck: this.configData["blocked-account-check"],
              firstLoginCheck: this.configData["first-login-check"],
              imsiCheck: this.configData["imsi-check"],
            });

            let apiCrossCheckField =
              this.adapterData[this.endpointData["response"]["adapter"]][
                "response"
              ]["status"]["field"];
            this.ussdLookupForm["controls"]["apiCrossCheckField"].setValue(
              apiCrossCheckField
            );

            this.lookupStatuses =
              this.adapterData[this.endpointData["response"]["adapter"]][
                "response"
              ]["status"];

            console.log(this.lookupStatuses, "this.lookupStatuses,");

            this.adapterRules =
              this.adapterData[this.endpointData["response"]["adapter"]][
                "response"
              ]["rules"];

            let tempMappers =
              this.adapterData[this.endpointData["response"]["adapter"]][
                "response"
              ]["mappers"];

            let adapterMappersArray = Object.keys(tempMappers);
            this.adapterMappers = adapterMappersArray.filter(
              (item) => item !== "merge"
            );

            this.ussdLookupForm["controls"]["selectedMapper"].setValue(
              this.adapterMappers[0]
            );

            this.dataSource = new MatTableDataSource(this.adapterRules);
            this.dataSource.paginator = this.paginator;

            this.checkMapper();
            this.updatePhoneDisplay();

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
            this.toastrService.error(this.errorMsg, "Redis Error - Setup");
          } else {
            this.errorMsg = `Error: ${error.message}`;

            this.toastrService.error(this.errorMsg, "Redis Error - Setup");
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

  updatePhoneDisplay(selectedState?: string) {
    console.log(selectedState);

    selectedState = selectedState
      ? selectedState
      : this.ussdConfigDataForm["controls"]["firstLoginCheck"].value;

    let item = this.allData["prompts"][selectedState];
    let resp = item;
    let tempArr = [];

    if (item.length) {
      tempArr = [...resp];

      tempArr.forEach((prompt) => {
        let promptText = this.handleJsonService.getKeyFromLang(
          this.allData,
          prompt.name
        );

        if (prompt.type === "skip") {
          prompt.title = "SKIP";
        } else {
          prompt.title = promptText;
        }
        console.log(prompt);
      });
    } else if (item.length === 0) {
      this.currentPromptTitle = "Please add a new step";
      return resp;
    } else {
      tempArr.push(resp);
      tempArr.forEach((prompt) => {
        let promptText = this.handleJsonService.getKeyFromLang(
          this.allData,
          prompt.name
        );
        if (promptText !== "") {
          prompt.title = promptText;
        }
      });
    }

    this.currentPromptTitle = tempArr[0]["name"];

    this.responsePrompt$ = of(tempArr);

    this.currentPrompt = selectedState;
  }

  changePromptTitle(prompt: Record<string, string>, index?: number) {
    this.currentPromptTitle = prompt?.name;
    this.currentPromptStep = prompt;
    this.currentPromptIndex = index;
  }

  editPrompt(prompt?: Record<string, string>) {
    let x = this.dialog
      .open(AddEditPromptStepComponent, {
        data: {
          promptData: prompt,
          promptName: this.currentPrompt,
        },
        width: "75%",
        position: { right: "50px" },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp !== true) {
          this.ngOnInit();
        }
      });

    // this.subscription.push(xy);
  }

  addNewPromptStep() {
    let x = this.dialog
      .open(AddEditPromptStepComponent, {
        data: {
          promptName: this.currentPrompt,
        },
        width: "75%",
        position: { right: "50px" },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp !== true) {
          this.ngOnInit();
        }
      });

    // this.subscription.push(x);
  }

  //
  changeScreen(check: string) {
    switch (check) {
      case "reg":
        this.updatePhoneDisplay("registration");
        break;
      case "block":
        this.updatePhoneDisplay("account-blocked");
        break;
      case "ftl":
        this.updatePhoneDisplay("first-login");
        break;
      default:
        this.updatePhoneDisplay("imsi-check-failed");
        break;
    }
  }

  openEndpointModal() {
    this.dialog.open(AddEditEndpointComponent, {
      data: { name: this.lookupEndpoint, value: this.endpointData },
      width: "65%",
      minWidth: "50%",
      position: { right: "40px" },
    });
  }

  editStatus(item: Record<string, string>) {
    let idx = this.lookupStatuses["matches"].indexOf(item);

    this.dialog
      .open(AddEditLookupStatusComponent, {
        data: { item: item, mappersArray: this.adapterMappers },
        width: "fit-content",
        height: "fit-content",
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp !== true) {
          this.allData["adapter"][this.endpointData["response"]["adapter"]][
            "response"
          ]["status"]["matches"].splice(idx, 1, resp);

          this.handleJsonService.updateAllJsonData(this.allData);
          this.ngOnInit();
        }
      });
  }

  viewMappers(status: string) {
    console.log(status);
  }

  addRule(element: any) {
    this.dialog.open(AddEditAdapterRuleComponent, {
      disableClose: true,
      width: "75%",
      height: "fit-content",
      maxHeight: "80%",
      position: { right: "40px" },
    });

    this.dialog.afterAllClosed.subscribe((resp) => {
      this.ngOnInit();
    });
  }

  editRule(element: any) {
    this.dialog.open(AddEditAdapterRuleComponent, {
      data: element,
      disableClose: true,
      width: "75%",
      height: "fit-content",
      maxHeight: "80%",
      position: { right: "40px" },
    });

    this.dialog.afterAllClosed.subscribe((resp) => {
      this.ngOnInit();
    });
  }

  removeRule(element: any) {
    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete the <strong>${element["name"]}</strong> rule?`,
      nzContent: "It will be permanently DELETED",
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        let index: number = this.adapterRules.indexOf(element);
        this.adapterRules.splice(index, 1);
        this.dataSource = new MatTableDataSource(this.adapterRules);
        this.ref.detectChanges();
        this.toastrService.success("Rule deleted", "Deletion Status");
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.info("Rule not deleted", "Deletion Status");
      },
    });
  }

  checkMapper(event?: Event) {
    console.log(this.ussdLookupForm["controls"]["selectedMapper"].value);

    let mapperData =
      this.adapterData[this.endpointData["response"]["adapter"]]["response"][
        "mappers"
      ][this.ussdLookupForm["controls"]["selectedMapper"].value];

    console.log(mapperData);
    let mapperKeysArr = Object.keys(mapperData);

    mapperKeysArr = mapperKeysArr.filter(
      (mapper) => mapper !== "account-details"
    );
    console.log(mapperKeysArr);

    this.mappersDataArr = [];
    mapperKeysArr.forEach((mapper) => {
      let obj = {
        keyName: mapper,
        keyValue: mapperData[mapper],
        inAccDtl: false,
      };
      this.mappersDataArr.push(obj);
    });

    let accDtlObjs = mapperData["account-details"];
    let mapperAccDtlKeysArr = Object.keys(accDtlObjs);
    console.log(mapperAccDtlKeysArr);

    mapperAccDtlKeysArr.forEach((mapper) => {
      let obj = {
        keyName: mapper,
        keyValue: accDtlObjs[mapper],
        inAccDtl: true,
      };
      this.mappersDataArr.push(obj);
    });

    this.mappersDataSource = new MatTableDataSource(this.mappersDataArr);
    this.mappersDataSource.paginator = this.mapperPaginator;
  }

  addMapperObj() {
    let adapterRulesArr = this.adapterRules.map((item) => item["name"]);
    let element = {};
    element["adapterRulesArr"] = adapterRulesArr;

    this.dialog
      .open(AddEditMapperObjComponent, {
        data: element,
        disableClose: true,
        width: "fit-content",
        height: "fit-content",
        maxHeight: "80%",
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp !== true) {
          let tempObj = {
            ...this.allData["adapter"][
              this.endpointData["response"]["adapter"]
            ]["response"]["mappers"][
              this.ussdLookupForm["controls"]["selectedMapper"].value
            ],
          };

          if (resp["inAccDtl"]) {
            tempObj["account-details"][resp["keyName"]] = resp["keyValue"];
          } else {
            tempObj[resp["keyName"]] = resp["keyValue"];
          }

          this.allData["adapter"][this.endpointData["response"]["adapter"]][
            "response"
          ]["mappers"][
            this.ussdLookupForm["controls"]["selectedMapper"].value
          ] = tempObj;
          this.handleJsonService.updateAllJsonData(this.allData);
          this.ngOnInit();
          this.checkMapper();
        }
      });
  }

  editMapperObj(element: any) {
    let adapterRulesArr = this.adapterRules.map((item) => item["name"]);
    element["adapterRulesArr"] = adapterRulesArr;
    this.dialog
      .open(AddEditMapperObjComponent, {
        data: element,
        disableClose: true,
        width: "fit-content",
        height: "fit-content",
        maxHeight: "80%",
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp !== true) {
          let tempObj = {
            ...this.allData["adapter"][
              this.endpointData["response"]["adapter"]
            ]["response"]["mappers"][
              this.ussdLookupForm["controls"]["selectedMapper"].value
            ],
          };

          if (element["inAccDtl"] === true) {
            delete tempObj["account-details"][element["keyName"]];
          } else {
            delete tempObj[element["keyName"]];
          }

          if (resp["inAccDtl"] === true) {
            tempObj["account-details"][resp["keyName"]] = resp["keyValue"];
          } else {
            tempObj[resp["keyName"]] = resp["keyValue"];
          }

          this.allData["adapter"][this.endpointData["response"]["adapter"]][
            "response"
          ]["mappers"][
            this.ussdLookupForm["controls"]["selectedMapper"].value
          ] = tempObj;
          this.handleJsonService.updateAllJsonData(this.allData);
          this.ngOnInit();
          this.checkMapper();
          this.ref.detectChanges();
        }
      });
  }

  removeMapperObj(element: any) {}

  applyFilter(event: Event, tblName: string = "rules") {
    if (tblName == "mappers") {
      const filterValue = (event.target as HTMLInputElement).value;
      this.mappersDataSource.filter = filterValue.trim().toLowerCase();
    } else {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
  }
}
