import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { HandleUssdJsonService } from "../../shared/services/handle-ussd-json.service";
import { HttpService } from "../../shared/services/http-service.service";
import { UssdSimulatorService } from "./services/ussd-simulator-service.service";

@Component({
  selector: "app-ussd-simulator",
  templateUrl: "./ussd-simulator.component.html",
  styleUrls: ["./ussd-simulator.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UssdSimulatorComponent implements OnInit {
  typedNumbers: string = "";
  popupState: boolean;

  index = 0;
  disable = false;

  constructor(
    private ussdSimulatorService: UssdSimulatorService,
  ) {}

  ngOnInit(): void {
    this.ussdSimulatorService.currentussdPopupStateData$.subscribe((data) => {
      this.popupState = data;
    });

    this.onPressCall();
  }

  onIndexChange(index: number): void {
    this.index = index;
  }

  pushedNumber(pressedNumber: string) {
    this.typedNumbers = this.typedNumbers + pressedNumber;
  }

  onDelete() {
    if (this.typedNumbers.length > 0) {
      this.typedNumbers = this.typedNumbers.slice(
        0,
        this.typedNumbers.length - 1
      );

      return;
    }
    alert("Please provide an input");
  }

  onPressCall() {
    this.ussdSimulatorService.updateUssdPopupState(true);
  }
}
