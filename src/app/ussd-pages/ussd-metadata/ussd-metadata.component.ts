import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { HandleUssdJsonService } from "../../shared/services/handle-ussd-json.service";

@Component({
  selector: "app-ussd-metadata",
  templateUrl: "./ussd-metadata.component.html",
  styleUrls: ["./ussd-metadata.component.scss"],
})
export class UssdMetadataComponent implements OnInit {
  configForm: FormGroup = new FormGroup({});
  apiMetadataForm: FormGroup = new FormGroup({});

  allData$: Observable<Record<string, string>>;
  allData: Record<string, string>;

  metadataKeys$: Observable<string[]>;
  configsFromRedis$: Observable<Record<string, string> | string>;
  apiMetadataKeys$: Observable<string[]>;

  configJsonData;
  apiJsonData;

  errorMsg: string;

  constructor(
    private handleJsonService: HandleUssdJsonService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    try {
      this.allData$ = this.handleJsonService.allJsonData$.pipe(
        map((resp: Record<string, string>): Record<string, string> => {
          if (resp) {
            this.allData = { ...resp };

            for (let key in resp) {
              if (key === "config") {
                this.configJsonData = resp[key];
                this.configsFromRedis$ = of(this.configJsonData["meta-data"]);

                let metadataKeys = Object.keys(
                  this.configJsonData["meta-data"]
                );

                this.metadataKeys$ = of(metadataKeys);
                metadataKeys.map((key) => {
                  this.configForm.addControl(
                    key,
                    new FormControl(
                      `${this.configJsonData["meta-data"][key]}`,
                      Validators.required
                    )
                  );
                });

                let pageOne =
                  this.configJsonData["page-switch-check"]["options"]["client"][
                    "page"
                  ];
                sessionStorage.setItem("pageOne", pageOne);
              }

              if (key === "api") {
                this.apiJsonData = resp[key];
                this.configsFromRedis$ = of(this.apiJsonData);

                let apiMainKey: string = Object.keys(this.apiJsonData)[0];

                let apiMetaDataKeys: string[] = Object.keys(
                  this.apiJsonData[apiMainKey]["meta-data"]
                );

                this.apiMetadataKeys$ = of(apiMetaDataKeys);
                apiMetaDataKeys.map((key) => {
                  this.apiMetadataForm.addControl(
                    key,
                    new FormControl(
                      {
                        value: `${this.apiJsonData[apiMainKey]["meta-data"][key]}`,
                        disabled:
                          key === "payload-format" || key === "channel"
                            ? true
                            : false,
                      },
                      [Validators.required]
                    )
                  );
                });

                // let serverNames = Object.keys(
                //   this.apiJsonData[apiMainKey]["data-sources"]
                // );
                // serverNames = serverNames.filter(
                //   (server) => server !== "timeout" && server !== "offline-timeout"
                // );

                // this.serversArray = [];
                // serverNames.map((server) => {
                //   this.serversArray.push({
                //     ...this.apiJsonData[apiMainKey]["data-sources"][server],
                //     serverName: server,
                //   });
                // });

                // this.dataSource = new MatTableDataSource(this.serversArray);
              }

              // if (key === "language") {
              //   let keys = Object.keys(this.allData[key]);
              //   let langArr = new Set();

              //   keys.map((item) => {
              //     let objLangs = Object.keys(this.allData[key][item]);
              //     objLangs.map((lang) => langArr.add(lang));
              //   });
              //   this.languagesArray = Array.from(langArr);
              // }
            }
            return resp;
          }
          this.toastrService.error("USSD unavailable", "USSD Parsing Error");
          this.router.navigate(["/overview"]);
          throw new Error("No configuration files to read from!!");
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
          return of({});
        })
      );
    } catch (error) {
      this.toastrService.error(error, "Data Loading Error");
      this.router.navigate(["/overview"]);
    }
  }

  submit() {
    console.log(this.configForm.value);
    console.log(this.apiMetadataForm.value);
    console.log(this.allData, "one>>>>>>>>>>>>>>>>>>>>>>>>>>");

    this.configJsonData["meta-data"] = Object.assign(
      { ...this.configJsonData["meta-data"] },
      { ...this.configForm.value }
    );

    let apiMainKey: string = Object.keys(this.apiJsonData)[0];
    this.apiJsonData[apiMainKey] = Object.assign(
      {
        ...this.apiJsonData[apiMainKey],
      },
      { "meta-data": { ...this.apiMetadataForm.value } }
    );

    this.allData["api"] = this.apiJsonData;
    this.allData["config"] = this.configJsonData;

    console.log(this.allData, "two<<<<<<<<<<<<<<<<<<<<<<<<<<");

    this.handleJsonService.updateAllJsonData(this.allData);
    this.toastrService.success('Meta-Data Information updated', 'Update Status')

    // this.router.navigate(["/ussd/ussd-simulator"]);
  }
}
