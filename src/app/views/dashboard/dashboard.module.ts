import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

import { ChartsModule } from "ng2-charts";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ButtonsModule } from "ngx-bootstrap/buttons";

import { DashboardComponent } from "./dashboard.component";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { SharedModule } from "../../shared/shared.module";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { AddconnModalComponent } from "./addconn-modal/addconn-modal.component";
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { MatTableModule } from "@angular/material/table";
import { AddussdModalComponent } from './addussd-modal/addussd-modal.component';

@NgModule({
  imports: [
    FormsModule,
    NzDropDownModule,
    DashboardRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    SharedModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule
  ],
  declarations: [DashboardComponent, AddconnModalComponent, AddussdModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [AddconnModalComponent, AddussdModalComponent],
})
export class DashboardModule {}
