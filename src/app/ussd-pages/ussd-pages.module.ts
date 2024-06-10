import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UssdPagesRoutingModule } from "./ussd-pages-routing.module";
import { SharedModule } from "../shared/shared.module";

import { LanguageComponent } from "./language/language.component";
import { UssdSimulatorComponent } from "./ussd-simulator/ussd-simulator.component";
import { UssdPopupComponent } from "./ussd-simulator/ussd-popup/ussd-popup.component";
import { AddAlertComponent } from "./ussd-simulator/components/add-alert/add-alert.component";
import { EditPageComponent } from "./ussd-simulator/components/edit-page/edit-page.component";
import { AddOptionComponent } from "./ussd-simulator/components/add-option/add-option.component";
import { EditOptionComponent } from "./ussd-simulator/components/edit-option/edit-option.component";
import { NzTreeModule } from "ng-zorro-antd/tree";
import { UssdSetupComponent } from "./ussd-setup/ussd-setup.component";
import { MatStepperModule } from "@angular/material/stepper";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatRadioModule } from "@angular/material/radio";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { TestPromptComponent } from "./ussd-simulator/components/test-prompt/test-prompt.component";
import { UssdMetadataComponent } from "./ussd-metadata/ussd-metadata.component";
import { UssdEnvironmentsComponent } from "./ussd-environments/ussd-environments.component";
import { UssdEndpointsComponent } from "./ussd-endpoints/ussd-endpoints.component";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AddEditEndpointComponent } from "./ussd-endpoints/components/add-edit-endpoint/add-edit-endpoint.component";
import { AddEditPromptStepComponent } from "./ussd-simulator/components/add-edit-prompt-step/add-edit-prompt-step.component";
import { UsersComponent } from "./users/users.component";
import { AddusersModalComponent } from "./users/addusers-modal/addusers-modal.component";
import { UssdPromptsComponent } from "./ussd-prompts/ussd-prompts.component";
import { UssdPagesComponent } from "./ussd-pages/ussd-pages.component";
import { UssdAdapterComponent } from "./ussd-adapter/ussd-adapter.component";
import { UssdTestingComponent } from "./ussd-testing/ussd-testing.component";
import { AddEditHostedUrlComponent } from "./ussd-testing/components/add-edit-hosted-url/add-edit-hosted-url.component";
import { AddEditAdapterRuleComponent } from "./ussd-adapter/components/add-edit-adapter-rule/add-edit-adapter-rule.component";
import { AddEditLookupStatusComponent } from "./ussd-adapter/components/add-edit-lookup-status/add-edit-lookup-status.component";
import { AddEditMapperObjComponent } from "./ussd-adapter/components/add-edit-mapper-obj/add-edit-mapper-obj.component";
// import { ListRedisDbMngtComponent } from './redis-db-mngt/list-redis-db-mngt/list-redis-db-mngt.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
// import { AddEditRedisDbMngtComponent } from './redis-db-mngt/add-edit-redis-db-mngt/add-edit-redis-db-mngt.component';

@NgModule({
  declarations: [
    LanguageComponent,
    UssdSimulatorComponent,
    UssdPopupComponent,
    EditPageComponent,
    AddAlertComponent,
    AddOptionComponent,
    UssdSetupComponent,
    EditOptionComponent,
    TestPromptComponent,
    UssdMetadataComponent,
    UssdEnvironmentsComponent,
    UssdEndpointsComponent,
    AddEditEndpointComponent,
    AddEditPromptStepComponent,
    UsersComponent,
    AddusersModalComponent,
    UssdPromptsComponent,
    UssdPagesComponent,
    UssdAdapterComponent,
    UssdTestingComponent,
    AddEditHostedUrlComponent,
    // ListRedisDbMngtComponent,
    // AddEditRedisDbMngtComponent,
    AddEditAdapterRuleComponent,
    AddEditLookupStatusComponent,
    AddEditMapperObjComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    UssdPagesRoutingModule,
    NzTreeModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatRadioModule,
    MatOptionModule,
    MatSelectModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  entryComponents: [
    EditPageComponent,
    AddOptionComponent,
    EditOptionComponent,
    UssdPopupComponent,
    AddEditEndpointComponent,
    AddEditPromptStepComponent,
    AddusersModalComponent,
    AddEditHostedUrlComponent,
    // AddEditRedisDbMngtComponent,
    AddEditAdapterRuleComponent,
    AddEditLookupStatusComponent,
    AddEditMapperObjComponent,
  ],
})
export class UssdPagesModule {}
