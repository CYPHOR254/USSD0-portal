import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-edit-mapper-obj',
  templateUrl: './add-edit-mapper-obj.component.html',
  styleUrls: ['./add-edit-mapper-obj.component.scss']
})
export class AddEditMapperObjComponent implements OnInit {
  ussdMapperObjForm: FormGroup;
  title: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddEditMapperObjComponent>
  ) { }

  ngOnInit(): void {
    this.data['adapterRulesArr'].push(true)
    this.data['adapterRulesArr'].push(false)
    
    this.title = this.data['keyName'] ? "Edit Mapper Object" : "Add Mapper Object";
    this.ussdMapperObjForm = new FormGroup({
      keyName: new FormControl(this.data["keyName"] ? this.data["keyName"] : ""),
      keyValue: new FormControl(this.data["keyValue"] ? this.data["keyValue"] : ""),
      inAccDtl: new FormControl(this.data["inAccDtl"] == true ? true : false),
    });
  }

  addMatchesObjStatus() {
    console.log(this.ussdMapperObjForm.value);
    let temp = {
      keyName: this.ussdMapperObjForm["controls"]["keyName"].value,
      keyValue: this.ussdMapperObjForm["controls"]["keyValue"].value,
      inAccDtl: this.ussdMapperObjForm["controls"]["inAccDtl"].value,
    };

    console.log(temp);

    this.dialogRef.close(temp)
  }

}
