import { AddOptionComponent } from "../components/add-option/add-option.component";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { UssdSimulatorService } from "../services/ussd-simulator-service.service";
import { EditPageComponent } from "../components/edit-page/edit-page.component";
import { NzModalService } from "ng-zorro-antd/modal";
import { HandleUssdJsonService } from "../../../shared/services/handle-ussd-json.service";
import { catchError, map } from "rxjs/operators";
import { Observable, of, Subscription } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { EditOptionComponent } from "../components/edit-option/edit-option.component";
import { Router } from "@angular/router";
import { UssdSimulatorComponent } from "../ussd-simulator.component";
import { HttpService } from "../../../shared/services/http-service.service";
import { AddEditPromptStepComponent } from "../components/add-edit-prompt-step/add-edit-prompt-step.component";

@Component({
  selector: "app-ussd-popup",
  templateUrl: "./ussd-popup.component.html",
  styleUrls: ["./ussd-popup.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UssdPopupComponent implements OnInit, OnDestroy {
  currentIndex: number;
  modalRef: NgbModalRef;
  selectedProject = "new";
  selectedLanguage = "english";
  errorMsg: string;

  currentPromptTitle: string;
  currentPrompt: string;
  currentPromptStep: Record<string, string>;
  currentPromptIndex: number = 0;

  currTestStep: Record<string, string>;
  currTestOptions: Record<string, string>[];

  previousPageTimeline = new Set();
  currentPageData = {
    type: "select",
    currentPage: "first-page",
    name: "first-page",
    error: "first-page-error",
    title: "Welcome to First page",
    options: [
      {
        name: "option-one-page",
        label: "Option 1",
        enabled: true,
        authenticate: false,
      },
    ],
  };

  pagesJSON: string;
  promptsJSON: string;
  languagesJSON: string;
  configMetadataJSON: string;
  allJSON: Record<string, string>;

  isPrompt: boolean = false;

  response$: Observable<any>;
  responsePrompt$: Observable<any>;
  existingData$: Observable<Record<string, string>>;

  ussdForm = new FormGroup({
    select: new FormControl(),
  });

  private subscription: Subscription[] = [];

  constructor(
    private ussdSimulatorService: UssdSimulatorService,
    private popConfirmModal: NzModalService,
    private handleJsonData: HandleUssdJsonService,
    private ref: ChangeDetectorRef,
    public dialog: MatDialog,
    private toastrService: ToastrService,
    private router: Router,
    private simulComp: UssdSimulatorComponent,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.fetchExistingData();
    this.updatePhoneDisplay();
  }

  fetchExistingData() {
    this.existingData$ = this.handleJsonData.allJsonData$.pipe(
      map((resp: Record<string, string>) => {
        if (resp) {
          this.allJSON = { ...resp };
          this.pagesJSON = this.allJSON["pages"];
          this.promptsJSON = this.allJSON["prompts"];
          this.languagesJSON = this.allJSON["language"];
          this.configMetadataJSON = this.allJSON["config"]["meta-data"];

          let pageOne = sessionStorage.getItem("pageOne");
          let pagesKeys: string[] = Object.keys(this.allJSON["pages"]);
          let promptsKeys: string[] = Object.keys(this.allJSON["prompts"]);

          pagesKeys.map((key: string) => {
            if (key === pageOne) {
              let pageOneData = this.allJSON["pages"][pageOne];
              this.ussdSimulatorService.updateUssdDisplayPageState(pageOneData);
            }
          });

          promptsKeys.map((key: string) => {
            if (key === pageOne) {
              let pageOneData = this.allJSON["prompts"][pageOne];
              this.ussdSimulatorService.updateUssdDisplayPromptState(pageOneData);
              this.isPrompt = true;
              this.currentPrompt = pageOneData[0]["name"];
              this.updatePhoneDisplay();
            }
          });
          return this.allJSON;
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
        this.router.navigate(["/ussd/ussd-setup"]);
        return of({});
      })
    );
  }

  public updatePhoneDisplay() {
    if (this.isPrompt === false) {
      this.response$ = this.ussdSimulatorService.currentDisplayPageData$.pipe(
        map((item) => {
          if (item) {
            this.currentPageData = { ...item };

            //Set title
            let currTitle: string = this.handleJsonData.getKeyFromLang(
              this.allJSON,
              this.currentPageData.name
            );

            let currError: string = this.handleJsonData.getKeyFromLang(
              this.allJSON,
              this.currentPageData.error
            );

            if (currTitle.toString().includes("@")) {
              let globalDetails = this.configMetadataJSON;

              let tempArr = currTitle.split(" ");

              let idx: number = 0;
              tempArr.map((word, index) => {
                if (word[0] === "@") {
                  let tempWord = word.slice(1);
                  tempWord = globalDetails[tempWord];
                  idx = index;
                  tempArr.splice(idx, 1, tempWord);
                  currTitle = tempArr.join(" ");
                }
              });
            }

            this.currentPageData = Object.assign(
              { ...this.currentPageData },
              {
                title: currTitle,
                errorMsg: currError,
              }
            );

            let updatedOptionsArr = [];

            this.currentPageData.options.map((option) => {
              let displayLabel = option.label.includes(" ")
                ? option.label
                : undefined;

              displayLabel =
                displayLabel === undefined
                  ? this.handleJsonData.getKeyFromLang(
                      this.allJSON,
                      option.label
                    )
                  : displayLabel;

              if (!displayLabel) {
                let tempLabel = option.label.replace("-page", "");

                displayLabel = this.handleJsonData.getKeyFromLang(
                  this.allJSON,
                  tempLabel
                );

                displayLabel =
                  displayLabel === undefined ? displayLabel : "NULL";
              }

              let newObj = Object.assign(
                { ...option },
                {
                  title: displayLabel,
                }
              );
              updatedOptionsArr.push(newObj);
            });

            this.currentPageData = Object.assign(
              { ...this.currentPageData },
              {
                options: updatedOptionsArr,
              }
            );

            return this.currentPageData;
          }
          this.toastrService.error("The USSD Config choosen is not valid");
          this.router.navigate(["/overview"]);
          throw new Error("No current page/prompt data");
        })
      );
    } else {
      this.responsePrompt$ =
        this.ussdSimulatorService.currentDisplayPromptData$.pipe(
          map((item) => {
            if (item) {
              let resp = item;
              let tempArr = [];

              if (item.length) {
                tempArr = [...resp];

                tempArr.forEach((prompt) => {
                  let promptText = this.handleJsonData.getKeyFromLang(
                    this.allJSON,
                    prompt.name
                  );

                  if (prompt.type === "skip") {
                    prompt.title = "SKIP";
                  } else {
                    prompt.title = promptText;
                  }
                });
              } else if (item.length === 0) {
                this.currentPromptTitle = "Please add a new step";
                return resp;
              } else {
                tempArr.push(resp);
                tempArr.forEach((prompt) => {
                  let promptText = this.handleJsonData.getKeyFromLang(
                    this.allJSON,
                    prompt.name
                  );
                  if (promptText !== "") {
                    prompt.title = promptText;
                  }
                });
              }

              this.currentPromptTitle = tempArr[0]["name"];
              return tempArr;
            }
            throw new Error("Could not get prompt data");
          }),
          catchError((error) => {
            if (error.error instanceof ErrorEvent) {
              this.errorMsg = `Error: ${error.error.message}`;
              this.toastrService.error(this.errorMsg, "Redis Error");
            } else {
              this.errorMsg = `Error: ${error.message}`;
              this.toastrService.error(this.errorMsg, "Redis Error");
            }
            return of([]);
          })
        );
    }
  }

  setPreviousPage(data: string) {
    this.previousPageTimeline.add(data);
  }

  //CDK drag and drop functionality
  async drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.currentPageData.options,
      event.previousIndex,
      event.currentIndex
    );

    this.response$ = of(this.currentPageData);
    this.ref.detectChanges();

    this.allJSON["pages"][this.currentPageData.name] = Object.assign(
      { ...this.allJSON["pages"][this.currentPageData.name] },
      {
        options: this.currentPageData.options,
      }
    );

    this.handleJsonData.updateAllJsonData(this.allJSON);
    this.ussdSimulatorService.updateUssdDisplayPageState(this.currentPageData);
  }

  //Ussd popup
  async onSend(idx: any) {
    if (idx >= 0) {
      const selectedValue = parseInt(idx, 10);

      try {
        const selectedOption =
          this.currentPageData.options[selectedValue]["name"];

        if (
          selectedOption.includes("page") &&
          this.allJSON["pages"][selectedOption]
        ) {
          let data = this.allJSON["pages"][selectedOption];

          this.isPrompt = false;

          this.setPreviousPage(this.currentPageData.name);

          this.ussdSimulatorService.updateUssdDisplayPageState(data);

          this.updatePhoneDisplay();
        } else if (
          !selectedOption.includes("page") &&
          this.allJSON["prompts"][selectedOption]
        ) {
          let data = this.allJSON["prompts"][selectedOption];

          this.currentPrompt = selectedOption;
          this.isPrompt = true;
          this.setPreviousPage(this.currentPageData.name);

          this.ussdSimulatorService.updateUssdDisplayPromptState(data);
          this.updatePhoneDisplay();
        } else {
          this.toastrService.warning(
            "The option you are navigating to cannot be found",
            "Pages/Prompts Error"
          );
        }
      } catch (error) {
        let tempTitle = this.currentPageData.title;
        this.currentPageData.title = this.currentPageData["errorMsg"];

        setTimeout(() => {
          this.currentPageData.title = tempTitle;
          this.ref.detectChanges();
        }, 2000);

        this.response$ = of(this.currentPageData);
        this.ref.detectChanges();
      }
    }
  }

  goBack() {
    if (this.previousPageTimeline.size > 0) {
      let tempArr = Array.from(this.previousPageTimeline);
      let previousItem = tempArr[tempArr.length - 1];

      if (previousItem.toString().includes("page")) {
        this.isPrompt = false;
      }
      let data = this.allJSON["pages"][previousItem as string];
      this.ussdSimulatorService.updateUssdDisplayPageState(data);
      this.updatePhoneDisplay();
      this.ref.detectChanges();
      this.previousPageTimeline.delete(previousItem);
      this.currentPromptIndex = null;
    }
  }

  onCancel() {
    this.ussdSimulatorService.updateUssdPopupState(false);
  }

  ///Add page modal functionality
  editPage() {
    this.dialog.open(EditPageComponent, {
      data: { formData: this.currentPageData },
      width: "fit-content",
      position: { right: "80px" },
    });
  }

  editPrompt(prompt?: Record<string, string>) {
    let x = this.dialog
      .open(AddEditPromptStepComponent, {
        data: {
          promptData: prompt,
          promptName: this.currentPrompt,
        },
        width: "55%",
        position: { right: "50px" },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp !== true) {
          this.updatePhoneDisplay();
          this.ref.detectChanges();
        }
      });

    this.subscription.push(x);
  }

  deletePrompt(prompt?: Record<string, string>) {
    let idx = this.allJSON["prompts"][this.currentPrompt].indexOf(prompt);

    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete <b style="color:red;">${prompt.name}</b>?`,
      nzContent: '<b style="color:red;">It will be permanently DELETED</b>',
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        let idx = this.allJSON["prompts"][this.currentPrompt].indexOf(prompt);

        this.allJSON["prompts"][this.currentPrompt].splice(idx, 1);

        let idx2 =
          this.allJSON["prompts_cache"][this.currentPrompt].indexOf(prompt);
        this.allJSON["prompts_cache"][this.currentPrompt].splice(idx2, 1);

        this.handleJsonData.updateAllJsonData(this.allJSON);

        this.ussdSimulatorService.updateUssdDisplayPromptState(
          this.allJSON["prompts"][this.currentPrompt]
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

  addNewPromptStep() {
    let x = this.dialog
      .open(AddEditPromptStepComponent, {
        data: {
          promptName: this.currentPrompt,
        },
        width: "55%",
        position: { right: "50px" },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp !== true) {
          this.fetchExistingData();
          this.updatePhoneDisplay();
          this.ref.detectChanges();
        }
      });

    this.subscription.push(x);
  }

  addOption() {
    this.dialog
      .open(AddOptionComponent, {
        data: {
          pageName: this.currentPageData.name,
          previousPages: this.previousPageTimeline,
        },
        width: "55%",
        position: { right: "50px" },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp !== true) {
          this.fetchExistingData();
          this.updatePhoneDisplay();
          this.ref.detectChanges();
        }
      });
  }

  editOption(selectedOption: Record<string, string>) {
    this.dialog.open(EditOptionComponent, {
      data: {
        pageName: this.currentPageData.name,
        selectedOption: selectedOption,
      },
      width: "55%",
      position: { right: "50px" },
    });
  }

  changePromptTitle(prompt: Record<string, string>, index?: number) {
    this.currentPromptTitle = prompt?.name;
    this.currentPromptStep = prompt;
    this.currentPromptIndex = index;
  }

  simulateSuccLogin() {
    let length = this.allJSON["prompts"]["login"].length;
    let loginPrompt = this.allJSON["prompts"]["login"][length - 1];
    let nextStep = loginPrompt["external-fetch"]["success"];

    if (nextStep.includes("-page")) {
      this.isPrompt = false;
      this.ussdSimulatorService.updateUssdDisplayPageState(
        this.allJSON["pages"][nextStep]
      );
    } else {
      this.isPrompt = true;
      let mainPrompt = this.handleJsonData.getPromptNameFromCache(
        this.allJSON,
        nextStep
      );

      this.ussdSimulatorService.updateUssdDisplayPromptState(
        this.allJSON["prompts"][mainPrompt]
      );
    }

    this.updatePhoneDisplay();
    this.ref.detectChanges();
  }

  //Delete Option functionality
  deleteOption(ussdOption: string, pageName: string) {
    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete option to <b style="color:red;">${ussdOption}</b>?`,
      nzContent: '<b style="color:red;">It will be permanently DELETED</b>',
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        let idx = this.currentPageData.options.findIndex(
          (option) => option.name === ussdOption
        );

        this.currentPageData.options.splice(idx, 1);

        this.allJSON["pages"][this.currentPageData.name] = Object.assign(
          { ...this.allJSON["pages"][this.currentPageData.name] },
          {
            options: this.currentPageData.options,
          }
        );

        this.handleJsonData.updateAllJsonData(this.allJSON);

        this.ussdSimulatorService.updateUssdDisplayPageState(
          this.allJSON["pages"][pageName]
        );

        this.ref.detectChanges();
        this.toastrService.success(
          `Option ${ussdOption} removed successfully`,
          "Removal Status"
        );
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.error(
          `Option ${ussdOption} removed failure`,
          "Removal Status"
        );
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sb) => sb.unsubscribe());
  }
}
