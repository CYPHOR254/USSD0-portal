import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { NzModalService } from "ng-zorro-antd/modal";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GlobalService } from "../../../../shared/services/global-service.service";
import { HandleUssdJsonService } from "../../../../shared/services/handle-ussd-json.service";
import { AddEditEndpointComponent } from "../../../ussd-endpoints/components/add-edit-endpoint/add-edit-endpoint.component";
import { UssdSimulatorService } from "../../services/ussd-simulator-service.service";

@Component({
  selector: "app-add-edit-prompt-step",
  templateUrl: "./add-edit-prompt-step.component.html",
  styleUrls: ["./add-edit-prompt-step.component.scss"],
})
export class AddEditPromptStepComponent implements OnInit {
  public basicForm: FormGroup;
  public optionsForm: FormGroup = new FormGroup({});
  public navigateForm: FormGroup;
  public advancedForm: FormGroup;
  public validationForm: FormGroup;

  title: string;
  formData: Record<string, string | string[]>;

  existingData$: Observable<Record<string, string>>;
  allJSON: Record<string, string>;
  promptData: Record<string, string>[] = [];

  //array variables for our select html tags
  allPagesArray: string[];
  allPromptsArray: string[];
  allPromptStepsArray: string[] = [];
  allPromptPagesStepsArray: string[] = [];
  allExistingOptionsInConfig: string[] = [];
  allExistingRoutes: string[] = [];
  allValidatorFunctions: string[] = GlobalService.allvalidators;

  //array for validators, options, cache parameters
  customOptionsArr: Record<string, string>[] = [];
  validationParamsArr: Record<string, string>[] = [];
  multErrsArr: Record<string, string>[] = [];
  cacheParamsArr: Record<string, string>[] = [];

  //control variables
  userSelectedType: string;
  selectedOptionType: string;
  selectedExistingOptions: string;
  isLoading: boolean;
  validationStatus: boolean;
  cacheStatus: boolean = false;

  //Mat-table meta-data
  customOptionsDataSource: MatTableDataSource<Record<string, string>> =
    new MatTableDataSource<Record<string, string>>([]);
  customOptionsColumns: string[] = ["label", "value", "jump-to", "action"];

  validatorsDataSource: MatTableDataSource<Record<string, string>> =
    new MatTableDataSource<Record<string, string>>([]);
  validatorsDisplayedColumns: string[] = [
    "name",
    "type",
    "arguments",
    "action",
  ];

  multErrorsDataSource: MatTableDataSource<Record<string, string>> =
    new MatTableDataSource<Record<string, string>>([]);
  multErrorsDisplayedColumns: string[] = [
    "name",
    "value",
    "errorFor",
    "action",
  ];

  cacheParamsDataSource: MatTableDataSource<Record<string, string>> =
    new MatTableDataSource<Record<string, string>>([]);
  cacheParamsDisplayedColumns: string[] = [
    "path",
    "save-as",
    "format-as",
    "action",
  ];

  //mat-select autocomplete
  filteredOptions: Observable<string[]>;

  // constructor(
  //   @Inject(MAT_DIALOG_DATA) public data: any,
  //   private handleJsonData: HandleUssdJsonService,
  //   public toastrService: ToastrService,
  //   private popConfirmModal: NzModalService,
  //   public dialog: MatDialog,
  //   private ussdSimulatorService: UssdSimulatorService,
  //   private dialogRef: MatDialogRef<AddEditPromptStepComponent>,
  //   private ref: ChangeDetectorRef
  // ) {
  //   this.formData = this.data["promptData"] as Record<string, string>;
  //   this.title = this.formData ? "Edit existing step" : "Add new step";

  //   this.basicForm = new FormGroup({
  //     type: new FormControl(this.formData ? this.formData["type"] : "", [
  //       Validators.required,
  //     ]),
  //     name: new FormControl(this.formData ? this.formData["name"] : "", [
  //       Validators.required,
  //       Validators.pattern(GlobalService.nameRegex),
  //     ]),
  //     errorMsg: new FormControl("", [Validators.required]),
  //     title: new FormControl("", [Validators.required]),
  //   });

  //   this.navigateForm = new FormGroup({
  //     previous: new FormControl(this.formData ? this.formData["previous"] : ""),
  //     next: new FormControl(this.formData ? this.formData["next"] : ""),
  //     hasApi: new FormControl(
  //       this.formData && this.formData["external-fetch"] ? true : false
  //     ),
  //     accept: new FormControl(this.formData ? this.formData["on-accept"] : ""),
  //     cancel: new FormControl(this.formData ? this.formData["on-cancel"] : ""),
  //     "save-as": new FormControl(this.formData ? this.formData["save-as"] : ""),
  //     action: new FormControl(this.formData ? this.formData["action"] : "", [
  //       Validators.required,
  //     ]),
  //   });

  //   this.validationForm = new FormGroup({
  //     validationName: new FormControl(""),
  //     validationType: new FormControl(""),
  //     validationArguments: new FormControl(""),
  //   });

