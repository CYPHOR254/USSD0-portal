import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { UssdSimulatorService } from "../ussd-simulator/services/ussd-simulator-service.service";
import { HandleUssdJsonService } from "../../shared/services/handle-ussd-json.service";
import { Observable, Subscription, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AddEditPromptStepComponent } from "../ussd-simulator/components/add-edit-prompt-step/add-edit-prompt-step.component";
import { MatDialog } from "@angular/material/dialog";
import { NzModalService } from "ng-zorro-antd/modal";

@Component({
  selector: "app-ussd-prompts",
  templateUrl: "./ussd-prompts.component.html",
  styleUrls: ["./ussd-prompts.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UssdPromptsComponent implements OnInit {
  allJSON: Record<string, string>;
  promptsJSON: string;
  promptsKeys: string[];
  languagesJSON: string;
  apiJSON: string;
  existingPrompts$: Observable<string[]>;
  promptSteps$: Observable<Record<string, any>[]>;

  selectedPrompt: string;

  private subscription: Subscription[] = [];

  errorMsg: string;
  constructor(
    private ussdSimulatorService: UssdSimulatorService,
    private handleJsonData: HandleUssdJsonService,
    private toastrService: ToastrService,
    private router: Router,
    public dialog: MatDialog,
    private ref: ChangeDetectorRef,
    private popConfirmModal: NzModalService,
  ) {}

  ngOnInit(): void {
    this.fetchExistingData();
  }

  fetchExistingData() {
    this.existingPrompts$ = this.handleJsonData.allJsonData$.pipe(
      map((resp: Record<string, string>) => {
        if (resp) {
          this.allJSON = { ...resp };
          this.promptsJSON = this.allJSON["prompts"];
          this.languagesJSON = this.allJSON["language"];
          this.apiJSON = this.allJSON["api"];

          this.promptsKeys = Object.keys(this.allJSON["prompts"]);
          console.log(this.promptsKeys);
          console.log(this.promptsJSON);

          return this.promptsKeys;
        }
        throw new Error("Could not obtain data");
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
        return of([]);
      })
    );
  }

  getPromptSteps(promptName: string) {
    let promptSteps = this.promptsJSON[promptName];
    if (!promptSteps.length) {
      promptSteps = [promptSteps];
    }

    this.promptSteps$ = of(promptSteps);
    this.selectedPrompt = promptName;

    var lists = document.querySelectorAll("p");
    lists.forEach(function (element) {
      element.classList.remove("active");
    });

    var selected = document.getElementById(promptName);
    selected.classList.add("active");
  }

  editStep(step: any) {
    console.log(step);

    let x = this.dialog.open(AddEditPromptStepComponent, {
      data: {
        promptData: step,
        promptName: this.selectedPrompt,
      },
      width: "75%",
      position: { right: "50px" },
      disableClose: true,
    });

    let xy = x.afterClosed().subscribe(() => {
      this.fetchExistingData();
      this.getPromptSteps(this.selectedPrompt)
      // this.updatePhoneDisplay();
      this.ref.detectChanges();
    });

    this.subscription.push(xy);
  }

  addStep() {
    let x = this.dialog.open(AddEditPromptStepComponent, {
      data: {
        promptName: this.selectedPrompt,
      },
      width: "55%",
      position: { right: "50px" },
      disableClose: true
    });

    let xy = x.afterClosed().subscribe(() => {
      this.fetchExistingData();
      this.getPromptSteps(this.selectedPrompt)
      // this.updatePhoneDisplay();
      this.ref.detectChanges();
    });

    this.subscription.push(xy);
  }

  filterPromptSteps(event: any) {
    console.log(event.target.value);
    let originalList = [...this.promptsKeys];

    originalList = originalList.filter((step) => {
      return step.includes(event.target.value);
    });
    this.existingPrompts$ = of([]);
    this.existingPrompts$ = of(originalList);
  }

  deleteStep(step?: Record<string, string>) {
    console.log(this.selectedPrompt);
    console.log(this.allJSON["prompts"][this.selectedPrompt]);
    
    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete <b style="color:red;">${step.name}</b>?`,
      nzContent: '<b style="color:red;">It will be permanently DELETED</b>',
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        let idx = this.allJSON["prompts"][this.selectedPrompt].indexOf(step);

        this.allJSON["prompts"][this.selectedPrompt].splice(idx, 1);

        let idx2 =
          this.allJSON["prompts_cache"][this.selectedPrompt].indexOf(step);
        this.allJSON["prompts_cache"][this.selectedPrompt].splice(idx2, 1);


        this.handleJsonData.updateAllJsonData(this.allJSON);

        this.ussdSimulatorService.updateUssdDisplayPromptState(
          this.allJSON["prompts"][this.selectedPrompt]
        );

        this.ref.detectChanges();

        this.toastrService.success(
          `Step removed successfully`,
          "Removal Status"
        );
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.error(`Step removal failure`, "Removal Status");
      },
    });
  }
}
