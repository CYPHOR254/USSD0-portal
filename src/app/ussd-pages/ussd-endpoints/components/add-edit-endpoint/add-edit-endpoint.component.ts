import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { NzModalService } from "ng-zorro-antd/modal";
import { ToastrService } from "ngx-toastr";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { HandleUssdJsonService } from "../../../../shared/services/handle-ussd-json.service";

@Component({
  selector: "app-add-edit-endpoint",
  templateUrl: "./add-edit-endpoint.component.html",
  styleUrls: ["./add-edit-endpoint.component.scss"],
})
export class AddEditEndpointComponent implements OnInit {
  formTitle: string;
  endpointForm: FormGroup;
  allData$: Observable<Record<string, string>>;
  allData: Record<string, string>;
  serversArray = [];
  dataSource: MatTableDataSource<Record<string, string>[]> =
    new MatTableDataSource<Record<string, string>[]>([]);
  displayedColumns: string[] = ["name", "value", "action"];
  rgDataSource: MatTableDataSource<Record<string, string>[]> =
    new MatTableDataSource<Record<string, string>[]>([]);
  requestObjArray = [];
  custHeadersFlag: boolean;
  hasRequestGroup: boolean = false;
  headersDataSource: MatTableDataSource<Record<string, string>[]> =
    new MatTableDataSource<Record<string, string>[]>([]);
  custHeadersArray = [];
  headersArray = [
    "A-IM", "Accept", "Accept-Charset", "Accept-Encoding", "Accept-Language", 
    "Accept-Datetime", "Access-Control-Request-Method", "Access-Control-Request-Headers", 
    "Authorization", "Cache-Control", "Connection", "Content-Length", 
    "Content-Type", "Cookie", "Date", "Expect", "Forwarded", "From", "Host", 
    "If-Match", "If-Modified-Since", "If-None-Match", "If-Range", 
    "If-Unmodified-Since", "Max-Forwards", "Origin", "Pragma", 
    "Proxy-Authorization", "Range", "Referer", "TE", "User-Agent", "Upgrade", 
    "Via", "Warning"
  ];