  //   this.advancedForm = new FormGroup({
  //     route: new FormControl(
  //       this.formData && this.formData["external-fetch"]
  //         ? this.formData["external-fetch"]["route"]
  //         : "",
  //       [Validators.required]
  //     ),
  //     success: new FormControl(
  //       this.formData && this.formData["external-fetch"]
  //         ? this.formData["external-fetch"]["success"]
  //         : "",
  //       [Validators.required]
  //     ),
  //     error: new FormControl(
  //       this.formData && this.formData["external-fetch"]
  //         ? this.formData["external-fetch"]["error"]
  //         : "",
  //       [Validators.required]
  //     ),
  //     cache: new FormControl(
  //       this.formData &&
  //       this.formData["external-fetch"] &&
  //       this.formData["external-fetch"]["cache"] !== undefined
  //         ? true
  //         : false,
  //       [Validators.required]
  //     ),
  //   });
  // }
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private handleJsonData: HandleUssdJsonService,
    public toastrService: ToastrService,
    private popConfirmModal: NzModalService,
    public dialog: MatDialog,
    private ussdSimulatorService: UssdSimulatorService,
    private dialogRef: MatDialogRef<AddEditPromptStepComponent>,
    private ref: ChangeDetectorRef
  ) {
    this.formData = this.data["promptData"] as Record<string, string>;
    this.title = this.formData ? "Edit existing step" : "Add new step";

    const type = this.formData ? this.formData["type"] : "";
    const name = this.formData ? this.formData["name"] : "";

    this.basicForm = new FormGroup({
      type: new FormControl(type, [Validators.required]),
      name: new FormControl(name, [
        Validators.required,
        Validators.pattern(GlobalService.nameRegex),
      ]),
      errorMsg: new FormControl("", [Validators.required]),
      title: new FormControl("", [Validators.required]),
    });

    const previous = this.formData ? this.formData["previous"] : "";
    const next = this.formData ? this.formData["next"] : "";
    const hasApi =
      this.formData && this.formData["external-fetch"] ? true : false;
    const accept = this.formData ? this.formData["on-accept"] : "";
    const cancel = this.formData ? this.formData["on-cancel"] : "";
    const saveAs = this.formData ? this.formData["save-as"] : "";
    const action = this.formData ? this.formData["action"] : "";

    this.navigateForm = new FormGroup({
      previous: new FormControl(previous),
      next: new FormControl(next),
      hasApi: new FormControl(hasApi),
      accept: new FormControl(accept),
      cancel: new FormControl(cancel),
      "save-as": new FormControl(saveAs),
      action: new FormControl(action, [Validators.required]),
    });

    this.validationForm = new FormGroup({
      validationName: new FormControl(""),
      validationType: new FormControl(""),
      validationArguments: new FormControl(""),
    });

    const route =
      this.formData && this.formData["external-fetch"]
        ? this.formData["external-fetch"]["route"]
        : "";
    const success =
      this.formData && this.formData["external-fetch"]
        ? this.formData["external-fetch"]["success"]
        : "";
    const error =
      this.formData && this.formData["external-fetch"]
        ? this.formData["external-fetch"]["error"]
        : "";
    const cache =
      this.formData &&
      this.formData["external-fetch"] &&
      this.formData["external-fetch"]["cache"] !== undefined;

    this.advancedForm = new FormGroup({
      route: new FormControl(route, [Validators.required]),
      success: new FormControl(success, [Validators.required]),
      error: new FormControl(error, [Validators.required]),
      cache: new FormControl(cache, [Validators.required]),
    });
  }

  // ngOnInit(): void {
  //   console.log(this.data);
  //   this.existingData$ = this.handleJsonData.allJsonData$.pipe(
  //     map((resp: Record<string, string>) => {
  //       if (resp) {
  //         this.allJSON = { ...resp };
  //         console.log(this.allJSON);

  //         if (
  //           this.allJSON["prompts"][this.data["promptName"] as string]
  //             .length === undefined
  //         ) {
  //           this.promptData.push(
  //             this.allJSON["prompts"][this.data["promptName"] as string]
  //           );
  //           console.log(this.promptData);
  //         } else {
  //           this.promptData =
  //             this.allJSON["prompts"][this.data["promptName"] as string];

  //           console.log(this.promptData);
  //         }

  //         this.allPagesArray = Object.keys(this.allJSON["pages"]);
  //         this.allPromptsArray = Object.keys(this.allJSON["prompts"]);

  //         //Fetch all exiting options in config.json
  //         let allOptionsInConfig = this.allJSON["config"]["global-constants"];
  //         let allOptionsInConfigKeys = Object.keys(allOptionsInConfig);
  //         let tempArrOptions = allOptionsInConfigKeys.filter(
  //           (option) => typeof allOptionsInConfig[option] !== "number"
  //         );
  //         this.allExistingOptionsInConfig = [...tempArrOptions];

  //         //Fetch all existing routes in api.json
  //         let apiKey = Object.keys(this.allJSON["api"])[0];
  //         let allEndpoints =
  //           this.allJSON["api"][apiKey]["request-settings"]["endpoints"] ||
  //           this.allJSON["api"]["request-settings"]["endpoints"];
  //         this.allExistingRoutes = Object.keys(allEndpoints);

  //         //Get all steps in the current prompt
  //         if (this.promptData.length > 0) {
  //           this.promptData.map((step) => {
  //             this.allPromptStepsArray.push(step["name"]);
  //           });
  //         } else {
  //           console.warn(this.promptData);
  //           console.warn(this.promptData?.length);
  //           let firstPage = sessionStorage.getItem("pageOne");
  //           this.navigateForm.controls["previous"].setValue(firstPage);
  //         }

  //         this.allPromptPagesStepsArray = [
  //           ...this.allPagesArray,
  //           ...this.allPromptsArray,
  //           ...this.allPromptStepsArray,
  //         ];

  //         console.log(this.allPromptPagesStepsArray);

  //         if (this.formData) {
  //           let title = this.handleJsonData.getKeyFromLang(
  //             this.allJSON,
  //             this.formData["name"] as string
  //           );
  //           // this.basicForm.controls["title"].setValue(title);
  //           if (this.formData["type"] !== "skip") {
  //             this.basicForm.controls["title"].setValue(title);
  //           } else {
  //             this.basicForm.controls["title"].setValue("This is a SKIP step");
  //           }

  //           if (this.formData["error"] !== undefined) {
  //             console.log(this.formData["error"]);

  //             let errMsg = this.handleJsonData.getKeyFromLang(
  //               this.allJSON,
  //               this.formData["error"] as string
  //             );
  //             console.log(errMsg, "is the err msg");
  //             this.basicForm.controls["errorMsg"].setValue(errMsg);
  //           }
  //         }
  //         this.checkStepType();

  //         return resp;
  //       }
  //       throw new Error("Could not load data");
  //     })
  //   );
  // }

  ngOnInit(): void {
    console.log(this.data);
    this.existingData$ = this.handleJsonData.allJsonData$.pipe(
      map((resp: Record<string, string>) => {
        if (!resp) {
          throw new Error("Could not load data");
        }

        this.allJSON = { ...resp };
        console.log(this.allJSON);

        const promptName = this.data["promptName"] as string;
        const prompt = this.allJSON["prompts"][promptName];

        if (prompt && Array.isArray(prompt)) {
          this.promptData = prompt;
        } else if (prompt) {
          this.promptData.push(prompt);
        }

        console.log(this.promptData);

        this.allPagesArray = Object.keys(this.allJSON["pages"]);
        this.allPromptsArray = Object.keys(this.allJSON["prompts"]);

        // Fetch all existing options in config.json
        const allOptionsInConfig = this.allJSON["config"]["global-constants"];
        this.allExistingOptionsInConfig = Object.keys(
          allOptionsInConfig
        ).filter((option) => typeof allOptionsInConfig[option] !== "number");

        // Fetch all existing routes in api.json
        const apiKey = Object.keys(this.allJSON["api"])[0];
        const allEndpoints =
          this.allJSON["api"][apiKey]?.["request-settings"]?.["endpoints"] ||
          this.allJSON["api"]?.["request-settings"]?.["endpoints"];
        this.allExistingRoutes = Object.keys(allEndpoints || {});

        // Get all steps in the current prompt
        if (this.promptData.length > 0) {
          this.allPromptStepsArray = this.promptData.map(
            (step) => step["name"]
          );
        } else {
          console.warn(this.promptData);
          console.warn(this.promptData?.length);
          const firstPage = sessionStorage.getItem("pageOne");
          this.navigateForm.controls["previous"].setValue(firstPage);
        }

        this.allPromptPagesStepsArray = [
          ...this.allPagesArray,
          ...this.allPromptsArray,
          ...this.allPromptStepsArray,
        ];

        console.log(this.allPromptPagesStepsArray);

        if (this.formData) {
          const name = this.formData["name"] as string;
          const title = this.handleJsonData.getKeyFromLang(this.allJSON, name);

          if (this.formData["type"] !== "skip") {
            this.basicForm.controls["title"].setValue(title);
          } else {
            this.basicForm.controls["title"].setValue("This is a SKIP step");
          }

          if (this.formData["error"] !== undefined) {
            console.log(this.formData["error"]);

            const errorMsg = this.handleJsonData.getKeyFromLang(
              this.allJSON,
              this.formData["error"] as string
            );
            console.log(errorMsg, "is the err msg");
            this.basicForm.controls["errorMsg"].setValue(errorMsg);
          } else if (this.formData["errors"] !== undefined) {
            let allErrors = [...(this.formData["errors"] as string[])];
            this.basicForm.controls["errorMsg"].disable();
            this.basicForm.addControl(
              "errorName",
              new FormControl("", [Validators.required])
            );
            this.basicForm.addControl(
              "errorValue",
              new FormControl("", [Validators.required])
            );

            this.multErrsArr = [];
            allErrors.forEach((err, idx) => {
              let tempObj = {};
              tempObj["name"] = err;
              const errorMsg = this.handleJsonData.getKeyFromLang(
                this.allJSON,
                err as string
              );
              tempObj["value"] = errorMsg;
              // this.validationParamsArr[idx]['name']
              // tempObj['errorFor'] = this.validationParamsArr[idx]['name'];
              this.multErrsArr.push(tempObj);
            });

            console.log(this.multErrsArr);

            this.multErrorsDataSource = new MatTableDataSource(
              this.multErrsArr
            );
          }
        }

        this.checkStepType();

        return resp;
      })
    );
  }

  // checkStepType() {
  //   this.userSelectedType = this.basicForm.controls["type"].value;
  //   let optionType: string;

  //   if (this.formData) {
  //     if (typeof this.formData["options"] === "object") {
  //       optionType = "manual";
  //     } else if (typeof this.formData["options"] === "string") {
  //       if (
  //         this.allExistingOptionsInConfig.includes(this.formData["options"])
  //       ) {
  //         optionType = "existing";
  //       } else {
  //         optionType = "from_api";
  //       }
  //     } else {
  //       optionType = "manual";
  //     }
  //   }

  //   if (this.userSelectedType === "select") {
  //     this.optionsForm.addControl(
  //       "optionType",
  //       new FormControl(this.formData ? optionType : "", [
  //         this.basicForm.controls["type"].value == "select"
  //           ? Validators.required
  //           : Validators.nullValidator,
  //       ])
  //     );
  //     this.setOptionType();
  //   } else if (this.userSelectedType === "input") {
  //     this.navigateForm.addControl(
  //       "validation",
  //       new FormControl(
  //         this.formData && this.formData["validation"] ? true : false,
  //         [Validators.required]
  //       )
  //     );

  //     if (this.formData && this.formData["validation"]) {
  //       this.validationParamsArr = this.formData[
  //         "validation"
  //       ] as unknown as Record<string, string>[];
  //     } else {
  //       this.validationParamsArr = [];
  //     }

  //     this.validatorsDataSource = new MatTableDataSource(
  //       this.validationParamsArr
  //     );

  //     this.toggleValidation();
  //   } else if (this.userSelectedType === "skip") {
  //     this.navigateForm.controls["hasApi"].setValue(true);
  //     this.cacheRequest();
  //   }
  //   this.cacheRequest();
  // }

  checkStepType() {
    this.userSelectedType = this.basicForm.controls["type"].value;

    let optionType: string;

    if (this.formData) {
      const options = this.formData["options"];

      if (typeof options === "object") {
        optionType = "manual";
      } else if (typeof options === "string") {
        if (this.allExistingOptionsInConfig.includes(options)) {
          optionType = "existing";
        } else {
          optionType = "from_api";
        }
      } else {
        optionType = "manual";
      }
    }

    if (this.userSelectedType === "select") {
      const optionTypeControl = new FormControl(
        this.formData ? optionType : ""
      );

      this.optionsForm.addControl("optionType", optionTypeControl);
      this.setOptionType();
    } else if (this.userSelectedType === "input") {
      const validationControl = new FormControl(!!this.formData?.validation, [
        Validators.required,
      ]);

      this.navigateForm.addControl("validation", validationControl);

      if (this.formData && this.formData["validation"]) {
        this.validationParamsArr = this.formData[
          "validation"
        ] as unknown as Record<string, string>[];

        if (this.basicForm.controls["errorMsg"].disabled) {
          if (this.validationParamsArr.length <= this.multErrsArr.length) {
            this.multErrsArr.forEach((err, idx) => {
              err["errorFor"] =
                this.validationParamsArr[idx] !== undefined
                  ? this.validationParamsArr[idx]["name"]
                  : "NULL";
            });
          }
        }
      } else {
        this.validationParamsArr = [];
      }

      this.validatorsDataSource = new MatTableDataSource(
        this.validationParamsArr
      );

      this.toggleValidation();
    } else if (this.userSelectedType === "skip") {
      this.navigateForm.controls["hasApi"].setValue(true);
      this.cacheRequest();
    }

    this.cacheRequest();
  }

  // setOptionType() {
  //   this.isLoading = true;
  //   this.validationStatus = false;

  //   this.selectedOptionType =
  //     this.optionsForm.controls["optionType"].value !== null
  //       ? this.optionsForm.controls["optionType"].value.toLowerCase()
  //       : "";

  //   if (this.selectedOptionType === "manual") {
  //     this.optionsForm.addControl("optionLabel", new FormControl(""));
  //     this.optionsForm.addControl("optionValue", new FormControl(""));
  //     this.optionsForm.addControl("optionJump", new FormControl(""));

  //     this.customOptionsArr = [];

  //     if (this.formData && typeof this.formData["options"] === "object") {
  //       this.customOptionsArr = this.formData["options"] as unknown as Record<
  //         string,
  //         string
  //       >[];
  //     }

  //     this.customOptionsDataSource = new MatTableDataSource(
  //       this.customOptionsArr
  //     );
  //   } else if (this.selectedOptionType === "existing") {
  //     this.optionsForm.addControl(
  //       "existingOption",
  //       new FormControl(this.formData ? this.formData["options"] : "", [
  //         this.optionsForm.controls["optionType"].value === "existing"
  //           ? Validators.required
  //           : Validators.nullValidator,
  //       ])
  //     );
  //   } else if (this.selectedOptionType === "from_api") {
  //     this.optionsForm.addControl(
  //       "apiOption",
  //       new FormControl(this.formData ? this.formData["options"] : "", [
  //         this.optionsForm.controls["optionType"].value === "from_api"
  //           ? Validators.required
  //           : Validators.nullValidator,
  //         ,
  //       ])
  //     );

  //     let errMsg: string;
  //     if (this.formData) {
  //       errMsg = this.handleJsonData.getKeyFromLang(
  //         this.allJSON,
  //         this.formData["options-error"] as string
  //       );
  //     }

  //     this.optionsForm.addControl(
  //       "optionError",
  //       new FormControl(this.formData ? errMsg : "", [
  //         this.optionsForm.controls["optionType"].value === "from_api"
  //           ? Validators.required
  //           : Validators.nullValidator,
  //         ,
  //       ])
  //     );
  //     this.validationStatus = false;
  //   } else {
  //     this.toastrService.warning("Invalid options");
  //   }

  //   this.isLoading = false;
  // }

  //if input has validation then show table

  setOptionType() {
    this.isLoading = true;
    this.validationStatus = false;

    this.selectedOptionType = (
      this.optionsForm.controls["optionType"].value ?? ""
    ).toLowerCase();

    this.optionsForm.removeControl("optionLabel");
    this.optionsForm.removeControl("optionValue");
    this.optionsForm.removeControl("optionJump");
    this.optionsForm.removeControl("existingOption");
    this.optionsForm.removeControl("apiOption");
    this.optionsForm.removeControl("optionError");

    if (this.selectedOptionType === "manual") {
      this.optionsForm.addControl("optionLabel", new FormControl(""));
      this.optionsForm.addControl("optionValue", new FormControl(""));
      this.optionsForm.addControl("optionJump", new FormControl(""));

      this.customOptionsArr =
        this.formData && typeof this.formData["options"] === "object"
          ? (this.formData["options"] as unknown as Record<string, string>[])
          : [];

      this.customOptionsDataSource = new MatTableDataSource(
        this.customOptionsArr
      );
    } else if (this.selectedOptionType === "existing") {
      this.optionsForm.addControl(
        "existingOption",
        new FormControl(this.formData?.options ?? "", [
          this.selectedOptionType === "existing"
            ? Validators.required
            : Validators.nullValidator,
        ])
      );
    } else if (this.selectedOptionType === "from_api") {
      this.optionsForm.addControl(
        "apiOption",
        new FormControl(this.formData?.options ?? "", [
          this.selectedOptionType === "from_api"
            ? Validators.required
            : Validators.nullValidator,
        ])
      );

      const errMsg = this.formData
        ? this.handleJsonData.getKeyFromLang(
            this.allJSON,
            this.formData["options-error"] as string
          )
        : "";

      this.optionsForm.addControl(
        "optionError",
        new FormControl(errMsg, [
          this.selectedOptionType === "from_api"
            ? Validators.required
            : Validators.nullValidator,
        ])
      );
      this.validationStatus = false;
    } else {
      this.toastrService.warning("Invalid options");
    }

    this.isLoading = false;
  }

  toggleValidation(event?: Event) {
    this.validationStatus = this.navigateForm.controls["validation"].value;
  }

  toggleMultiErrors(event?: Event) {
    if (this.basicForm.controls["errorMsg"].disabled) {
      this.basicForm.controls["errorMsg"].enable();
    } else {
      this.basicForm.addControl(
        "errorName",
        new FormControl("", [Validators.required])
      );
      this.basicForm.addControl(
        "errorValue",
        new FormControl("", [Validators.required])
      );

      this.basicForm.controls["errorMsg"].disable();
    }
  }

  //if an existing option is choosen
  setExistingOption(event?: Event) {
    this.selectedExistingOptions =
      this.optionsForm.controls["existingOption"].value;
  }

  // //the setAutoComplete & _filter methods aid in the auto-complete feature for our mat-select.
  // setAutoComplete(control: string) {
  //   if (control === "route" || control === "success" || control === "error") {
  //     this.filteredOptions = this.advancedForm.controls[
  //       control
  //     ].valueChanges.pipe(
  //       startWith(""),
  //       map((value) => this._filter(value || "", control))
  //     );
  //   } else if (control === "validationName") {
  //     this.filteredOptions = this.validationForm.controls[
  //       control
  //     ].valueChanges.pipe(
  //       startWith(""),
  //       map((value) => this._filter(value || "", control))
  //     );
  //   } else {
  //     this.filteredOptions = this.navigateForm.controls[
  //       control
  //     ].valueChanges.pipe(
  //       startWith(""),
  //       map((value) => this._filter(value || ""))
  //     );
  //   }
  // }
  setAutoComplete(control: string) {
    let formGroup;

    if (control === "route" || control === "success" || control === "error") {
      formGroup = this.advancedForm.controls[control];
    } else if (control === "validationName") {
      formGroup = this.validationForm.controls[control];
    } else {
      formGroup = this.navigateForm.controls[control];
    }

    this.filteredOptions = formGroup.valueChanges.pipe(
      startWith(""),
      map((value: string) => this._filter(value || "", control))
    );
  }

  private _filter(value: string, type?: string): string[] {
    const filterValue = value.toLowerCase();
    let tempArr = [];

    if (type === "validationName") {
      tempArr = [...this.allValidatorFunctions];
    } else if (type === "route") {
      tempArr = [...this.allExistingRoutes];
    } else {
      tempArr = [...this.allPromptPagesStepsArray];
    }

    return tempArr.filter((option) =>
      option?.toLowerCase().includes(filterValue)
    );
  }

  // //add custom-option method
  // addOptionToArray(formData: Record<string, string>) {
  //   console.log(formData);
  //   formData["optionJump"] =
  //     formData["optionJump"] !== null
  //       ? formData["optionJump"].trim()
  //       : formData["optionJump"];

  //   if (
  //     formData["optionLabel"] == null ||
  //     formData["optionValue"] == null ||
  //     formData["optionLabel"] == "" ||
  //     formData["optionValue"] == ""
  //   ) {
  //     this.toastrService.error(
  //       "Cannot add a null option",
  //       "Option Addition Error"
  //     );
  //   } else {
  //     let optionObj = {
  //       label: formData["optionLabel"],
  //       value: formData["optionValue"],
  //     };

  //     if (formData["optionJump"] !== null && formData["optionJump"] !== "") {
  //       optionObj["jump-to"] = formData["optionJump"];
  //     }

  //     this.customOptionsArr.push(optionObj);
  //     this.customOptionsDataSource = new MatTableDataSource(
  //       this.customOptionsArr
  //     );
  //     this.optionsForm.controls["optionLabel"].reset();
  //     this.optionsForm.controls["optionValue"].reset();
  //     this.optionsForm.controls["optionJump"].reset();
  //   }
  // }

  addOptionToArray(formData: Record<string, string>) {
    console.log(formData);
    formData.optionJump = formData.optionJump?.trim();

    if (
      formData.optionLabel == null ||
      formData.optionValue == null ||
      formData.optionLabel === "" ||
      formData.optionValue === ""
    ) {
      this.toastrService.error(
        "Cannot add a null option",
        "Option Addition Error"
      );
    } else {
      const optionObj = {
        label: formData.optionLabel,
        value: formData.optionValue,
      };

      if (formData.optionJump) {
        optionObj["jump-to"] = formData.optionJump;
      }

      this.customOptionsArr.push(optionObj);
      this.customOptionsDataSource.data = this.customOptionsArr;
      this.optionsForm.get("optionLabel")?.reset();
      this.optionsForm.get("optionValue")?.reset();
      this.optionsForm.get("optionJump")?.reset();
    }
  }

  // //add validators to type input
  // addValidators(formData: Record<string, string>) {
  //   console.log(formData);

  //   if (
  //     formData["validationName"] === null ||
  //     formData["validationName"] === "" ||
  //     formData["validationType"] === null ||
  //     formData["validationType"] === ""
  //   ) {
  //     this.toastrService.error(
  //       "Cannot add a null cache parameter object",
  //       "Cache Parameter Addition Status"
  //     );
  //   } else {
  //     let newObj: Record<string, string> = {
  //       name: formData["validationName"],
  //       type: formData["validationType"],
  //     };

  //     if (
  //       formData["validationArguments"] !== null &&
  //       formData["validationArguments"] !== ""
  //     ) {
  //       newObj["arguments"] = formData["validationArguments"];
  //     }

  //     this.validationParamsArr?.push(newObj);
  //     console.log(this.validationParamsArr);
  //     this.validatorsDataSource = new MatTableDataSource(
  //       this.validationParamsArr
  //     );

  //     this.validationForm.controls["validationName"].reset();
  //     this.validationForm.controls["validationType"].reset();
  //     this.validationForm.controls["validationArguments"].reset();
  //   }
  // }
  addValidators(formData: Record<string, string>) {
    console.log(formData);

    if (!formData.validationName || !formData.validationType) {
      this.toastrService.error(
        "Cannot add a null cache parameter object",
        "Cache Parameter Addition Status"
      );
    } else {
      const newObj: Record<string, string> = {
        name: formData.validationName,
        type: formData.validationType,
      };

      if (formData.validationArguments) {
        newObj.arguments = formData.validationArguments;
      }

      this.validationParamsArr.push(newObj);
      console.log(this.validationParamsArr);
      this.validatorsDataSource.data = this.validationParamsArr;

      this.validationForm.get("validationName")?.reset();
      this.validationForm.get("validationType")?.reset();
      this.validationForm.get("validationArguments")?.reset();
    }
  }

  addMultiErrors(formData: Record<string, string>) {
    console.log(formData);

    if (!formData.errorName || !formData.errorValue) {
      this.toastrService.error(
        "Cannot add a null error object",
        "Error Addition Status"
      );
    } else {
      let keyValue = this.handleJsonData.getKeyValueInstancesFromLang(
        this.allJSON,
        formData.errorName,
        this.data["promptName"]
      );
      console.log(keyValue, "kv");

      const newObj: Record<string, string> = {
        name: formData.errorName,
        value: formData.errorValue,
      };

      this.multErrsArr.push(newObj);
      console.log(this.multErrsArr);
      this.multErrorsDataSource.data = this.multErrsArr;

      this.basicForm.get("errorName")?.reset();
      this.basicForm.get("errorValue")?.reset();

      let updatedErrors = [...(this.formData["errors"] as string[])];
      let updatedErrorsSet = new Set(updatedErrors);
      updatedErrorsSet.add(newObj["name"]);
      this.formData["errors"] = Array.from(updatedErrorsSet);

      let lang = this.allJSON["config"]["language"];
      this.allJSON["language"][this.data["promptName"]][lang][newObj["name"]] =
        newObj["value"];
      this.handleJsonData.updateAllJsonData(this.allJSON);
      this.toastrService.success(
        "Error String Updated Succesfully",
        "Error Update Status"
      );
    }
  }

  // //add cache parameters
  // addCacheParameters(formData: Record<string, string>) {
  //   if (
  //     formData["path"] === null ||
  //     formData["path"] === "" ||
  //     formData["save-as"] === null ||
  //     formData["save-as"] === ""
  //   ) {
  //     this.toastrService.error(
  //       "Cannot add a null cache parameter object",
  //       "Cache Parameter Addition Status"
  //     );
  //   } else {
  //     let newObj: Record<string, string> = {
  //       path: formData["path"],
  //       "save-as": formData["save-as"],
  //     };

  //     if (formData["format-as"] !== null && formData["format-as"] !== "") {
  //       newObj["format-as"] = formData["format-as"];
  //     }

  //     this.cacheParamsArr.push(newObj);
  //     console.log(this.cacheParamsArr);
  //     this.cacheParamsDataSource = new MatTableDataSource(this.cacheParamsArr);

  //     this.advancedForm.controls["path"].reset();
  //     this.advancedForm.controls["save-as"].reset();
  //     this.advancedForm.controls["format-as"].reset();
  //   }
  // }
  addCacheParameters(formData: Record<string, string>) {
    if (!formData.path || !formData["save-as"]) {
      this.toastrService.error(
        "Cannot add a null cache parameter object",
        "Cache Parameter Addition Status"
      );
    } else {
      const newObj: Record<string, string> = {
        path: formData.path,
        "save-as": formData["save-as"],
      };

      if (formData["format-as"]) {
        newObj["format-as"] = formData["format-as"];
      }

      this.cacheParamsArr.push(newObj);
      console.log(this.cacheParamsArr);
      this.cacheParamsDataSource.data = this.cacheParamsArr;

      this.advancedForm.get("path")?.reset();
      this.advancedForm.get("save-as")?.reset();
      this.advancedForm.get("format-as")?.reset();
    }
  }

  //edit an item in a table
  // editRecord(option: Record<string, string>, arr: string) {
  //   //We either change our options, validators or cache-parameters.
  //   if (arr === "options") {
  //     let idx = this.customOptionsArr.indexOf(option);
  //     this.customOptionsArr.splice(idx, 1);
  //     this.optionsForm.controls["optionLabel"].setValue(option["label"]);
  //     this.optionsForm.controls["optionValue"].setValue(option["value"]);
  //     this.optionsForm.controls["optionJump"].setValue(
  //       option["jump-to"].trim()
  //     );
  //     this.customOptionsDataSource = new MatTableDataSource(
  //       this.customOptionsArr
  //     );
  //   } else if (arr === "validators") {
  //     console.log(this.validationParamsArr);
  //     let idx = this.validationParamsArr.indexOf(option);
  //     this.validationParamsArr.splice(idx, 1);
  //     this.validationForm.controls["validationName"].setValue(option["name"]);
  //     this.validationForm.controls["validationType"].setValue(option["type"]);
  //     this.validationForm.controls["validationArguments"].setValue(
  //       option["arguments"]
  //     );
  //     this.validatorsDataSource = new MatTableDataSource(
  //       this.validationParamsArr
  //     );
  //     console.log(this.validationParamsArr);
  //   } else if (arr === "cacheParams") {
  //     console.log(this.cacheParamsArr);
  //     let idx = this.cacheParamsArr.indexOf(option);
  //     this.cacheParamsArr.splice(idx, 1);
  //     this.advancedForm.controls["path"].setValue(option["path"]);
  //     this.advancedForm.controls["save-as"].setValue(option["save-as"]);
  //     this.advancedForm.controls["format-as"].setValue(option["format-as"]);
  //     this.cacheParamsDataSource = new MatTableDataSource(this.cacheParamsArr);
  //     console.log(this.cacheParamsArr);
  //   } else {
  //     this.toastrService.warning("Invalid");
  //   }
  // }
  editRecord(option: Record<string, string>, arr: string) {
    if (arr === "options") {
      const idx = this.customOptionsArr.indexOf(option);
      if (idx !== -1) {
        this.customOptionsArr.splice(idx, 1);
        this.optionsForm.get("optionLabel")?.setValue(option.label);
        this.optionsForm.get("optionValue")?.setValue(option.value);
        this.optionsForm.get("optionJump")?.setValue(option["jump-to"]?.trim());
        this.customOptionsDataSource.data = this.customOptionsArr;
      }
    } else if (arr === "validators") {
      const idx = this.validationParamsArr.indexOf(option);
      if (idx !== -1) {
        this.validationParamsArr.splice(idx, 1);
        this.validationForm.get("validationName")?.setValue(option.name);
        this.validationForm.get("validationType")?.setValue(option.type);
        this.validationForm
          .get("validationArguments")
          ?.setValue(option.arguments);
        this.validatorsDataSource.data = this.validationParamsArr;
        this.checkStepType();
      }
    } else if (arr === "cacheParams") {
      const idx = this.cacheParamsArr.indexOf(option);
      if (idx !== -1) {
        this.cacheParamsArr.splice(idx, 1);
        this.advancedForm.get("path")?.setValue(option.path);
        this.advancedForm.get("save-as")?.setValue(option["save-as"]);
        this.advancedForm.get("format-as")?.setValue(option["format-as"]);
        this.cacheParamsDataSource.data = this.cacheParamsArr;
      }
    } else if (arr === "errors") {
      const idx = this.multErrsArr.indexOf(option);
      if (idx !== -1) {
        this.multErrsArr.splice(idx, 1);
        this.basicForm.get("errorName")?.setValue(option["name"]);
        this.basicForm.get("errorValue")?.setValue(option["value"]);
        this.multErrorsDataSource.data = this.multErrsArr;
      }
      this.toastrService.warning("Invalid");
    }
  }

  // //remove an item in a table
  // removeFromArray(option: Record<string, string>, arr: string) {
  //   this.popConfirmModal.confirm({
  //     nzTitle: `Do you want to delete this item</b>?`,
  //     nzContent: '<b style="color:red;">It will be permanently DELETED</b>',
  //     nzOkText: "Yes",
  //     nzOkType: "primary",
  //     nzOnOk: () => {
  //       if (arr === "options") {
  //         let idx = this.customOptionsArr.indexOf(option);
  //         this.customOptionsArr.splice(idx, 1);
  //         this.customOptionsDataSource = new MatTableDataSource(
  //           this.customOptionsArr
  //         );
  //         this.toastrService.success("Item deleted", "Deletion Status");
  //       } else if (arr === "validators") {
  //         let idx = this.validationParamsArr.indexOf(option);
  //         this.validationParamsArr.splice(idx, 1);
  //         this.validatorsDataSource = new MatTableDataSource(
  //           this.validationParamsArr
  //         );
  //         this.toastrService.success("Item deleted", "Deletion Status");
  //       } else if (arr === "cacheParams") {
  //         let idx = this.cacheParamsArr.indexOf(option);
  //         this.cacheParamsArr.splice(idx, 1);
  //         this.cacheParamsDataSource = new MatTableDataSource(
  //           this.cacheParamsArr
  //         );
  //         this.toastrService.success("Item deleted", "Deletion Status");
  //       } else {
  //         this.toastrService.warning("Invalid ");
  //       }
  //     },
  //     nzCancelText: "No",
  //     nzOnCancel: () => {
  //       this.toastrService.error("Item not deleted", "Deletion Status");
  //     },
  //   });
  // }
  removeFromArray(option: Record<string, string>, arr: string) {
    this.popConfirmModal.confirm({
      nzTitle: "Do you want to delete this item?",
      nzContent: "It will be permanently DELETED",
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        let index: number;

        if (arr === "options") {
          index = this.customOptionsArr.indexOf(option);
          this.customOptionsArr.splice(index, 1);
          this.customOptionsDataSource = new MatTableDataSource(
            this.customOptionsArr
          );
        } else if (arr === "validators") {
          index = this.validationParamsArr.indexOf(option);
          this.validationParamsArr.splice(index, 1);
          this.validatorsDataSource = new MatTableDataSource(
            this.validationParamsArr
          );
          this.checkStepType();
        } else if (arr === "cacheParams") {
          index = this.cacheParamsArr.indexOf(option);
          this.cacheParamsArr.splice(index, 1);
          this.cacheParamsDataSource = new MatTableDataSource(
            this.cacheParamsArr
          );
        } else if (arr === "errors") {
          index = this.multErrsArr.indexOf(option);
          let idx = this.formData["errors"].indexOf(
            this.multErrsArr[index]["name"]
          );
          (this.formData["errors"] as string[]).splice(idx, 1);
          this.multErrsArr.splice(index, 1);
          this.multErrorsDataSource = new MatTableDataSource(this.multErrsArr);
          return;
        }

        this.toastrService.success("Item deleted", "Deletion Status");
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.info("Item not deleted", "Deletion Status");
      },
    });
  }

  //add cache parameters if present
  cacheRequest(event?: Event) {
    this.cacheParamsArr = [];

    if (
      this.formData &&
      this.formData["external-fetch"] &&
      this.formData["external-fetch"]["cache"] !== undefined
    ) {
      this.cacheParamsArr = [
        ...this.formData["external-fetch"]["cache-parameters"],
      ];
    }

    this.cacheParamsDataSource = new MatTableDataSource(this.cacheParamsArr);
    this.cacheStatus = this.advancedForm.controls["cache"].value;

    if (this.cacheStatus === true) {
      this.advancedForm.addControl(
        "cache-path",
        new FormControl(
          this.formData &&
          this.formData["external-fetch"] &&
          this.formData["external-fetch"]["cache"] !== undefined
            ? this.formData["external-fetch"]["cache-path"]
            : ""
        )
      );
      this.advancedForm.addControl("path", new FormControl(""));
      this.advancedForm.addControl("save-as", new FormControl(""));
      this.advancedForm.addControl("format-as", new FormControl(""));
    }
  }

  addEndpoint() {
    this.dialog.open(AddEditEndpointComponent, {
      data: undefined,
      width: "50%",
      minWidth: "46%",
    });
  }

  // submitNewStep() {
  //   let lang = this.allJSON["config"]["language"];

  //   let formattedStepName = this.basicForm.controls["name"].value
  //     .toLowerCase()
  //     .replace(" ", "-");

  //   let newStepObj: Record<string, string | Record<string, string>[]> = {
  //     type: this.basicForm.controls["type"].value,
  //     name: formattedStepName,
  //   };

  //   console.log(this.basicForm.value);
  //   console.log(this.navigateForm?.value);
  //   console.log(this.advancedForm?.value);

  //   if (this.formData && this.formData["errors"] !== undefined) {
  //     console.log(this.formData["errors"]);
  //   } else if (this.formData && this.formData["error"] !== undefined) {
  //     newStepObj["error"] = this.formData["error"].toString();
  //   } else {
  //     newStepObj["error"] = newStepObj["name"].toString().concat("-error");
  //   }

  //   if (this.basicForm.controls["type"].value === "select") {
  //     newStepObj["previous"] = this.navigateForm.controls["previous"].value;

  //     if (this.selectedOptionType === "manual") {
  //       newStepObj["next"] = this.navigateForm.controls["next"].value;
  //       newStepObj["options"] = this.customOptionsArr;
  //     } else if (this.selectedOptionType === "existing") {
  //       newStepObj["on-cancel"] = this.navigateForm.controls["cancel"].value;
  //       newStepObj["options"] =
  //         this.optionsForm.controls["existingOption"].value;
  //       newStepObj["action"] = this.navigateForm.controls["action"].value;

  //       if (this.navigateForm.controls["hasApi"].value === false) {
  //         newStepObj["on-accept"] = this.navigateForm.controls["accept"].value;
  //       }
  //     } else if (this.selectedOptionType === "from_api") {
  //       newStepObj["options"] = this.optionsForm.controls["apiOption"].value;
  //       newStepObj["options-error"] =
  //         this.basicForm.controls["name"].value.concat("-options-error");

  //       this.allJSON["language"][this.data["promptName"] as string][lang][
  //         newStepObj["options-error"] as string
  //       ] = this.optionsForm.controls["optionError"].value;
  //       newStepObj["next"] = this.navigateForm.controls["next"].value;

  //     } else {
  //       this.toastrService.warning("Invalid");
  //     }
  //   } else if (this.basicForm.controls["type"].value === "input") {
  //     newStepObj["previous"] = this.navigateForm.controls["previous"].value;
  //     newStepObj["next"] = this.navigateForm.controls["next"].value;

  //     if (
  //       this.validationParamsArr?.length > 0 &&
  //       this.validationStatus === true
  //     ) {
  //       newStepObj["validation"] = this.validationParamsArr;
  //     }
  //   } else {
  //     this.toastrService.info("skip type");
  //   }

  //   if (
  //     this.navigateForm.controls["save-as"].value !== "" ||
  //     this.navigateForm.controls["save-as"].value !== null
  //   ) {
  //     newStepObj["save-as"] = this.navigateForm.controls["save-as"].value;
  //   }

  //   if (this.navigateForm.value.hasApi === true) {
  //     let externalFetchObj: unknown = {
  //       route: this.advancedForm.controls["route"].value,
  //       error: this.advancedForm.controls["error"].value,
  //       success: this.advancedForm.controls["success"].value,
  //     };
  //     if (this.cacheStatus) {
  //       externalFetchObj["cache"] = true;
  //       externalFetchObj["cache-path"] =
  //         this.advancedForm.controls["cache-path"].value;
  //       externalFetchObj["cache-parameters"] = this.cacheParamsArr;
  //     }
  //     newStepObj["external-fetch"] = externalFetchObj as string;
  //     newStepObj["action"] = this.navigateForm.controls["action"].value || 'update-parameters';
  //   }

  //   ///not done
  //   let idx = this.promptData.indexOf(this.formData as Record<string, string>);

  //   console.log(newStepObj, idx);

  //   if (idx === -1) {
  //     this.promptData.push(newStepObj as Record<string, string>);
  //   } else {
  //     this.promptData.splice(idx, 1, newStepObj as Record<string, string>);
  //   }
  //   this.promptData.forEach((item) => {
  //     let tempObj = {};
  //     for (let key in item) {
  //       if (key !== "title") {
  //         tempObj[key] = item[key];
  //       }
  //     }
  //     idx = this.promptData.indexOf(item);
  //     this.promptData.splice(idx, 1, tempObj);
  //     console.log(this.promptData, tempObj, item);
  //   });

  //   this.allJSON["prompts"][this.data["promptName"] as string] =
  //     this.promptData;

  //   if (this.basicForm.controls["type"].value !== "skip") {
  //     this.allJSON["language"][this.data["promptName"] as string][lang][
  //       newStepObj["name"] as string
  //     ] = this.basicForm.controls["title"].value;
  //   }

  //   if (this.basicForm.contains("error2")) {
  //     console.log(this.basicForm.controls["errorMsg"].value);
  //     console.log(this.basicForm.controls["error2"].value);
  //     alert("two errors");
  //   }

  //   if (this.basicForm.contains("apiOption")) {
  //     alert("api option error");
  //     console.log(this.basicForm.controls["apiOption"].value);
  //     console.log(this.basicForm.controls["optionError"].value);
  //   }

  //   this.allJSON["language"][this.data["promptName"] as string][lang][
  //     newStepObj["error"] as string
  //   ] = this.basicForm.controls["errorMsg"].value;

  //   console.log(this.basicForm.controls["errorMsg"].value);
  //   console.log(
  //     this.allJSON["language"][this.data["promptName"] as string][lang][
  //       newStepObj["error"] as string
  //     ]
  //   );

  //   let tempArr = [
  //     ...this.allJSON["prompts_cache"][this.data["promptName"] as string],
  //   ];

  //   tempArr.push(formattedStepName);

  //   this.allJSON["prompts_cache"] = Object.assign(
  //     this.allJSON["prompts_cache"],
  //     {
  //       [this.data["promptName"] as string]: tempArr,
  //     }
  //   );
  //   console.log(this.allJSON["prompts_cache"]);

  //   this.handleJsonData.updateAllJsonData(this.allJSON);
  //   this.ussdSimulatorService.updateUssdDisplayPromptState(this.promptData);
  //   this.dialogRef.close();
  // }
  submitNewStep() {
    let lang = this.allJSON["config"]["language"];

    let formattedStepName = this.basicForm.controls["name"].value
      .toLowerCase()
      .replace(" ", "-");

    let newStepObj: Record<string, string | Record<string, string>[]> = {
      type: this.basicForm.controls["type"].value,
      name: formattedStepName,
    };

    if (this.formData && this.basicForm.controls["errorMsg"].disabled) {
      let errArr = [];
      this.multErrsArr.forEach((err) => {
        errArr.push(err["name"]);
      });
      newStepObj["errors"] = errArr;
    } else if (this.formData && this.formData["error"] !== undefined) {
      newStepObj["error"] = this.formData["error"].toString();
    } else {
      newStepObj["error"] = newStepObj["name"].toString().concat("-error");
    }

    if (this.basicForm.controls["type"].value === "select") {
      newStepObj["previous"] = this.navigateForm.controls["previous"].value;

      if (this.selectedOptionType === "manual") {
        newStepObj["next"] = this.navigateForm.controls["next"].value;
        newStepObj["options"] = this.customOptionsArr;
      } else if (this.selectedOptionType === "existing") {
        newStepObj["on-cancel"] = this.navigateForm.controls["cancel"].value;
        newStepObj["options"] =
          this.optionsForm.controls["existingOption"].value;
        newStepObj["action"] = this.navigateForm.controls["action"].value;

        if (this.navigateForm.controls["hasApi"].value === false) {
          newStepObj["on-accept"] = this.navigateForm.controls["accept"].value;
        }
      } else if (this.selectedOptionType === "from_api") {
        newStepObj["options"] = this.optionsForm.controls["apiOption"].value;
        newStepObj["options-error"] =
          this.basicForm.controls["name"].value.concat("-options-error");

        this.allJSON["language"][this.data["promptName"] as string][lang][
          newStepObj["options-error"] as string
        ] = this.optionsForm.controls["optionError"].value;
        newStepObj["next"] = this.navigateForm.controls["next"].value;
      } else {
        this.toastrService.warning("Invalid");
        return; // Exit the function early if an invalid option type is selected
      }
    } else if (this.basicForm.controls["type"].value === "input") {
      newStepObj["previous"] = this.navigateForm.controls["previous"].value;
      newStepObj["next"] = this.navigateForm.controls["next"].value;

      if (
        this.validationParamsArr?.length > 0 &&
        this.validationStatus === true
      ) {
        newStepObj["validation"] = this.validationParamsArr;
      }
    } else {
      this.toastrService.info("skip type");
      return; // Exit the function early if the type is "skip"
    }

    if (
      this.navigateForm.controls["save-as"].value !== "" ||
      this.navigateForm.controls["save-as"].value !== null
    ) {
      newStepObj["save-as"] = this.navigateForm.controls["save-as"].value;
    }

    if (this.navigateForm.value.hasApi === true) {
      let externalFetchObj: unknown = {
        route: this.advancedForm.controls["route"].value,
        error: this.advancedForm.controls["error"].value,
        success: this.advancedForm.controls["success"].value,
      };
      if (this.cacheStatus) {
        externalFetchObj["cache"] = true;
        externalFetchObj["cache-path"] =
          this.advancedForm.controls["cache-path"].value;
        externalFetchObj["cache-parameters"] = this.cacheParamsArr;
      }
      newStepObj["external-fetch"] = externalFetchObj as string;
      newStepObj["action"] =
        this.navigateForm.controls["action"].value || "update-parameters";
    }

    let idx = this.promptData.indexOf(this.formData as Record<string, string>);

    if (idx === -1) {
      this.promptData.push(newStepObj as Record<string, string>);
    } else {
      this.promptData.splice(idx, 1, newStepObj as Record<string, string>);
    }

    this.promptData.forEach((item) => {
      let tempObj = {};
      for (let key in item) {
        if (key !== "title") {
          tempObj[key] = item[key];
        }
      }
      idx = this.promptData.indexOf(item);
      this.promptData.splice(idx, 1, tempObj);
    });

    this.allJSON["prompts"][this.data["promptName"] as string] =
      this.promptData;

    if (this.basicForm.controls["type"].value !== "skip") {
      this.allJSON["language"][this.data["promptName"] as string][lang][
        newStepObj["name"] as string
      ] = this.basicForm.controls["title"].value;
    }

    this.allJSON["language"][this.data["promptName"] as string][lang][
      newStepObj["error"] as string
    ] = this.basicForm.controls["errorMsg"].value;

    let tempArr = [
      ...this.allJSON["prompts_cache"][this.data["promptName"] as string],
    ];

    tempArr.push(formattedStepName);

    this.allJSON["prompts_cache"] = Object.assign(
      this.allJSON["prompts_cache"],
      {
        [this.data["promptName"] as string]: tempArr,
      }
    );

    this.handleJsonData.updateAllJsonData(this.allJSON);
    // this.ussdSimulatorService.updateUssdDisplayPromptState(this.promptData);
    this.dialogRef.close();
  }
}
