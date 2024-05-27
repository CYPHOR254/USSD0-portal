import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Inject,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { GlobalService } from "../../../../shared/services/global-service.service";
import { HandleUssdJsonService } from "../../../../shared/services/handle-ussd-json.service";
import { HttpService } from "../../../../shared/services/http-service.service";
import { UssdSimulatorService } from "../../services/ussd-simulator-service.service";

@Component({
  selector: "app-add-option",
  templateUrl: "./add-option.component.html",
  styleUrls: ["./add-option.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddOptionComponent implements OnInit, OnDestroy {
  @Input() title;
  @Input() formData;

  selectedIndex;

  public loading = false;
  public hasErrors = false;
  public errorMessages;

  public optionForm: FormGroup;
  public optionFormPrompt: FormGroup; //Form for creating a prompt
  public optionTypeForm: FormGroup;
  public optionStateForm: FormGroup;
  public optionExistingForm: FormGroup;

  public formattedLabelOption = "";
  public formattedErrorOption = "";

  optionType: string;
  optionState: string = "new";
  selectedValue: string;

  pagesArr: string[];
  promptsArr: string[];
  existingOptions$: Observable<string[]>;
  allJSON: Record<string, string>;

  isLinear: boolean = true;
  isValid: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: Record<string, string>,
    private dialogRef: MatDialogRef<AddOptionComponent>,
    public fb: FormBuilder,
    private _httpService: HttpService,
    public toastrService: ToastrService,
    private ussdSimulatorService: UssdSimulatorService,
    private handleJsonData: HandleUssdJsonService
  ) {
    this.optionTypeForm = new FormGroup({});
    this.optionStateForm = new FormGroup({});
    this.optionExistingForm = new FormGroup({});

    this.optionForm = new FormGroup({
      name: new FormControl(this.formData ? this.formData.name : "", [
        Validators.required,
        Validators.pattern(GlobalService.nameRegex),
      ]),
      title: new FormControl("", [Validators.required]),
      label: new FormControl(
        { value: this.formData ? this.formData.label : "", disabled: true },
        [Validators.required]
      ),
      labelMsg: new FormControl(this.formData ? this.formData.label : "", [
        Validators.required,
      ]),
      errorLabel: new FormControl({ value: "", disabled: true }, [
        Validators.required,
      ]),
      errorMsg: new FormControl("Invalid option selected. Try Again!!", [
        Validators.required,
      ]),
    });

    this.optionFormPrompt = new FormGroup({
      name: new FormControl("", [
        Validators.required,
        Validators.pattern(GlobalService.nameRegex),
      ]),
      labelMsg: new FormControl(this.formData ? this.formData.label : "", [
        Validators.required,
      ]),
    });
  }

  ngOnInit(): void {
    this.title = "Add New Option";

    this.existingOptions$ = this.handleJsonData.allJsonData$.pipe(
      map((resp) => {
        if (resp) {
          this.allJSON = resp;
          this.pagesArr = Object.keys(resp["pages"]);
          this.promptsArr = Object.keys(resp["prompts"]);

          let availableOptions: string[] = [];
          this.allJSON["pages"][this.dialogData.pageName]["options"].map(
            (option) => {
              availableOptions.push(option.name);
            }
          );

          if (this.optionType === "page") {
            this.pagesArr = this.pagesArr.filter(
              (page) =>
                page !== this.dialogData.pageName &&
                !availableOptions.includes(page) &&
                !Array.from(this.dialogData.previousPages).includes(page)
            );
            return this.pagesArr;
          } else {
            this.promptsArr = this.promptsArr.filter((prompt) => {
              if (this.allJSON["prompts"][prompt]["type"] !== "alert") {
                return prompt;
              }
            });
            return this.promptsArr;
          }
        }
        throw new Error("Pages/Prompts could not be loaded");
      })
    );

    //Update option label as you enter
    let formChanges = this.optionForm.controls["name"].valueChanges.subscribe(
      (value) => {
        this.formatOption(value);
        this.optionForm.controls["label"].setValue(this.formattedLabelOption);
        this.optionForm.controls["errorLabel"].setValue(
          this.formattedErrorOption
        );
      }
    );

    this.subscriptions.push(formChanges);
  }

  setExistingToOption() {
    this.isValid = true;
  }

  submit() {
    if (this.optionType === "page") {
      this.submitPage();
    } else {
      this.submitPrompt();
    }
  }

  submitPage() {
    if (this.optionState === "new") {
      let pageName = this.optionForm.value.name
        .trim()
        .replace(" ", "-")
        .toLowerCase()
        .concat("-page");
      let pageTitle = this.optionForm.value.title;
      let pageLabel = this.optionForm.controls["label"].value;
      let pageLabelMsg = this.optionForm.value.labelMsg;
      let pageErrorLabel = this.optionForm.controls["errorLabel"].value;
      let pageErrorMsg = this.optionForm.value.errorMsg;

      let newPageObject = {
        type: "select",
        name: pageName,
        options: [],
        error: pageErrorLabel,
        previous: this.dialogData.pageName,
      };

      let lang = this.allJSON["config"]["language"];

      let newLangObj = {
        [lang]: {
          [pageName]: pageTitle,
          [pageLabel]: pageLabelMsg,
          [pageErrorLabel]: pageErrorMsg,
        },
      };

      let newOption = {
        authenticate: false,
        enabled: true,
        name: pageName,
        label: pageLabel,
      };

      // Add new page/prompt as an option to current page
      this.allJSON["pages"][this.dialogData.pageName]["options"].push(
        newOption
      );

      // Add the new page/prompt in the pages/prompt JSON
      this.allJSON["pages"] = Object.assign(this.allJSON["pages"], {
        [pageName]: newPageObject,
      });

      // Add the new pages/prommpt in languages JSON
      this.allJSON["language"] = Object.assign(this.allJSON["language"], {
        [pageName]: newLangObj,
      });

      this.handleJsonData.updateAllJsonData(this.allJSON);

      this.ussdSimulatorService.updateUssdDisplayPageState(
        this.allJSON["pages"][this.dialogData.pageName]
      );

      this.dialogRef.close();
    } else {
      let selectedOption = this.allJSON["pages"][this.selectedValue];

      let newOption: Record<string, string | boolean> = {
        name: selectedOption["name"],
        label: selectedOption["name"].concat("-label"),
        authenticate: false,
        enabled: true,
      };

      let existingOptions: Record<string, string | boolean>[] =
        this.allJSON["pages"][this.dialogData.pageName].options;

      existingOptions.push(newOption);

      this.allJSON["pages"][this.dialogData.pageName] = Object.assign(
        { ...this.allJSON["pages"][this.dialogData.pageName] },
        { options: existingOptions }
      );

      this.handleJsonData.updateAllJsonData(this.allJSON);

      this.ussdSimulatorService.updateUssdDisplayPageState(
        this.allJSON["pages"][this.dialogData.pageName]
      );

      this.dialogRef.close();
    }
  }

  submitPrompt() {
    if (this.optionState === "new") {
      console.log(this.optionFormPrompt.controls);
      let lang = this.allJSON["config"]["language"];

      let promptName = this.optionFormPrompt.value.name.toLowerCase();

      let newLangObj = {
        [lang]: {
          [promptName]: promptName,
          [promptName.concat("-label")]: this.optionFormPrompt.value.labelMsg,
        },
      };

      let newOption = {
        authenticate: false,
        enabled: true,
        name: promptName,
        label: promptName.concat("-label"),
      };

      // Add new page/prompt as an option to current page
      this.allJSON["pages"][this.dialogData.pageName]["options"].push(
        newOption
      );

      // Add the new page/prompt in the pages/prompt JSON
      this.allJSON["prompts"] = Object.assign(this.allJSON["prompts"], {
        [promptName]: [],
      });

      //Add prompt in prompt_cache
      if (this.allJSON["prompts_cache"] === undefined) {
        this.allJSON["prompts_cache"] = {} as unknown as string;
      }

      this.allJSON["prompts_cache"] = Object.assign(
        this.allJSON["prompts_cache"],
        {
          [promptName]: [],
        }
      );

      // Add the new pages/prommpt in languages JSON
      this.allJSON["language"] = Object.assign(this.allJSON["language"], {
        [promptName]: newLangObj,
      });

      this.handleJsonData.updateAllJsonData(this.allJSON);

      this.ussdSimulatorService.updateUssdDisplayPageState(
        this.allJSON["pages"][this.dialogData.pageName]
      );

      this.dialogRef.close();
    } else {
      let selectedOption = this.allJSON["prompts"][this.selectedValue];
      console.log(selectedOption, "selected option on prompt");

      let newOption: Record<string, string | boolean> = {
        name: this.selectedValue,
        label: this.selectedValue.concat("-label"),
        authenticate: false,
        enabled: true,
      };

      let existingOptions: Record<string, string | boolean>[] =
        this.allJSON["pages"][this.dialogData.pageName].options;

      existingOptions.push(newOption);

      this.allJSON["pages"][this.dialogData.pageName] = Object.assign(
        { ...this.allJSON["pages"][this.dialogData.pageName] },
        { options: existingOptions }
      );

      this.handleJsonData.updateAllJsonData(this.allJSON);

      this.ussdSimulatorService.updateUssdDisplayPageState(
        this.allJSON["pages"][this.dialogData.pageName]
      );

      this.dialogRef.close();
    }
  }

  //Function to format the option label
  formatOption(value) {
    let appendLabelStr = "-label";
    let appendErrorStr = "-error";

    if (this.optionType === "page") {
      appendLabelStr = "-page-label";
      appendErrorStr = "-page-error";
    }

    this.formattedLabelOption = value
      .replace(/\s+/g, "-")
      .toLowerCase()
      .concat(appendLabelStr);

    this.formattedErrorOption = value
      .replace(/\s+/g, "-")
      .toLowerCase()
      .concat(appendErrorStr);
  }

  validateOption() {
    if (this.optionType === "page") {
      let pageName = this.optionForm.value.name.concat("-page");
      let tempArr = this.pagesArr.filter((page) => page === pageName);
      if (tempArr.length !== 0) {
        this.isValid = false;
        this.toastrService.error(
          `${pageName} already exists`,
          "Duplicate Page Error"
        );
      } else {
        this.isValid = true;
      }
    } else {
      let promptName = this.optionFormPrompt.value.name;
      let tempArr = this.promptsArr.filter((prompt) => prompt === promptName);
      if (tempArr.length !== 0) {
        this.isValid = false;
        this.toastrService.error(
          `${promptName} already exists`,
          "Duplicate Prompt Error"
        );
      } else {
        this.isValid = true;
      }
    }
    console.log(this.isValid, "is it valid");
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