  showJsonCard = false;
  jsonSnippetText: string = `{
    "channel_details": {
        "channel_key": "e737ab200a2140d6be4e482284a1af43",
        "host": "127.0.0.1",
        "geolocation": "geolocation",
        "user_agent_version": "Sumsang",
        "user_agent": "Android 12",
        "client_id": "LOMANUSSD",
        "channel": "USSD",
        "deviceId": "1cc2a3a5559835b1"
    },
    "payload": {
        "phoneNumber": "254795881812"
    },
    "txntimestamp": "2024-03-22T13:00:26",
    "xref": "130026"
  }`;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public endpointData: { [key: string]: Record<string, string> | string },
    private handleJsonService: HandleUssdJsonService,
    private toastrService: ToastrService,
    private popConfirmModal: NzModalService,
    private dialogRef: MatDialogRef<AddEditEndpointComponent>
  ) {
    this.formTitle = this.endpointData ? "Edit endpoint" : "Add endpoint";
    this.endpointForm = new FormGroup({
      name: new FormControl(
        {
          value: this.endpointData ? this.endpointData["name"] : "",
          disabled:
            this.endpointData && this.endpointData["name"] === "profile"
              ? true
              : false,
        },
        [Validators.required]
      ),
      success: new FormControl(
        this.endpointData &&
        this.endpointData["value"]["response"]["status"] !== undefined
          ? this.endpointData["value"]["response"]["status"]["field"]
          : "",
        [Validators.required]
      ),
      successValue: new FormControl(
        this.endpointData &&
        this.endpointData["value"]["response"]["status"] !== undefined
          ? this.endpointData["value"]["response"]["status"]["matches"][0]["code"]
          : "",
        [Validators.required]
      ),
      successType: new FormControl(
        this.endpointData &&
        this.endpointData["value"]["response"]["status"] !== undefined
          ? typeof this.endpointData["value"]["response"]["status"]["matches"][0]["code"]
          : "",
        [Validators.required]
      ),
      error: new FormControl(
        this.endpointData &&
        this.endpointData["value"]["response"]["status"] !== undefined
          ? this.endpointData["value"]["response"]["status"]["error"]["message"]
          : "",
        [Validators.required]
      ),
      path: new FormControl(
        this.endpointData
          ? this.endpointData["value"]["path-suffix"] ||
            this.endpointData["value"]["request-path"]
          : ""
      ),
      adapter: new FormControl(""),
      overrideSource: new FormControl(
        this.endpointData &&
        this.endpointData["value"]["override-source"] !== undefined
          ? this.endpointData["value"]["override-source"]
          : ""
      ),
      customHeaders: new FormControl(""),
      requestGroup: new FormControl(""),
      requestName: new FormControl(""),
      requestValue: new FormControl(""),
      headerName: new FormControl(""),
      headerValue: new FormControl(""),
      rgName: new FormControl(""),
      rgValue: new FormControl(""),
      groupTo: new FormControl(
        this.endpointData &&
        this.endpointData["value"]["request-group"] !== undefined
          ? this.endpointData["value"]["request-group"]["group-to"]
          : ""
      ),
      groupFormat: new FormControl(
        this.endpointData &&
        this.endpointData["value"]["request-group"] !== undefined
          ? this.endpointData["value"]["request-group"]["group-format"]
          : ""
      ),
      groupBase64: new FormControl(
        this.endpointData &&
        this.endpointData["value"]["request-group"] !== undefined
          ? this.endpointData["value"]["request-group"]["group-base64"]
          : ""
      ),
    });
  }

  ngOnInit(): void {
    this.allData$ = this.handleJsonService.allJsonData$.pipe(
      map((resp: Record<string, string>): Record<string, string> => {
        if (resp) {
          this.allData = { ...resp };
          let apiJsonData = resp["api"];
          let apiMainKey: string = Object.keys(apiJsonData)[0];
          let serverNames = Object.keys(
            apiJsonData[apiMainKey]["data-sources"]
          );
          this.serversArray = [];
          serverNames.map((server) => {
            this.serversArray.push({
              ...apiJsonData[apiMainKey]["data-sources"][server],
              serverName: server,
            });
          });
          return resp;
        }
        throw new Error("No configuration files to read from!!");
      }),
      catchError((error) => {
        if (error.error instanceof ErrorEvent) {
          let errorMsg = `Error: ${error.error.message}`;
          this.toastrService.error(errorMsg, "Redis Error");
        } else {
          let errorMsg = `Error: ${error.message}`;
          this.toastrService.error(errorMsg, "Redis Error");
        }
        return of({});
      })
    );

    if (
      this.endpointData !== undefined &&
      !!this.endpointData["value"]["request"]
    ) {
      this.hasRequestGroup = false;
      this.endpointForm.controls["requestGroup"].setValue(false);
      let requestKeys = Object.keys(this.endpointData["value"]["request"]);
      this.requestObjArray = [];
      requestKeys.forEach((key) => {
        this.requestObjArray.push({
          name: key,
          value: this.endpointData["value"]["request"][key],
        });
      });
      this.dataSource = new MatTableDataSource(this.requestObjArray);
    } else if (
      this.endpointData !== undefined &&
      !!this.endpointData["value"]["request-group"]
    ) {
      this.hasRequestGroup = true;
      this.endpointForm.controls["requestGroup"].setValue(true);
      let requestKeys = Object.keys(
        this.endpointData["value"]["request-group"]["data"]
      );
      this.requestObjArray = [];
      requestKeys.forEach((key) => {
        this.requestObjArray.push({
          name: key,
          value: this.endpointData["value"]["request-group"]["data"][key],
        });
      });
      this.rgDataSource = new MatTableDataSource(this.requestObjArray);
    }

    if (this.endpointData["value"]["custom-headers"] !== undefined) {
      this.endpointForm.controls["customHeaders"].setValue(true);
      this.custHeadersFlag = true;
      let headerKeys = Object.keys(
        this.endpointData["value"]["custom-headers"]
      );
      this.custHeadersArray = [];
      headerKeys.forEach((key) => {
        this.custHeadersArray.push({
          name: key,
          value: this.endpointData["value"]["custom-headers"][key],
        });
      });
      this.headersDataSource = new MatTableDataSource(this.custHeadersArray);
    } else {
      this.endpointForm.controls["customHeaders"].setValue(false);
      this.custHeadersFlag = false;
    }

    if (this.endpointData["value"]["response"]["adapter"] !== undefined) {
      this.endpointForm.controls["adapter"].setValue(
        this.endpointData["value"]["response"]["adapter"]
      );
    }
  }

  addRequest() {
    if (!this.hasRequestGroup) {
      let name = this.endpointForm.controls["requestName"].value;
      let value = this.endpointForm.controls["requestValue"].value;

      if (name === null || name === "" || value === null || value === "") {
        this.toastrService.warning("Cannot add a null value", "Addition error");
      } else {
        this.requestObjArray.push({ name, value });
        this.dataSource = new MatTableDataSource(this.requestObjArray);
        this.endpointForm.controls["requestName"].reset();
        this.endpointForm.controls["requestValue"].reset();
        this.toastrService.success("Request added successfully", "Addition status");
      }
    } else {
      let name = this.endpointForm.controls["rgName"].value;
      let value = this.endpointForm.controls["rgValue"].value;

      if (name === null || name === "" || value === null || value === "") {
        this.toastrService.warning("Cannot add a null value", "Addition error");
      } else {
        this.requestObjArray.push({ name, value });
        this.rgDataSource = new MatTableDataSource(this.requestObjArray);
        this.endpointForm.controls["rgName"].reset();
        this.endpointForm.controls["rgValue"].reset();
        this.toastrService.success("Request added successfully", "Addition status");
      }
    }
  }

  addJsonSnippet() {
    try {
      const snippet = JSON.parse(this.jsonSnippetText);

      // Create an array of key-value pairs from the JSON object
      const requestData = [
        { name: 'channel_details', value: snippet.channel_details },
        { name: 'payload', value: snippet.payload },
        { name: 'txntimestamp', value: snippet.txntimestamp },
        { name: 'xref', value: snippet.xref },
      ];

      // Add the request data to the request array
      this.requestObjArray.push(...requestData);
      this.dataSource = new MatTableDataSource(this.requestObjArray);
      this.toastrService.success("JSON snippet added successfully", "Addition status");
      this.showJsonCard = false;
    } catch (error) {
      this.toastrService.error("Invalid JSON format", "Addition error");
    }
  }

  addHeader() {
    let name = this.endpointForm.controls["headerName"].value;
    let value = this.endpointForm.controls["headerValue"].value;

    if (name === null || name === "" || value === null || value === "") {
      this.toastrService.warning("Cannot add a null value", "Addition error");
    } else {
      this.custHeadersArray.push({ name, value });
      this.headersDataSource = new MatTableDataSource(this.custHeadersArray);
      this.endpointForm.controls["headerName"].reset();
      this.endpointForm.controls["headerValue"].reset();
      this.toastrService.success("Header added successfully", "Addition status");
    }
  }

  editRequest(request: any, type: string) {
    if (type === "request" && !this.hasRequestGroup) {
      let idx = this.requestObjArray.indexOf(request);
      this.requestObjArray.splice(idx, 1);
      this.endpointForm.controls["requestName"].setValue(request["name"]);
      this.endpointForm.controls["requestValue"].setValue(request["value"]);
    } else if (type === "headers") {
      let idx = this.custHeadersArray.indexOf(request);
      this.custHeadersArray.splice(idx, 1);
      this.endpointForm.controls["headerName"].setValue(request["name"]);
      this.endpointForm.controls["headerValue"].setValue(request["value"]);
    } else if (type === "request" && this.hasRequestGroup) {
      let idx = this.requestObjArray.indexOf(request);
      this.requestObjArray.splice(idx, 1);
      this.endpointForm.controls["rgName"].setValue(request["name"]);
      this.endpointForm.controls["rgValue"].setValue(request["value"]);
    } else {
      this.toastrService.warning("Null");
    }
  }

  deleteRequest(request: any, type: string) {
    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete this item</b>?`,
      nzContent: '<b style="color:red;">It will be permanently DELETED</b>',
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        if (type === "request") {
          let idx = this.requestObjArray.indexOf(request);
          this.requestObjArray.splice(idx, 1);
          this.dataSource = new MatTableDataSource(this.requestObjArray);
        } else if (type === "headers") {
          let idx = this.custHeadersArray.indexOf(request);
          this.custHeadersArray.splice(idx, 1);
          this.headersDataSource = new MatTableDataSource(this.custHeadersArray);
        } else {
          this.toastrService.warning("Null");
        }
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.error("Item not deleted", "Deletion Status");
      },
    });
  }

  toggleHeaders(event: Event) {
    this.custHeadersFlag = !this.custHeadersFlag;
  }

  toggleRequestGroup(event: Event) {
    this.hasRequestGroup = !this.hasRequestGroup;
  }

  submit() {
    let name = this.endpointForm.controls["name"].value;
    let successField = this.endpointForm.controls["success"].value;
    let successValue = this.endpointForm.controls["successValue"].value;
    let errorField = this.endpointForm.controls["error"].value;

    let newObj;
    if (!this.hasRequestGroup) {
      newObj = {
        [name]: {
          response: {
            status: {
              field: successField,
              error: {
                message: errorField,
              },
            },
            save: false,
          },
          request: {},
        },
      };
    } else {
      newObj = {
        [name]: {
          response: {
            status: {
              field: successField,
              error: {
                message: errorField,
              },
            },
            save: false,
          },
          "request-group": {},
        },
      };
    }

    let successValueType = this.endpointForm.controls["successType"].value;
    if (successValueType === "string") {
      successValue = successValue.toString();
    } else if (successValueType === "number") {
      try {
        successValue = parseInt(successValue, 10);
      } catch (error) {
        this.toastrService.warning(
          "Error converting your success value to an integer",
          "Status"
        );
      }
    } else if (successValueType === "boolean") {
      successValue = !!successValue;
    } else {
      successValue = successValue;
    }

    newObj[name]["response"]["status"]["matches"] = [
      {
        code: successValue,
        status: "success",
      },
    ];

    let path = this.endpointForm.controls["path"].value;
    if (path !== "" && path !== null) {
      newObj[name]["path-suffix"] = path.toString();
    }

    let overrideSource = this.endpointForm.controls["overrideSource"].value;
    if (overrideSource !== "" && overrideSource !== null) {
      newObj[name]["override-source"] = overrideSource.toString();
    }

    let adapter = this.endpointForm.controls["adapter"].value;
    if (adapter !== "" && adapter !== null) {
      newObj[name]["response"]["adapter"] = adapter.toString();
    }

    let customHeaders = this.endpointForm.controls["customHeaders"].value;
    if (customHeaders !== false) {
      let tempObj = {};
      this.custHeadersArray.forEach((header) => {
        tempObj[header.name] = header.value;
      });
      newObj[name]["custom-headers"] = tempObj;
    }

    let tempObj = {};
    if (!this.hasRequestGroup) {
      this.requestObjArray.forEach((request) => {
        tempObj[request.name] = request.value;
      });
      newObj[name]["request"] = tempObj;
    } else {
      this.requestObjArray.forEach((request) => {
        tempObj[request.name] = request.value;
      });
      newObj[name]["request-group"]["data"] = tempObj;
      newObj[name]["request-group"]["enabled"] = true;
      newObj[name]["request-group"]["group-to"] =
        this.endpointForm.controls["groupTo"].value;
      newObj[name]["request-group"]["group-format"] =
        this.endpointForm.controls["groupFormat"].value;
      newObj[name]["request-group"]["group-base64"] =
        this.endpointForm.controls["groupBase64"].value;
    }

    let apiMainKey: string = Object.keys(this.allData["api"])[0];
    if (this.endpointData !== undefined) {
      delete this.allData["api"][apiMainKey]["request-settings"]["endpoints"][
        this.endpointData["name"]
      ];
      this.allData["api"][apiMainKey]["request-settings"]["endpoints"][name] = {
        ...newObj[name],
      };
      this.toastrService.success(
        "Endpoint Updated successfully",
        "Update Status"
      );
    } else {
      this.allData["api"][apiMainKey]["request-settings"]["endpoints"][name] =
        newObj[name];
      this.toastrService.success(
        "Endpoint Added successfully",
        "Change Status"
      );
    }

    this.handleJsonService.updateAllJsonData(this.allData);
    this.dialogRef.close();
  }
}
