import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NavigationExtras } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class UssdSimulatorService {
  private ussdPopupStateData = new BehaviorSubject(null);
  currentussdPopupStateData$ = this.ussdPopupStateData.asObservable();

  public ussdDisplayPageData = new BehaviorSubject(null);
  public currentDisplayPageData$ = this.ussdDisplayPageData.asObservable();

  public ussdDisplayPromptData = new BehaviorSubject(null);
  public currentDisplayPromptData$ = this.ussdDisplayPromptData.asObservable();

  public ussdTestPromptData = new BehaviorSubject(null);
  public currentTestPromptData$ = this.ussdTestPromptData.asObservable();

  public ussdBodyPostmanData = new BehaviorSubject(null);
  public currentussdBodyPostmanData$ = this.ussdBodyPostmanData.asObservable();

  constructor(private http: HttpClient) {}

  updateUssdPopupState(status: NavigationExtras | boolean) {
    this.ussdPopupStateData.next(status);
  }

  updateUssdDisplayPageState(data: unknown) {
    this.ussdDisplayPageData.next(data);
  }

  updateUssdDisplayPromptState(data: unknown) {
    this.ussdDisplayPromptData.next(data);
  }

  updateUssdTestPromptState(data: unknown) {
    this.ussdTestPromptData.next(data);
  }

  updateUssdBodyPostmanData(data: unknown) {
    this.ussdBodyPostmanData.next(data);
  }

  displayNext(currentOption: string) {

    return currentOption;
  }

  makeApiCall(
    endpointObj: Record<string, string>,
    apiKey: string,
    data: unknown
  ): Observable<any> {
 

    let apiEnv = data["config"]["api-environment"];


    let apiEnvObj = data["api"][apiKey]["data-sources"][apiEnv];


    let baseString = `${apiEnvObj["protocol"]}://${apiEnvObj["host"]}`;
    baseString =
      apiEnvObj["port"] > 0 ? `${baseString}:${apiEnvObj["port"]}` : baseString;
  

    baseString = !!endpointObj["path-suffix"]
      ? `${baseString}/${endpointObj["path-suffix"]}`
      : baseString;
  

    if (apiEnvObj["method"].toLowerCase() === "post") {
      return this.http
        .post(`${baseString}`, endpointObj["request"], {
          headers: null,
        })
        .pipe(
          map((resp) => {
            if (resp) {
        

              return resp;
            } 
            return resp
          })
        );
    } else if (apiEnvObj["method"].toLowerCase() === "get") {
      console.log('get request');
      
      // return this.http
      //   .get(baseString, {
      //     headers: null,
      //   })
      //   .pipe(map(resp => {
      //     console.log(resp);
          
      //   }));
    } else {
      console.log('Invalid');
      
    }
  }
}
