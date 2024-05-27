import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { Observable, of } from "rxjs";
import { HandleUssdJsonService } from "../../../../shared/services/handle-ussd-json.service";
import { map, catchError } from "rxjs/operators";

@Component({
  selector: "app-add-edit-adapter-rule",
  templateUrl: "./add-edit-adapter-rule.component.html",
  styleUrls: ["./add-edit-adapter-rule.component.scss"],
})
export class AddEditAdapterRuleComponent implements OnInit {
  ussdRulesForm: FormGroup;

  validationStatus: boolean;
  validationItems: any = [];
  matchesStatus: boolean;
  matchesItems: any = [];
  edittedValidationIdx: number = null;
  edittedMatchesIdx: number = null;

  allData$: Observable<Record<string, string>>;
  allData: Record<string, any>;
  adapterRules: Record<string, any>[];

  title: string;
  errorMsg: string;

  validationSource: MatTableDataSource<Record<string, string>[]>;
  validationDisplayedColumns: string[] = ["name", "type", "action"];
  matchesSource: MatTableDataSource<Record<string, string>[]>;
  matchesDisplayedColumns: string[] = ["code", "status", "action"];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public toastrService: ToastrService,
    private dialogRef: MatDialogRef<AddEditAdapterRuleComponent>,
    private handleJsonService: HandleUssdJsonService
  ) {
    this.ussdRulesForm = new FormGroup({
      name: new FormControl(this.data ? this.data["name"] : "", [
        Validators.required,
      ]),
      path: new FormControl(this.data ? this.data["path"] : "", [
        Validators.required,
      ]),
      default: new FormControl(this.data ? this.data["default"] : ""),
      formatAs: new FormControl(this.data ? this.data["format-as"] : ""),
      hasValidation: new FormControl(
        this.data && this.data["validation"] ? true : false
      ),
      validationName: new FormControl(""),
      validationType: new FormControl(""),
      hasMatches: new FormControl(
        this.data && this.data["matches"] ? true : false
      ),
      matchesCode: new FormControl(""),
      matchesStatus: new FormControl(""),
    });

    if (this.data && this.data["validation"]) {
      this.validationStatus = true;
      this.validationItems = this.data["validation"];
      this.validationSource = new MatTableDataSource(this.validationItems);
    }

    if (this.data && this.data["matches"]) {
      this.matchesStatus = true;
      this.matchesItems = this.data["matches"];
      this.matchesSource = new MatTableDataSource(this.matchesItems);
    }

    this.title = this.data ? "Edit Rule" : "Add Rule";
  }

  ngOnInit(): void {
    this.allData$ = this.handleJsonService.allJsonData$.pipe(
      map((resp: Record<string, string>): Record<string, string> => {
        if (resp) {
          this.allData = { ...resp };

          let lookupEndpoint = this.allData["config"]["api-user-profile-route"];
          let lookupApiName = this.allData["config"]["api-name"];

          let endpointData =
            this.allData["api"][lookupApiName]["request-settings"]["endpoints"][
              lookupEndpoint
            ];

          this.adapterRules =
            this.allData["adapter"][endpointData["response"]["adapter"]][
              "response"
            ]["rules"];

          return this.allData;
        }
        this.toastrService.error(
          "USSD choosen is invalid",
          "USSD Parsing Error"
        );
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
        return of({});
      })
    );
  }

  toggleValidation(event: any) {
    this.validationStatus =
      this.ussdRulesForm["controls"]["hasValidation"].value;
  }

  toggleMatches(event: any) {
    this.matchesStatus = this.ussdRulesForm["controls"]["hasMatches"].value;
  }

  addEditRule() {
    console.log(this.ussdRulesForm.value);

    let tempObj = {};

    console.log(this.ussdRulesForm.value);
    tempObj["name"] = this.ussdRulesForm["controls"]["name"].value;
    tempObj["path"] = this.ussdRulesForm["controls"]["path"].value;
    tempObj["default"] = this.ussdRulesForm["controls"]["default"].value || "";
    tempObj["format-as"] =
      this.ussdRulesForm["controls"]["formatAs"].value || "";

    if (
      this.validationStatus &&
      this.validationItems &&
      this.validationItems.length > 0
    ) {
      console.log(this.validationItems);
      tempObj["validation"] = this.validationItems;
    }

    if (
      this.matchesStatus &&
      this.matchesItems &&
      this.matchesItems.length > 0
    ) {
      console.log(this.matchesItems);
      tempObj["matches"] = this.matchesItems;
    }

    if (this.data) {
      let idx = this.adapterRules.indexOf(this.data);
      this.adapterRules.splice(idx, 1, tempObj);
      this.toastrService.success("Rule changed", "Rule Status");
    } else {
      this.adapterRules.unshift(tempObj);
      this.toastrService.success("Rule added", "Rule Status");
    }

    this.validationSource = new MatTableDataSource([]);
    this.matchesSource = new MatTableDataSource([]);
    
    this.ussdRulesForm.reset();

    this.validationStatus = false;
    this.matchesStatus = false;

    this.handleJsonService.updateAllJsonData(this.allData)
    this.dialogRef.close()
  }

  addValidation() {
    let temp = {
      name: this.ussdRulesForm["controls"]["validationName"].value,
      type: this.ussdRulesForm["controls"]["validationType"].value,
    };

    if (this.edittedValidationIdx === null) {
      this.validationItems.push(temp);
    } else {
      this.validationItems.splice(this.edittedValidationIdx, 1, temp);
      this.edittedValidationIdx = null;
    }

    this.ussdRulesForm["controls"]["validationName"].reset();
    this.ussdRulesForm["controls"]["validationType"].reset();
    this.validationSource = new MatTableDataSource(this.validationItems);
  }

  editValidation(element: Record<string, string>) {
    console.log(element);
    this.edittedValidationIdx = this.validationItems.indexOf(element);
    this.ussdRulesForm["controls"]["validationName"].setValue(element["name"]);
    this.ussdRulesForm["controls"]["validationType"].setValue(element["type"]);
  }

  removeValidation(element: Record<string, string>) {
    console.log(element);
    this.edittedValidationIdx = this.validationItems.indexOf(element);
    this.validationItems.splice(this.edittedValidationIdx, 1);
    this.validationSource = new MatTableDataSource(this.validationItems);
  }

  addMatches() {
    let temp = {
      code: this.ussdRulesForm["controls"]["matchesCode"].value,
      status: this.ussdRulesForm["controls"]["matchesStatus"].value,
    };

    if (this.edittedMatchesIdx === null) {
      this.matchesItems.push(temp);
    } else {
      this.matchesItems.splice(this.edittedMatchesIdx, 1, temp);
      this.edittedMatchesIdx = null;
    }

    this.ussdRulesForm["controls"]["matchesCode"].reset();
    this.ussdRulesForm["controls"]["matchesStatus"].reset();
    this.matchesSource = new MatTableDataSource(this.matchesItems);
  }

  editMatches(element: Record<string, string>) {
    console.log(element);
    this.edittedMatchesIdx = this.matchesItems.indexOf(element);
    this.ussdRulesForm["controls"]["matchesCode"].setValue(element["code"]);
    this.ussdRulesForm["controls"]["matchesStatus"].setValue(element["status"]);
  }

  removeMatches(element: Record<string, string>) {
    console.log(element);
    this.edittedMatchesIdx = this.matchesItems.indexOf(element);
    this.matchesItems.splice(this.edittedMatchesIdx, 1);
    this.matchesSource = new MatTableDataSource(this.matchesItems);
  }
}
