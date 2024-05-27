import { UssdSimulatorComponent } from "./ussd-simulator/ussd-simulator.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LanguageComponent } from "./language/language.component";
import { UssdSetupComponent } from "./ussd-setup/ussd-setup.component";
import { UssdMetadataComponent } from "./ussd-metadata/ussd-metadata.component";
import { UssdEnvironmentsComponent } from "./ussd-environments/ussd-environments.component";
import { UssdEndpointsComponent } from "./ussd-endpoints/ussd-endpoints.component";
import { UsersComponent } from "./users/users.component";
import { UssdPromptsComponent } from "./ussd-prompts/ussd-prompts.component";
import { UssdPagesComponent } from "./ussd-pages/ussd-pages.component";
import { UssdAdapterComponent } from "./ussd-adapter/ussd-adapter.component";
import { UssdTestingComponent } from "./ussd-testing/ussd-testing.component";
import { ListRedisDbMngtComponent } from "./redis-db-mngt/list-redis-db-mngt/list-redis-db-mngt.component";

const routes: Routes = [
  {
    path: "language-management",
    component: LanguageComponent,
    data: {
      title: "USSD Language Management",
      breadcrumb: "Language",
    },
  },
  {
    path: "ussd-simulator",
    component: UssdSimulatorComponent,
    data: {
      title: "USSD Simulator",
      breadcrumb: "Simulator",
    },
  },
  {
    path: "ussd-setup",
    component: UssdSetupComponent,
    data: {
      title: "USSD Setup",
      breadcrumb: "Setup",
    },
  },
  {
    path: "ussd-metadata",
    component: UssdMetadataComponent,
    data: {
      title: "USSD MetaData",
      breadcrumb: "MetaData",
    },
  },
  {
    path: "ussd-environments",
    component: UssdEnvironmentsComponent,
    data: {
      title: "USSD Environments",
      breadcrumb: "Environments",
    },
  },
  {
    path: "ussd-endpoints",
    component: UssdEndpointsComponent,
    data: {
      title: "USSD Endpoints",
      breadcrumb: "Endpoints",
    },
  },
  {
    path: 'list-users',
    component: UsersComponent,
    data: {
      title: 'list-users'
    }
  },
  {
    path: 'redis-db-mngt',
    component: ListRedisDbMngtComponent,
    data: {
      title: 'redis-db-mngt'
    }
  },
  {
    path: "ussd-prompts",
    component: UssdPromptsComponent,
    data: {
      title: "USSD Prompts",
      breadcrumb: "Prompts",
    },
  },
  {
    path: "ussd-pages",
    component: UssdPagesComponent,
    data: {
      title: "USSD Pages",
      breadcrumb: "Pages",
    },
  },
  {
    path: "ussd-adapter",
    component: UssdAdapterComponent,
    data: {
      title: "USSD Adapter",
      breadcrumb: "Adapter",
    },
  },
  {
    path: "ussd-testing",
    component: UssdTestingComponent,
    data: {
      title: "USSD Testing",
      breadcrumb: "Testing",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UssdPagesRoutingModule {}
