import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { Output, EventEmitter } from "@angular/core";
import { Observable, of } from "rxjs";
import { UssdSimulatorService } from "../../services/ussd-simulator-service.service";
import { catchError, map } from "rxjs/operators";
import { HandleUssdJsonService } from "../../../../shared/services/handle-ussd-json.service";
import { ToastrService } from "ngx-toastr";
import { UssdPopupComponent } from "../../ussd-popup/ussd-popup.component";
import { HttpService } from "../../../../shared/services/http-service.service";
import { UssdSimulatorComponent } from "../../ussd-simulator.component";

@Component({
  selector: "app-test-prompt",
  templateUrl: "./test-prompt.component.html",
  styleUrls: ["./test-prompt.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestPromptComponent implements OnInit {
  @Output() isTesting = new EventEmitter<boolean>();

  promptData$: Observable<Record<string, string>[]>;
  promptData: Record<string, string>[];

  allJsonData$: Observable<Record<string, string>>;
  allJSON: Record<string, string>;

  apiCallStatus$: Observable<any>;
  globalReqDetails: any = {};
  matchingRespFlag: boolean = false;

  currTestStep: Record<string, string> = {};
  currTestOptions: Record<string, string>[] = [];

  isFirstStep: boolean = false;

  ussdForm = new FormGroup({
    select: new FormControl(),
  });

  constructor(
    private ussdSimulatorService: UssdSimulatorService,
    private handleJsonData: HandleUssdJsonService,
    private ref: ChangeDetectorRef,
    private toastrService: ToastrService,
    private popupComp: UssdPopupComponent,
    private httpService: HttpService,
    private simulComp: UssdSimulatorComponent
  ) {}

  ngOnInit(): void {
    this.allJsonData$ = this.handleJsonData.allJsonData$.pipe(
      map((resp) => {
        if (resp) {
          this.allJSON = resp;
          return resp;
        }
      })
    );

    this.promptData$ = this.ussdSimulatorService.currentTestPromptData$.pipe(
      map((resp) => {
        if (resp) {
          this.currTestStep = resp[0];
          this.isFirstStep = true;

          this.checkType();
          this.promptData = resp;

          let idx = this.promptData.indexOf(this.currTestStep);
          console.log(idx);
          this.popupComp.changePromptTitle(this.currTestStep, idx);
          this.popupComp.currentPromptIndex = idx;
          document.getElementById(`step_${idx}`).scrollIntoView();

          return resp;
        }
      })
    );

    let exampleDiv: HTMLElement = document.getElementById("promptList");
    exampleDiv.style.pointerEvents = "none";
  }

  nextStep(currTestStep: Record<string, string>) {
    this.isFirstStep = false;
    this.apiCallStatus$ = of(null);

    console.log(currTestStep);

    let userInput = this.ussdForm.value.select;

    if (
      currTestStep["type"] === "select" &&
      (userInput < 1 || userInput > this.currTestOptions.length)
    ) {
      let temp = currTestStep["title"];

      let errMsg = this.handleJsonData.getKeyFromLang(
        this.allJSON,

        currTestStep["error"]
      );
      this.currTestStep["title"] = errMsg;

      setTimeout(() => {
        this.currTestStep["title"] = temp;
        this.ref.detectChanges();
      }, 2000);
    } else if (
      currTestStep["type"] === "select" &&
      (userInput > 0 || userInput < this.currTestOptions.length)
    ) {
      // handle select navigation
      this.selectNavigation(currTestStep, userInput);
    } else if (currTestStep["type"] === "input") {
      console.log(userInput);
      this.inputNavigation(currTestStep);
      console.log(currTestStep);
      console.log("sdkjsdkhsdn");
    } else if (currTestStep["type"] === "skip") {
      this.performPromptAction(currTestStep["action"], currTestStep);
    } else {
      this.toastrService.warning("Invalid type");
    }

    this.ussdForm.reset();
    console.log(this.currTestStep, this.currTestOptions);
  }

  previousStep(currTestStep: Record<string, string>) {
    this.matchingRespFlag = false;

    let previous = currTestStep["previous"];

    if (previous.includes("page")) {
      this.isTesting.emit(false);
      this.popupComp.isPrompt = false;
      this.ussdSimulatorService.updateUssdDisplayPageState(
        this.allJSON["pages"][previous]
      );
      this.ref.detectChanges();
    } else {
      let previousStep = this.promptData.filter(
        (step) => step.name === previous
      );

      if (previousStep.length !== 0) {
        this.currTestStep = previousStep[0];

        let idx = this.promptData.indexOf(previousStep[0]);
        console.log(idx);
        this.popupComp.changePromptTitle(previousStep[0], idx);
        this.popupComp.currentPromptIndex = idx;
        document.getElementById(`step_${idx}`).scrollIntoView();

        this.checkType();
      } else {
        this.isTesting.emit(false);
        this.ussdSimulatorService.updateUssdDisplayPromptState(
          this.allJSON["prompts"][previous]
        );
        this.ref.detectChanges();
      }
    }
  }

  checkType() {
    console.log(this.currTestStep);
    if (this.currTestStep !== undefined) {
      if (this.currTestStep["type"] === "select") {
        this.handleSelect(this.currTestStep);
      } else if (this.currTestStep["type"] === "input") {
        console.log("This is an input");
      } else {
        console.log(this.currTestStep);
        console.log(this.currTestStep["type"]);
      }
    } else {
      console.log("Something is happening");
    }
  }

  //Used to display options of a type=select step
  handleSelect(promptStep: Record<string, string>) {
    let stepOptions: any = promptStep["options"];

    if (stepOptions instanceof Array) {
      this.currTestOptions = stepOptions;
    } else if (
      typeof stepOptions === "string" &&
      !stepOptions.includes("options")
    ) {
      console.log(stepOptions);

      let tempArr = [];
      let tempObj: any;

      if (Object.keys(this.globalReqDetails).includes(stepOptions)) {
        this.globalReqDetails[stepOptions].map((step) => {
          tempObj = {
            label: step,
            value: step,
          };
          tempArr.push(tempObj);
        });
      } else {
        console.log(stepOptions);
        console.log(stepOptions, "sdfhdsjk");

        tempObj = {
          label: stepOptions,
          value: stepOptions,
        };
        tempArr.push(tempObj);
      }

      this.currTestOptions = tempArr;
    } else if (
      typeof stepOptions === "string" &&
      stepOptions.includes("options")
    ) {
      this.matchingRespFlag = false;
      let optionKey = stepOptions;

      let optionArr: Record<string, string>[] =
        this.allJSON["config"]["global-constants"][optionKey];

      let tempArr = optionArr;

      tempArr.map((option) => {
        option.labelMsg = this.handleJsonData.getKeyFromLang(
          this.allJSON,
          option["label"]
        );
      });

      this.currTestOptions = tempArr;
    } else {
      this.toastrService.warning("Invalid option");
    }
  }

  //Used to navigate a type=select. Determines what action to perform(make an api call or just proceed)
  selectNavigation(currTestStep: Record<string, string>, userInput: string) {
    let stepOptions: any = currTestStep["options"];

    if (stepOptions === "confirm-options") {
      if (parseInt(userInput, 10) === 2) {
        let next = currTestStep["on-cancel"];

        if (next !== undefined) {
          if (next.includes("page")) {
            this.ussdSimulatorService.updateUssdDisplayPageState(
              this.allJSON["pages"][currTestStep["on-cancel"]]
            );
            this.isTesting.emit(false);
            this.popupComp.isPrompt = false;
          } else {
            let tempArr = this.promptData.filter((step) => step.name === next);

            if (tempArr.length === 0) {
              this.ussdSimulatorService.updateUssdDisplayPromptState(
                currTestStep["on-cancel"]
              );
              this.isTesting.emit(false);
            } else {
              this.currTestStep = tempArr[0];

              let idx = this.promptData.indexOf(tempArr[0]);
              console.log(idx);
              this.popupComp.changePromptTitle(tempArr[0], idx);
              this.popupComp.currentPromptIndex = idx;
              document.getElementById(`step_${idx}`).scrollIntoView();

              this.checkType();
              this.ref.detectChanges();
            }
          }
        } else {
          this.toastrService.warning(
            "The step does not have an on-cancel key.",
            "Prompt Step Warning"
          );
        }
      } else if (parseInt(userInput, 10) === 1) {
        let action = currTestStep["action"];
        this.performPromptAction(action, currTestStep);
      } else {
        this.toastrService.warning("Invalid input");
        console.log(userInput, typeof userInput);
      }
    } else if (stepOptions === "yes-no-options") {
      if (parseInt(userInput, 10) === 1) {
        let next = currTestStep["on-accept"];

        if (next !== undefined) {
          let tempArr = this.promptData.filter((step) => step.name === next);

          if (tempArr.length > 0) {
            this.currTestStep = tempArr[0];

            let idx = this.promptData.indexOf(tempArr[0]);
            console.log(idx);
            this.popupComp.changePromptTitle(tempArr[0], idx);
            this.popupComp.currentPromptIndex = idx;
            document.getElementById(`step_${idx}`).scrollIntoView();

            this.checkType();
          } else {
            this.ussdSimulatorService.updateUssdDisplayPageState(
              this.allJSON["pages"][currTestStep["on-accept"]]
            );

            this.isTesting.emit(false);
            this.popupComp.isPrompt = false;
            this.popupComp.updatePhoneDisplay();
            this.ref.detectChanges();
          }
        } else {
          if (currTestStep["action"] !== undefined) {
            this.performPromptAction(currTestStep["action"], currTestStep);

            let str1 = "Making api call";

            this.toastrService.info(str1, "Api call");
          }
          this.toastrService.warning(
            "The step does not have an on-accept key.",
            "Prompt Step Warning"
          );
        }
      } else if (parseInt(userInput, 10) === 2) {
        let next = currTestStep["on-cancel"];

        if (next !== undefined) {
          this.currTestStep = this.allJSON["prompts"][next];
          this.currTestStep["title"] = this.handleJsonData.getKeyFromLang(
            this.allJSON,
            next
          );

          this.checkType();
          this.ref.detectChanges();
        } else {
          this.toastrService.warning(
            "The step does not have an on-cancel key.",
            "Prompt Step Warning"
          );

          // let action = currTestStep["action"];
          // let apiRoute = currTestStep["external-fetch"]["route"];

          // let apiKey = Object.keys(this.allJSON["api"])[0];
        }
      } else {
        this.toastrService.warning("Invalid input");
        console.log(userInput, typeof userInput);
      }
    } else if (stepOptions instanceof Array) {
      let selectedOption = stepOptions[parseInt(userInput,10) - 1];

      if (!!selectedOption["jump-to"]) {
        let tempObj = this.promptData.filter(
          (step) => step.name === selectedOption["jump-to"]
        );

        if (tempObj.length > 0) {
          this.currTestStep = tempObj[0];

          let idx = this.promptData.indexOf(tempObj[0]);
          console.log(idx);
          this.popupComp.changePromptTitle(tempObj[0], idx);
          this.popupComp.currentPromptIndex = idx;
          document.getElementById(`step_${idx}`).scrollIntoView();
        } else {
          console.log(selectedOption["jump-to"]);
          if (selectedOption["jump-to"].includes("-page")) {
            this.isTesting.emit(false);
            this.popupComp.isPrompt = false;
            this.ussdSimulatorService.updateUssdDisplayPageState(
              this.allJSON["pages"][selectedOption["jump-to"]]
            );
          } else {
            this.isTesting.emit(false);
            this.popupComp.isPrompt = false;
            this.ussdSimulatorService.updateUssdDisplayPromptState(
              this.allJSON["prompts"][selectedOption["jump-to"]]
            );
          }
          this.ref.detectChanges();
        }

        this.checkType();
      } else {
        let tempObj = this.promptData.filter(
          (step) => step.name === currTestStep["next"]
        );

        if (tempObj.length > 0) {
          this.currTestStep = tempObj[0];

          let idx = this.promptData.indexOf(tempObj[0]);
          console.log(idx);
          this.popupComp.changePromptTitle(tempObj[0], idx);
          this.popupComp.currentPromptIndex = idx;
          tempObj.length
            ? document.getElementById(`step_${idx}`).scrollIntoView()
            : console.log("Step not in prompt");
          this.checkType();
        } else {
          console.log("Step not in prompt");
        }
      }
    } else {
      if (!!currTestStep["next"]) {
        let next = this.promptData.filter(
          (step) => step.name === currTestStep["next"]
        );
        this.currTestStep = next[0];

        let idx = this.promptData.indexOf(next[0]);
        console.log(idx);
        this.popupComp.changePromptTitle(next[0], idx);
        this.popupComp.currentPromptIndex = idx;
        document.getElementById(`step_${idx}`).scrollIntoView();

        this.checkType();
      }
    }
  }

  inputNavigation(promptStep: Record<string, string>) {
    let userInput = this.ussdForm.value.select;
    console.log(userInput);
    console.log(promptStep);
    let next = this.promptData.filter(
      (step) => step.name === promptStep["next"]
    );

    if (next.length > 0) {
      if (promptStep["validation"] !== undefined) {
        let validationArray: Record<string, string>[] = promptStep[
          "validation"
        ] as unknown as Record<string, string>[];
        validationArray.forEach((validation) => {
          console.log(validation.name);
          console.log(validation.type);
          console.log(validation);
        });
        this.currTestStep = next[0];
      } else {
        this.currTestStep = next[0];
      }

      let idx = this.promptData.indexOf(next[0]);
      console.log(idx);
      this.popupComp.changePromptTitle(next[0], idx);
      this.popupComp.currentPromptIndex = idx;
      next.length
        ? document.getElementById(`step_${idx}`).scrollIntoView()
        : console.log("Step not in prompt");
      this.checkType();
      this.ref.detectChanges();
    } else {
      let nextPrompt = this.allJSON["prompts"][promptStep["next"]];
      this.currTestStep = nextPrompt;
      this.ref.detectChanges();
    }

    if (promptStep["save-as"] !== undefined) {
      this.globalReqDetails[promptStep["save-as"]] = userInput;
      console.log(this.globalReqDetails);
      console.log("<<<this.globalReqDetails>>>");
    }
  }

  saveToGlobalReqDet(data: any) {
    this.globalReqDetails[data] = data;
  }

  performPromptAction(
    action: string,
    currTestStep: Record<
      string,
      string | Record<string, string | boolean | Record<string, string>[]>
    >
  ) {
    if (action === "transact" || action === "update-parameters") {
      let apiRoute = currTestStep["external-fetch"]["route"];

      let apiKey = Object.keys(this.allJSON["api"])[0];

      let endpointObj: Record<string, string> =
        this.allJSON["api"][apiKey]["request-settings"]["endpoints"][apiRoute];

      console.log(endpointObj);

      if (endpointObj !== undefined) {
        this.toastrService.info("An API Call is being made", "API Call Status");

        this.apiCallStatus$ = this.ussdSimulatorService
          .makeApiCall(endpointObj, apiKey, this.allJSON)
          .pipe(
            map((resp) => {
              if (resp) {
                this.handleApiResponse(
                  resp,
                  currTestStep["external-fetch"] as unknown as Record<
                    string,
                    string | boolean | Record<string, string>[]
                  >,
                  endpointObj
                );

                return resp;
              }
            }),
            catchError((error) => {
              if (error.error instanceof ErrorEvent) {
                // let errorMsg = `Error: ${error.error.message}`;
                // this.currTestStep =
                //   this.allJSON["prompts"][
                //     currTestStep["external-fetch"]["error"] as string
                //   ];
                // this.currTestStep["title"] = this.handleJsonData.getKeyFromLang(
                //   this.allJSON,
                //   this.currTestStep["name"]
                // );
                // this.checkType();
                // this.ref.detectChanges();
                // this.toastrService.error(errorMsg, "Redis Error");
              } else {
                let errorMsg = `Error: ${error.message}`;
                let nextError = this.promptData.filter(
                  (step) =>
                    step.name ===
                    (currTestStep["external-fetch"]["error"] as string)
                );
                this.currTestStep = this.allJSON["prompts"][
                  currTestStep["external-fetch"]["error"] as string
                ]
                  ? this.allJSON["prompts"][
                      currTestStep["external-fetch"]["error"] as string
                    ]
                  : nextError[0];

                this.currTestStep["title"] = this.handleJsonData.getKeyFromLang(
                  this.allJSON,

                  this.currTestStep["name"]
                );

                this.checkType();
                this.ref.detectChanges();
                this.toastrService.error(errorMsg, "Redis Error 2");
              }

              return of(null);
            })
          );
      } else {
        this.toastrService.error("Endpoint does not exist", "Error");
        return false;
        // display external fetch on error
      }
    } else {
      this.toastrService.info(action, action);
    }
  }

  handleApiResponse(
    resp: any,
    externalFetchObj: Record<
      string,
      string | boolean | Record<string, string>[]
    >,
    endpointObj: Record<string, string>
  ) {
    let respStatusObj = endpointObj["response"]["status"];
    let respKey: string = respStatusObj["field"];
    respKey = respKey.includes("data") ? respKey.replace("data.", "") : respKey;

    let respKeyMatchingValue = respStatusObj["matches"][0]["code"];
    let responseFromApi = resp.data ? resp.data[respKey] : resp[respKey];

    if (responseFromApi !== undefined) {
      let apiSuccess = responseFromApi === respKeyMatchingValue ? true : false;
      if (apiSuccess === true) {
        this.matchingRespFlag = true;
        let isCachePresent = externalFetchObj["cache"] ? true : false;
        let saveAsKeyName = externalFetchObj["cache-parameters"][0]["save-as"];
        let apiDataKeyName = externalFetchObj["cache-parameters"][0]["path"];

        if (isCachePresent) {
          this.globalReqDetails[saveAsKeyName] = resp.data
            ? resp.data[apiDataKeyName]
            : resp[apiDataKeyName];
        }

        let next = this.promptData.filter(
          (step) => step.name === externalFetchObj["success"]
        );

        if (next.length > 0) {
          this.currTestStep = next[0];

          let idx = this.promptData.indexOf(next[0]);
          console.log(idx);
          this.popupComp.changePromptTitle(next[0], idx);
          this.popupComp.currentPromptIndex = idx;
          document.getElementById(`step_${idx}`).scrollIntoView();

          if (
            this.currTestStep["options"] ===
            externalFetchObj["cache-parameters"]["save-as"]
          ) {
            let apiDataKeyName = externalFetchObj["cache-parameters"]["meters"];
            let data: any = resp.data
              ? resp.data[apiDataKeyName]
              : resp[apiDataKeyName];

            let tempArr = [];
            data.map((item) => {
              tempArr.push({
                label: item,
                value: item,
              });
            });
          }
        } else {
          this.currTestStep =
            this.allJSON["prompts"][externalFetchObj["success"] as string];

          this.currTestStep["title"] = this.handleJsonData.getKeyFromLang(
            this.allJSON,

            this.currTestStep["name"]
          );
        }

        this.toastrService.success(
          "API Response matched expected value",
          "API Success"
        );
      }
    } else {
      this.matchingRespFlag = false;

      this.currTestStep =
        this.allJSON["prompts"][
          this.currTestStep["external-fetch"]["error"] as string
        ];
      this.currTestStep["title"] = this.handleJsonData.getKeyFromLang(
        this.allJSON,

        this.currTestStep["name"]
      );

      this.toastrService.error(
        "API Response did not match expected value",
        "API Response Error"
      );
    }
    this.checkType();
    this.ref.detectChanges();
  }

  closePromptTest() {
    this.isTesting.emit(false);
    let exampleDiv: HTMLElement = document.getElementById("promptList");
    exampleDiv.style.pointerEvents = "all";
  }
}
