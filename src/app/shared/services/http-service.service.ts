import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpParams,
} from "@angular/common/http";
import { GlobalService } from "./global-service.service";
import { Observable, of } from "rxjs";
import { catchError, first, map, tap } from "rxjs/operators";
import { Subject } from "rxjs";
import { ToastrService } from "ngx-toastr";
@Injectable({
  providedIn: "root",
})
export class HttpService {
  projectDetails = new Subject();

  constructor(    
    private http: HttpClient, 
    private _globalService: GlobalService,
    private toastrService: ToastrService
  ) {}

  get getProfile() {
    // let profile = JSON.parse(sessionStorage.getItem('userType')!);
    let profile = sessionStorage.getItem("userType")!;
    return profile;
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this._globalService.getToken()}`,
    });
  }

  private getHeadersWithoutBearer(): HttpHeaders {
    return new HttpHeaders({
      "Content-Type": "application/json",
    });
  }

  public connectRedis(endpoint: string, data: Object): Observable<Object> {
    return this.http
      .post(this._globalService.authApiHost + endpoint, data, {                     
        headers: this.getHeadersWithoutBearer(),
      })
      .pipe(
        map((resp: Object) => {
          if (resp) {
            return resp;
          }
          throw new Error("Could not connect to Redis");
        })
      );
  }

  public fetchUSSDConfigurations(
    endpoint: string,
    appName: string
  ): Observable<Object> {
    return this.http.post(
      this._globalService.authApiHost + endpoint,
      { appName },
      {
        headers: this.getHeadersWithoutBearer(),
      }
    );
  }

  public fetchUSSDname(endpoint: string, ussdName: string): Observable<Object> {
    return this.http.post(
      this._globalService.authApiHost + endpoint,
      ussdName,
      {
        headers: this.getHeadersWithoutBearer(),
      }
    );
  }

  public fetchConnList(endpoint: string, email: string): Observable<Object> {
    return this.http.post(
      this._globalService.authApiHost + endpoint,
      { email },
      {
        headers: this.getHeadersWithoutBearer(),
      }
    );
  }

  public createConn(endpoint: string, model: any): Observable<Object> {
    return this.http.post(this._globalService.authApiHost + endpoint, model, {
      headers: this.getHeadersWithoutBearer(),
    });
  }

  public editUser(endpoint: string, model: any): Observable<Object> {
    return this.http.put(this._globalService.authApiHost + endpoint, model, {
      headers: this.getHeadersWithoutBearer(),
    });
  }

  public editRedisdbMngt(endpoint: string, model: any){
    return this.http.patch(this._globalService.authApiHost + endpoint, model, {
      headers: this.getHeadersWithoutBearer(),
    });
  }

  // public creatUser(endpoint: string, model: any): Observable<Object> {
  //   return this.http.post(this._globalService.authApiHost + endpoint, model, {
  //     headers: this.getHeaders(),
  //   });
  // }

  public createUser(
    endpoint: string,
    model: any,
    token: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // add token to Authorization header
    });
    const options = { headers };
    return this.http.post(
      this._globalService.authApiHost + endpoint,
      model,
      options
    );
  }

  public findAll(endpoint: string): Observable<Object> {
    return this.http.get(this._globalService.authApiHost + endpoint, {
      headers: this.getHeadersWithoutBearer(),
    });
  }

  public login(
    endpoint: string,
    model: Record<string, string>
  ): Observable<Object> {
    return this.http.post(this._globalService.authApiHost + endpoint, model, {
      headers: this.getHeadersWithoutBearer(),
    });
  }

  public changePass(
    endpoint: string,
    model: Record<string, string>
  ): Observable<Object> {
    return this.http.post(
      this._globalService.authApiHost + endpoint,
      model,
      {}
    );
  }

  public register(
    endpoint: string,
    model: Record<string, string>
  ): Observable<Object> {
    return this.http.post(this._globalService.authApiHost + endpoint, model, {
      headers: this.getHeadersWithoutBearer(),
    });
  }

  public forgotPass(
    endpoint: string,
    model: Record<string, string>
  ): Observable<Object> {
    return this.http.post(this._globalService.authApiHost + endpoint, model, {
      headers: this.getHeadersWithoutBearer(),
    });
  }

  public signOut(endpoint: string): Observable<Object> {
    return this.http.get(this._globalService.authApiHost + endpoint, {});
  }

  public publishToRedis(
    endpoint: string,
    model: Record<string, string | object>
  ): Observable<Object> {
    return this.http.post(this._globalService.authApiHost + endpoint, model, {
      headers: this.getHeadersWithoutBearer(),
    });
  }

  public postmanReq(data: any): Observable<string> {
    let url = `${data.protocol}://${data.engineIp}:${data.port}/${data.selectedUssd}/?${data.params}`;
    console.log(url);

