import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnInit,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HandleUssdJsonService } from "../../../../shared/services/handle-ussd-json.service";
import { HttpService } from "../../../../shared/services/http-service.service";
import { UssdSimulatorService } from "../../services/ussd-simulator-service.service";

@Component({
  selector: "app-edit-option",
  templateUrl: "./edit-option.component.html",
  styleUrls: ["./edit-option.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditOptionComponent implements OnInit {
  title: string = "Edit Option";

  public optionForm: FormGroup;

  public formattedLabelOption = "";
  public formattedErrorOption = "";

  pagesArr: string[];
  promptsArr: string[];
  existingData$: Observable<Record<string, string>>;
  allJSON: Record<string, string>;

  isLinear: boolean = true;
  isValid: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: Record<string, string>,
    private dialogRef: MatDialogRef<EditOptionComponent>,
    public fb: FormBuilder,
    private _httpService: HttpService,
    public toastrService: ToastrService,
    private ussdSimulatorService: UssdSimulatorService,
    private handleJsonData: HandleUssdJsonService
  ) {
    this.existingData$ = this.handleJsonData.allJsonData$.pipe(
      map((resp) => {
        if (resp) {
          this.allJSON = resp;
          return resp;
        }
        throw new Error("Pages/Prompts could not be loaded");
      })
    );

    this.optionForm = new FormGroup({
      name: new FormControl(
        {
          value: this.dialogData.selectedOption
            ? this.dialogData.selectedOption["name"]
            : "",
          disabled: true,
        },
        [Validators.required]
      ),

      labelMsg: new FormControl(
        this.dialogData.selectedOption
          ? this.dialogData.selectedOption["title"]
          : "",
        [Validators.required]
      ),

      authenticate: new FormControl(
        this.dialogData.selectedOption
          ? this.dialogData.selectedOption["authenticate"]
          : false,
        [Validators.required]
      ),

      enabled: new FormControl(
        this.dialogData.selectedOption
          ? this.dialogData.selectedOption["enabled"]
          : false,
        [Validators.required]
      ),
    });
  }

  ngOnInit(): void {}

  setExistingToOption() {
    this.isValid = true;
  }

  submit() {
    let newOption = {
      name: this.optionForm.controls["name"].value,
      label: this.dialogData.selectedOption["label"],
      enabled: this.optionForm.value.enabled,
      authenticate: this.optionForm.value.authenticate,
    };

    let existingOptions: Record<string, string>[] =
      this.allJSON["pages"][this.dialogData.pageName]["options"];

    let idx = existingOptions.findIndex(
      (option) => option["name"] === this.dialogData.selectedOption["name"]
    );

    existingOptions.splice(idx, 1, newOption);

    this.allJSON["pages"][this.dialogData.pageName] = Object.assign(
      { ...this.allJSON["pages"][this.dialogData.pageName] },
      { options: existingOptions }
    );

    let lang = this.allJSON["config"]["language"];

    let labelExistInParentPage =
      !!this.allJSON["language"][this.dialogData.pageName][lang][
        this.dialogData.selectedOption["label"]
      ];

    if (labelExistInParentPage) {
      this.allJSON["language"][this.dialogData.pageName][lang] = Object.assign(
        {
          ...this.allJSON["language"][this.dialogData.pageName][lang],
        },
        {
          [this.dialogData.selectedOption["label"]]:
            this.optionForm.value.labelMsg,
        }
      );
      console.log(this.allJSON["language"][this.dialogData.pageName]);
    } else {
      let keys = Object.keys(this.allJSON["language"]);
      let tempLabel = this.dialogData.selectedOption["label"].replace(
        "-page",
        ""
      );

      keys.every((key) => {
        if (
          !!this.allJSON["language"][key][lang][
            this.dialogData.selectedOption["label"]
          ]
        ) {
          this.allJSON["language"][key][lang] = Object.assign(
            {
              ...this.allJSON["language"][key][lang],
            },
            {
              [this.dialogData.selectedOption["label"]]:
                this.optionForm.value.labelMsg,
            }
          );
          return false;
        } else if (!!this.allJSON["language"][key][lang][tempLabel]) {
          this.allJSON["language"][key][lang] = Object.assign(
            {
              ...this.allJSON["language"][key][lang],
            },
            {
              [tempLabel]: this.optionForm.value.labelMsg,
            }
          );
          return false;
        } else {
          console.log(this.allJSON["language"][this.dialogData.pageName]);
          console.log(
            this.allJSON["language"][this.dialogData.selectedOption["name"]]
          );
          console.log(this.optionForm.value.labelMsg);

          if (
            !!this.allJSON["language"][this.dialogData.selectedOption["name"]]
          ) {
            this.allJSON["language"][
              this.dialogData.selectedOption["name"] as string
            ][lang] = Object.assign(
              {
                ...this.allJSON["language"][
                  this.dialogData.selectedOption["name"] as string
                ][lang],
              },
              {
                [this.dialogData.selectedOption["label"]]:
                  this.optionForm.value.labelMsg,
              }
            );
          } else {
            this.allJSON["language"][this.dialogData.pageName][lang] =
              Object.assign(
                {
                  ...this.allJSON["language"][this.dialogData.pageName][lang],
                },
                {
                  [this.dialogData.selectedOption["label"]]:
                    this.optionForm.value.labelMsg,
                }
              );
          }

          return false;
        }
        return true;
      });

      console.log(this.allJSON["language"]);
    }

    this.handleJsonData.updateAllJsonData(this.allJSON);
    this.ussdSimulatorService.updateUssdDisplayPageState(
      this.allJSON["pages"][this.dialogData.pageName]
    );

    this.dialogRef.close();
  }
}
