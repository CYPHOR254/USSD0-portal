import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnInit,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HandleUssdJsonService } from "../../../../shared/services/handle-ussd-json.service";
import { HttpService } from "../../../../shared/services/http-service.service";
import { UssdSimulatorService } from "../../services/ussd-simulator-service.service";

@Component({
  selector: "app-edit-page",
  templateUrl: "./edit-page.component.html",
  styleUrls: ["./edit-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPageComponent implements OnInit {
  title: string;
  formData: Record<string, string>;

  selectedIndex;

  public loading = false;
  public hasErrors = false;
  public errorMessages;

  public form: FormGroup;

  allJSON: Record<string, string>;
  existingData$: Observable<Record<string, string>>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public pageData: { [key: string]: Record<string, string> },
    private dialogRef: MatDialogRef<EditPageComponent>,
    private _httpService: HttpService,
    public toastrService: ToastrService,
    private ussdSimulatorService: UssdSimulatorService,
    private handleJsonData: HandleUssdJsonService
  ) {
    this.formData = this.pageData["formData"];
    this.title = this.pageData["formData"]["name"];

    this.existingData$ = this.handleJsonData.allJsonData$.pipe(
      map((resp: Record<string, string>) => {
        if (resp) {
          this.allJSON = resp;
          return resp;
        }
        throw new Error("Could not load data");
      })
    );
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      pageName: new FormControl(
        { value: this.formData ? this.formData.name : "", disabled: true },
        [Validators.required]
      ),
      pageTitle: new FormControl(this.formData ? this.formData.title : "", [
        Validators.required,
      ]),
      pageError: new FormControl(
        this.formData ? this.formData.errorMsg : "Invalid!!",
        [Validators.required]
      ),
    });
  }

  public editPage(): void {
    if (this.pageData) {
      const newData = {
        type: this.formData.type,
        name: this.formData.name,
        options: this.formData.options,
        errorMsg: this.form.value.pageError,
        title: this.form.value.pageTitle,
      };

      this.formData["title"] = newData.title;
      this.formData["erroMsg"] = newData.errorMsg;

      let lang = this.allJSON["config"]["language"];

      this.allJSON["language"][this.formData.name][lang][this.formData.name] =
        newData.title;

      this.allJSON["language"][this.formData.name][lang][this.formData.error] =
        newData.errorMsg;

      this.handleJsonData.updateAllJsonData(this.allJSON);
      this.ussdSimulatorService.updateUssdDisplayPageState(this.formData);

      this.toastrService.success(
        `Updated ${this.formData.name} successfully`,
        "Update status"
      );

      this.dialogRef.close();
    }
  }
}