    return this.http.get(`${url}`, { responseType: "text" }).pipe(
      map((resp) => {
        console.log(resp, '\n is resp');
        
        let str = resp.replace("CON ", "");
        str = str.replace("END ", "");
        return str;
      }),
      catchError((error) => {
        if (error.error instanceof ErrorEvent) {
          let errorMsg = `Error: ${error.error.message}`;
          console.log(error);
          this.toastrService.error(errorMsg, "Postman Error 1");
        } else {
          let errorMsg = `Error: ${error.message}`;
          console.log(error);
          this.toastrService.error(errorMsg, "Postman Error 2");
        }
        return of("");
      })
    );
  }

  public createHostedUrl(
    endpoint: string,
    model: Record<string, string | number>
  ): Observable<Object> {
    return this.http
      .post(this._globalService.authApiHost + endpoint, model, {
        headers: this.getHeadersWithoutBearer(),
      })
      .pipe(
        map((resp: any) => {
          if (resp) {
            return resp;
          }
        }),
        catchError((error) => {
          if (error.error instanceof ErrorEvent) {
            let errorMsg = `Error: ${error.error.message}`;
            console.log(error);
            this.toastrService.error(errorMsg, "Could not create URLs 1");
          } else {
            let errorMsg = `Error: ${error.message}`;
            console.log(error);
            this.toastrService.error(errorMsg, "Could not create URLs 2");
          }
          return of([]);
        })
      );
  }

  public listHostedUrls(
    endpoint: string,
    model: Record<string, string | number>
  ): Observable<Record<string, string>[]> {
    return this.http
      .post(this._globalService.authApiHost + endpoint, model, {
        headers: this.getHeadersWithoutBearer(),
      })
      .pipe(
        map((resp: any) => {
          if (resp) {
            return resp;
          }
        }),
        catchError((error) => {
          if (error.error instanceof ErrorEvent) {
            let errorMsg = `Error: ${error.error.message}`;
            console.log(error);
            this.toastrService.error(errorMsg, "Could not fetch urls 1");
          } else {
            let errorMsg = `Error: ${error.message}`;
            console.log(error);
            this.toastrService.error(errorMsg, "Could not fetch urls 2");
          }
          return of([]);
        })
      );
  }

  public post(endpoint: string, model: any) {
    return this.http
      .post(this._globalService.authApiHost + endpoint, model, {
        headers: this.getHeadersWithoutBearer(),
      })
      .pipe(
        map((resp: any) => {
          if (resp) {
            return resp;
          }
        }),
        catchError((error) => {
          if (error.error instanceof ErrorEvent) {
            let errorMsg = `Error: ${error.error.message}`;
            console.log(error);
            this.toastrService.error(errorMsg, "Error on POST");
          } else {
            let errorMsg = `Error: ${error.message}`;
            console.log(error);
            this.toastrService.error(errorMsg, "Error on POST");
          }
          return of([]);
        })
      );
  }

  // public refreshToken(endpoint: string, model: Record<string, string>): Observable<Object> {
  //   return this.http.post(this._globalService.authApiHost + endpoint, model, {
  //     headers: this.getHeadersWithoutBearer(),
  //   })
  //   localStorage.()
  // }

  // public post(endpoint: string, model: any): any {
  //   return this.http
  //     .post(this._globalService.apiHost + endpoint, model, {
  //       headers: this.getHeaders(),
  //     })
  //     .pipe(
  //       map((response) => {
  //         // console.log(response)
  //         response = response;
  //         return response;
  //       })
  //     );
  // }

  // public postLanguage(endpoint: string, model: any): any {
  //   const params = new HttpParams().set("language", model.language);
  //   let body = {};
  //   return this.http
  //     .post(this._globalService.apiHost + endpoint, body, {
  //       headers: this.getHeaders(),
  //       params: params,
  //     })
  //     .pipe(
  //       map((response) => {
  //         response = response;
  //         return response;
  //       })
  //     );
  // }

  // public patch(endpoint: string, model: any, isMultiType?: false): any {
  //   return this.http
  //     .patch(this._globalService.apiHost + endpoint, model, {
  //       headers: this.getHeaders(),
  //     })
  //     .pipe(
  //       map((response) => {
  //         response = response;
  //         return response;
  //       })
  //     );
  // }

  // public put(endpoint: string, model: any): any {
  //   return this.http
  //     .put(this._globalService.apiHost + endpoint, model, {
  //       headers: this.getHeaders(),
  //     })
  //     .pipe(
  //       map((response) => {
  //         response = response;
  //         return response;
  //       })
  //     );
  // }

  public get(endpoint: string, headerParams?: any): any {
    let params = new HttpParams().set("page", headerParams.page);
    // params = params.append('page', '0');
    // params = params.append('size', '1000');
    return this.http
      .get(this._globalService.apiHost + endpoint, {
        headers: this.getHeaders(),
        params: params,
      })
      .pipe(
        map((response) => {
          response = response;
          return response;
        })
      );
  }

  public getConfigs(endpoint: string, page?: string): any {
    let params = new HttpParams().set("page", page.toString());
    return this.http
      .get(this._globalService.apiHost + endpoint, {
        params,
        headers: this.getHeadersWithoutBearer(),
      })
      .pipe(
        map((response) => {
          response = response;
          return response;
        })
      );
  }

  // public getApis(endpoint: string, name: string): any {
  //   let params = new HttpParams().set("name", name.toString());
  //   return this.http
  //     .get(this._globalService.apiHost + endpoint, {
  //       params,
  //       headers: this.getHeadersWithoutBearer(),
  //     })
  //     .pipe(
  //       map((response) => {
  //         response = response;
  //         return response;
  //       })
  //     );
  // }

  // public getDataSource(endpoint: string): any {
  //   return this.http
  //     .get(this._globalService.apiHost + endpoint, {
  //       headers: this.getHeadersWithoutBearer(),
  //     })
  //     .pipe(
  //       map((response) => {
  //         response = response;
  //         return response;
  //       })
  //     );
  // }

  // public createPrompt(endpoint: string, body: {}, cparams: any): any {
  //   let params = new HttpParams().set("name", cparams.name.toString());
  //   return this.http
  //     .post(this._globalService.apiHost + endpoint, body, {
  //       params,
  //       headers: this.getHeadersWithoutBearer(),
  //     })
  //     .pipe(
  //       map((response) => {
  //         response = response;
  //         return response;
  //       })
  //     );
  // }

  // public delete(endpoint: string): any {
  //   return this.http
  //     .delete(this._globalService.apiHost + endpoint, {
  //       headers: this.getHeaders(),
  //     })
  //     .pipe(
  //       map((response) => {
  //         response = response;
  //         return response;
  //       })
  //     );
  // }

  // getFromJson(endpoint: string): any {
  //   return this.http.get(endpoint);
  // }

  // private handleError(error: Response | any) {
  //   let errorMessage: any = {};
  //   if (error.status === 0) {
  //     errorMessage = {
  //       success: false,
  //       status: 0,
  //       data: "Sorry, there was a connection error occurred. Please try again.",
  //     };
  //   } else {
  //     errorMessage = error.json();
  //   }
  //   return Observable.throw(errorMessage);
  // }

  // public buildFormData(formData: any, data: any, parentKey: any): any {
  //   if (
  //     data &&
  //     typeof data === "object" &&
  //     !(data instanceof Date) &&
  //     !(data instanceof File)
  //   ) {
  //     Object.keys(data).forEach((key) => {
  //       this.buildFormData(
  //         formData,
  //         data[key],
  //         parentKey ? `${parentKey}[${key}]` : key
  //       );
  //     });
  //   } else {
  //     const value = data == null ? "" : data;
  //     formData.append(parentKey, value);
  //   }
  // }

  // public jsonToFormData(data: any): any {
  //   const formData = new FormData();
  //   this.buildFormData(formData, data, null);
  //   return formData;
  // }
}
