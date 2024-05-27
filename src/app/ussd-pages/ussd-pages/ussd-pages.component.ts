import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Observable, Subscription, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { HandleUssdJsonService } from "../../shared/services/handle-ussd-json.service";
import { UssdSimulatorService } from "../ussd-simulator/services/ussd-simulator-service.service";
import { EditOptionComponent } from "../ussd-simulator/components/edit-option/edit-option.component";
import { AddOptionComponent } from "../ussd-simulator/components/add-option/add-option.component";
import { NzModalService } from "ng-zorro-antd/modal";

@Component({
  selector: "app-ussd-pages",
  templateUrl: "./ussd-pages.component.html",
  styleUrls: ["./ussd-pages.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UssdPagesComponent implements OnInit {
  allJSON: Record<string, any>;
  pagesJSON: string;
  pagesKeys: string[];
  languagesJSON: string;
  configMetadataJSON: any;
  existingPages$: Observable<string[]>;
  pageOptions$: Observable<Record<string, any>[]>;

  selectedPage: string;
  existingPageLinks: string[] = [];

  private subscription: Subscription[] = [];

  errorMsg: string;
  currentPageData: any;
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
    console.log("has been called");

    this.existingPages$ = this.handleJsonData.allJsonData$.pipe(
      map((resp: Record<string, string>) => {
        if (resp) {
          this.allJSON = { ...resp };
          this.pagesJSON = this.allJSON["pages"];
          this.languagesJSON = this.allJSON["language"];
          this.configMetadataJSON = this.allJSON["config"]["meta-data"];

          this.pagesKeys = Object.keys(this.allJSON["pages"]);

          return this.pagesKeys;
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

  getPageOptions(pageName: string) {
    this.selectedPage = pageName;
    this.existingPageLinks.push(pageName)

    var lists = document.querySelectorAll("p");
    lists.forEach(function (element) {
      element.classList.remove("active");
    });

    var selected = document.getElementById(pageName);
    selected.classList.add("active");

    this.currentPageData = { ...this.pagesJSON[pageName] };

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
      let displayLabel = option.label.includes(" ") ? option.label : undefined;

      displayLabel =
        displayLabel === undefined
          ? this.handleJsonData.getKeyFromLang(this.allJSON, option.label)
          : displayLabel;

      if (!displayLabel) {
        let tempLabel = option.label.replace("-page", "");

        displayLabel = this.handleJsonData.getKeyFromLang(
          this.allJSON,
          tempLabel
        );

        displayLabel = displayLabel === undefined ? displayLabel : "NULL";
      }

      let newObj = Object.assign(
        { ...option },
        {
          title: displayLabel,
        }
      );
      updatedOptionsArr.push(newObj);
      this.existingPageLinks.push(option.name)
    });

    this.currentPageData = Object.assign(
      { ...this.currentPageData },
      {
        options: updatedOptionsArr,
      }
    );

    this.pageOptions$ = of(this.currentPageData["options"]);
  }

  editOption(option: any) {
    console.log(option);

    let x = this.dialog.open(EditOptionComponent, {
      data: {
        pageName: this.selectedPage,
        selectedOption: option,
      },
      width: "55%",
      position: { right: "50px" },
      disableClose: true,
    });

    let xy = x.afterClosed().subscribe(() => {
      this.fetchExistingData();
      this.getPageOptions(this.selectedPage);
      this.ref.detectChanges();
    });

    this.subscription.push(xy);
  }

  addOption() {
    let x = this.dialog.open(AddOptionComponent, {
      data: {
        pageName: this.currentPageData.name,
        previousPages: this.existingPageLinks,
      },
      width: "55%",
      position: { right: "50px" },
    });
    
    let xy = x.afterClosed().subscribe(() => {
      this.fetchExistingData();
      this.getPageOptions(this.selectedPage);
      this.ref.detectChanges();
    });

    this.subscription.push(xy);
  }

  filterPromptSteps(event: any) {
    console.log(event.target.value);
    let originalList = [...this.pagesKeys];

    originalList = originalList.filter((step) => {
      return step.includes(event.target.value);
    });
    this.existingPages$ = of([]);
    this.existingPages$ = of(originalList);
  }

  deleteOption(option: any) {
    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete option to <b style="color:red;">${option.name}</b>?`,
      nzContent: '<b style="color:red;">It will be permanently DELETED</b>',
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        let idx = this.currentPageData.options.findIndex(
          (opt) => opt.name === option.name
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
          this.allJSON["pages"][this.currentPageData.name]
        );

        this.ref.detectChanges();

        this.toastrService.success(
          `Option ${option} removed successfully`,
          "Removal Status"
        );
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.error(
          `Option ${option} removed failure`,
          "Removal Status"
        );
      },
    });
  }
}
