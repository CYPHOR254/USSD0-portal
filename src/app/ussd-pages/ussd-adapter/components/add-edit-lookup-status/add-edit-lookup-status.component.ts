import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { KeyCode } from "@ng-select/ng-select/lib/ng-select.types";

@Component({
  selector: "app-add-edit-lookup-status",
  templateUrl: "./add-edit-lookup-status.component.html",
  styleUrls: ["./add-edit-lookup-status.component.scss"],
})
export class AddEditLookupStatusComponent implements OnInit {
  ussdLookupStatusForm: FormGroup;
  title: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddEditLookupStatusComponent>
  ) {}

  ngOnInit(): void {
    console.log(this.data);
    
    let codeType = typeof this.data['item']["code"];
    console.log(codeType);

    this.title = this.data['item'] ? "Edit Status" : "Add Status";
    this.ussdLookupStatusForm = new FormGroup({
      code: new FormControl(this.data['item'] ? this.data['item']["code"] : ""),
      status: new FormControl(this.data['item'] ? this.data['item']["status"] : ""),
      codeType: new FormControl(this.data['item'] ? codeType : ""),
    });
  }

  addEditLookupStatus() {
    console.log(this.ussdLookupStatusForm.value);
    let temp = {
      code: this.ussdLookupStatusForm["controls"]["code"].value,
      status: this.ussdLookupStatusForm["controls"]["status"].value,
    };
    if (this.ussdLookupStatusForm["controls"]["codeType"].value === "string") {
      temp["code"] = temp["code"].toString();
    } else if (
      this.ussdLookupStatusForm["controls"]["codeType"].value === "number"
    ) {
      temp["code"] = parseInt(temp["code"]);
    } else if (
      this.ussdLookupStatusForm["controls"]["codeType"].value === "boolean"
    ) {
      temp["code"] = Boolean(temp["code"]);
    }

    console.log(temp);

    this.dialogRef.close(temp)
  }
}
