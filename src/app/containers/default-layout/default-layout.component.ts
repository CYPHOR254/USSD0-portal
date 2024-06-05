import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { navItems } from "../../_nav";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { HttpService } from "../../shared/services/http-service.service";
import { HandleUssdJsonService } from "../../shared/services/handle-ussd-json.service";
import { Observable, of } from "rxjs";
import { catchError, map, take } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-dashboard",
  templateUrl: "./default-layout.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultLayoutComponent implements OnInit {
  public navItems = navItems;
  public sidebarMinimized = false;
  // public ussdVersion: string;
  // public versionsArray: string[] = [];
  allData$: Observable<Record<string, string>>;
  publishToRedis$: Observable<any>;
  pendPubl$: Observable<boolean> = of(false);

  isPendingPublish: boolean = false;

  public year: Date = new Date();

  constructor(
    private location: Location,
    private router: Router,
    private http: HttpService,
    private handleJsonData: HandleUssdJsonService,
    private httpService: HttpService,
    private toastrService: ToastrService
  ) {
    this.checkIsPublished();
  }

  ngOnInit(): void {}

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

  logout(): void {
    this.http.signOut("/auth/signout").subscribe(() => {
      this.router.navigate(["auth/login"]);
    });
  }

  goBack(): void {
    this.location.back();
  }

  checkIsPublished() {
    this.pendPubl$ = this.handleJsonData.pendingPublish$.pipe(
      map((resp) => {
        this.isPendingPublish = resp;
        return resp;
      })
    );
  }

  publish() {
    this.handleJsonData.allJsonData$.pipe(take(1)).subscribe((resp) => {
      if (resp) {
        this.publishToRedis$ = this.httpService
          .publishToRedis("/ussd/publish-ussd", {
            data: resp,
            appName: sessionStorage.getItem("appName"),
          })
          .pipe(
            map((resp) => {
              if (resp) {
                this.toastrService.success(
                  "Redis USSD configs updated",
                  "USSD Status"
                );
                this.handleJsonData.updatePendingPublish(false);
                return resp;
              }
            }),
            catchError((error) => {
              this.toastrService.error("Publish failed", "Error");
              console.error(error);
              return of(null);
            })
          );
  
        this.publishToRedis$.subscribe();
      }
    });
  }
  

  changeUssdLanguage() {
    // this.allJSON["config"]["language"] = lang;
    // this.handleJsonData.updateAllJsonData(this.allJSON);
    this.router.navigate(["/ussd/ussd-setup"]);
  }
}
