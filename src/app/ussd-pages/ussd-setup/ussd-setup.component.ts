import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NzModalService } from "ng-zorro-antd/modal";
import { ToastrService } from "ngx-toastr";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { GlobalService } from "../../shared/services/global-service.service";
import { HandleUssdJsonService } from "../../shared/services/handle-ussd-json.service";

@Component({
  selector: "app-ussd-setup",
  templateUrl: "./ussd-setup.component.html",
  styleUrls: ["./ussd-setup.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UssdSetupComponent implements OnInit {
  isLinear = false;
  configJsonData;
  apiJsonData;
  languagesArray = [];

  configsFromRedis$: Observable<Record<string, string> | string>;
  metadataKeys$: Observable<string[]>;
  apiMetadataKeys$: Observable<string[]>;

  ussdBasicDataForm: FormGroup;
  ussdSecDataForm: FormGroup;

  allData$: Observable<Record<string, string>>;
  allData: Record<string, string>;
  allPages: string[];
  allPrompts: string[];
  selectedFirstTypeList: string[] = [];
  selectedPromptList: string[] = [];
  firstPageType: string;
  errorMsg: string;

  constructor(
    private router: Router,
    private handleJsonService: HandleUssdJsonService,
    private toastrService: ToastrService // private popConfirmModal: NzModalService, // private ref: ChangeDetectorRef
  ) {
    this.ussdBasicDataForm = new FormGroup({
      ussdName: new FormControl({ value: "" || "", disabled: true }, [
        Validators.required,
      ]),
      language: new FormControl(),
      loadProfile: new FormControl(),
      authenticate: new FormControl(),
    });

    this.ussdSecDataForm = new FormGroup({
      firstPageType: new FormControl(),
      firstPage: new FormControl(),
      firstPromptStep: new FormControl({ value: "", disabled: true }),
    });
  }

  ngOnInit(): void {
    try {
      this.allData$ = this.handleJsonService.allJsonData$.pipe(
        map((resp: Record<string, string>): Record<string, string> => {
          if (resp) {
            this.allData = { ...resp };
            let langArr = new Set();

            for (let key in resp) {
              if (key === "config") {
                this.configJsonData = resp[key];
                this.configsFromRedis$ = of(this.configJsonData["meta-data"]);

                let appName = sessionStorage.getItem("appName");
                let choosenLanguage = this.configJsonData["language"];
                let loadProfile = this.configJsonData["do-not-load-profile"];
                let firstPage =
                  this.configJsonData["page-switch-check"]["options"]["client"][
                    "page"
                  ];
                let authenticate = this.configJsonData["authenticate"];
                this.firstPageType =
                  firstPage.indexOf("page") !== -1 ? "Page" : "Prompt";

                this.ussdBasicDataForm.setValue({
                  ussdName: appName,
                  language: choosenLanguage,
                  loadProfile: !loadProfile,
                  authenticate: authenticate,
                });

                this.ussdSecDataForm.setValue({
                  firstPageType: this.firstPageType,
                  firstPage: firstPage,
                  firstPromptStep: firstPage,
                });

                let pageOne =
                  this.configJsonData["page-switch-check"]["options"]["client"][
                    "page"
                  ];
                sessionStorage.setItem("pageOne", pageOne);
              }

              if (key === "language") {
                let keys = Object.keys(this.allData[key]);

                keys.map((item) => {
                  let objLangs = Object.keys(this.allData[key][item]);
                  objLangs.map((lang) => langArr.add(lang));
                });
                this.languagesArray = Array.from(langArr);
              }

              if (key === "pages") {
                this.allPages = Object.keys(this.allData["pages"]);
              }

              if (key === "prompts") {
                this.allPrompts = Object.keys(this.allData["prompts"]);
              }
            }

            this.onChange(this.firstPageType);
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
            this.toastrService.error(this.errorMsg, "Redis Error -Setup");
          } else {
            this.errorMsg = `Error: ${error.message}`;

            this.toastrService.error(this.errorMsg, "Redis Error -Setup");
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

  onChange(value: any) {
    console.log(value);

    let type = value;
    this.selectedFirstTypeList = [];

    if (type === "Page") {
      this.selectedFirstTypeList = this.allPages;
    } else if (type === "Prompt") {
      this.selectedFirstTypeList = this.allPrompts;
    }
  }

  selectPromptStep(event: any) {
    if (
      this.ussdSecDataForm["controls"]["firstPageType"]["value"] == "Prompt"
    ) {
      let firstStep: any = this.allData["prompts"][event.value];
      console.log(firstStep);
      let item = "";
      if (!!firstStep.length) {
        item = firstStep[0]["name"];
      } else {
        item = firstStep["name"];
      }
      this.ussdSecDataForm.controls["firstPromptStep"].setValue(item);
    } else {
      this.ussdSecDataForm.controls["firstPromptStep"].setValue(event.value);
    }
  }

  toggleAuth() {
    let authFlag = this.ussdBasicDataForm.controls["authenticate"].value;

    if (authFlag) {
      this.selectedFirstTypeList = this.allPrompts;

      this.ussdSecDataForm["controls"]["firstPageType"].setValue("Prompt");
      this.ussdSecDataForm["controls"]["firstPage"].setValue("login");
      this.ussdSecDataForm["controls"]["firstPromptStep"].setValue("login");

      this.ussdSecDataForm["controls"]["firstPageType"].disable();
      this.ussdSecDataForm["controls"]["firstPage"].disable();
    } else {
      this.ussdSecDataForm["controls"]["firstPageType"].enable();
      this.ussdSecDataForm["controls"]["firstPage"].enable();
    }
  }

  submit() {
    this.configJsonData["language"] = this.ussdBasicDataForm.controls[
      "language"
    ].value
      ? this.ussdBasicDataForm.controls["language"].value
      : this.configJsonData["language"];

    this.configJsonData["do-not-load-profile"] =
      !this.ussdBasicDataForm.controls["loadProfile"].value;
    this.configJsonData["authenticate"] =
      this.ussdBasicDataForm.controls["authenticate"].value;

    this.configJsonData["page-switch-check"]["options"]["client"]["page"] = this
      .ussdSecDataForm.controls["firstPromptStep"].value
      ? this.ussdSecDataForm.controls["firstPromptStep"].value
      : this.configJsonData["page-switch-check"]["options"]["client"]["page"];

    sessionStorage.setItem(
      "pageOne",
      this.configJsonData["page-switch-check"]["options"]["client"]["page"]
    );

    this.allData["config"] = this.configJsonData;

    this.handleJsonService.updateAllJsonData(this.allData);

    if (this.configJsonData["do-not-load-profile"] == true) {
      this.router.navigate(["/ussd/ussd-simulator"]);
    } else {
      this.router.navigate(["/ussd/ussd-adapter"]);
    }
  }
}
