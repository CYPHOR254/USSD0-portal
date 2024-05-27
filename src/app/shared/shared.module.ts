import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxSelectModule } from "ngx-select-ex";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { TabsModule } from "ngx-bootstrap/tabs";
import { NgJsonEditorModule } from "ang-jsoneditor";
import { ModalModule } from "ngx-bootstrap/modal";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NzStepsModule } from "ng-zorro-antd/steps";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzInputNumberModule } from "ng-zorro-antd/input-number";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzDescriptionsModule } from "ng-zorro-antd/descriptions";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzBadgeModule } from "ng-zorro-antd/badge";
import { NzTabsModule } from "ng-zorro-antd/tabs";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
import { NzRadioModule } from "ng-zorro-antd/radio";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatCardModule } from "@angular/material/card";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTabsModule } from "@angular/material/tabs";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatMenuModule } from "@angular/material/menu";
import { SearchPipe } from "./pipes/search.pipe";
import { ActiveLabelComponent } from "./components/active-label/active-label.component";

@NgModule({
  declarations: [SearchPipe, ActiveLabelComponent],
  entryComponents: [],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule,
    DragDropModule,
    TabsModule,
    NgJsonEditorModule,
    ModalModule.forRoot(),
    NgbModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzInputNumberModule,
    NzFormModule,
    NzInputModule,
    NzDescriptionsModule,
    NzCardModule,
    NzModalModule,
    NzBadgeModule,
    NzTabsModule,
    NzTableModule,
    NzDropDownModule,
    NzCheckboxModule,
    NzRadioModule,
    NzTagModule,
    NzToolTipModule,
    BsDatepickerModule.forRoot(),
    MatButtonModule,
    MatExpansionModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatIconModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatMenuModule,
  ],
  exports: [
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule,
    DragDropModule,
    TabsModule,
    NgJsonEditorModule,
    ModalModule,
    NgbModule,
    NzStepsModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzInputNumberModule,
    NzFormModule,
    NzInputModule,
    NzDescriptionsModule,
    NzCardModule,
    NzModalModule,
    NzBadgeModule,
    NzTabsModule,
    NzTableModule,
    NzDropDownModule,
    NzCheckboxModule,
    NzRadioModule,
    NzTagModule,
    NzToolTipModule,
    BsDatepickerModule,
    MatStepperModule,
    MatTabsModule,
    MatIconModule,
    MatDialogModule,
    MatSlideToggleModule,
    SearchPipe,
    MatMenuModule,
    ActiveLabelComponent,
  ],
})
export class SharedModule {
  constructor() {}
}
