import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import * as moment from "moment";

@Injectable({
  providedIn: "root",
})
export class GlobalService {
  public apiHost: string;
  public authApiHost: string;

  // public setting: any = {};
  public static emailRegex: string =
    "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}";

  public static nameRegex: string = "^[a-zA-Z-]{3,45}$";

  public static ipv4Regex: string =
    "^((?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])[.]){3}(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$";

  public static allvalidators: string[] = [
    "isListEmpty",
    "isCorrectPinInput",
    "hasMultiple",
    "isAmount",
    "isAlphaNumeric",
    "isAlphaNumericSpecial",
    "isEslip",
    "operatorManagement",
    "is4DigitPin",
    "isNotOldPin",
    "isAgencyPin",
    "isEqualToNewPin",
    "isExternalAuthentication",
    "isWithinNumericRange",
    "isStudentId",
    "isAbove18",
    "isMinimumAmt",
    "isCorrectDate",
    "isCorrectDefaultPin",
    "isCorrectDob",
    "isText",
    "isStatement",
    "isNumber",
    "isValidDate",
    "isValidDateRange",
    "matchesLength",
    "isEmail",
    "isCorrectPin",
    "isDate",
    "isWithinLoanLimit",
    "isValidPin",
    "isAny",
    "isStrongPin",
    "isEqualToLastEntry",
    "isNotEqualToLastEntry",
    "isKenyanPlotNumber",
    "isLockSavingsAccount",
    "istransRef_abc",
    "isAmount_karanja",
    "isBusinessName_abc",
    "isChurchCode",
    "isMobileNumber_abc",
    "isOTP_abc",
    "isPin_abc",
    "isConfirmPin_abc",
    "isTradingLicense_abc",
  ];

  constructor() {
    this.apiHost = environment.base_url;
    this.authApiHost = environment.auth_url;
  }

  public getToken():any {
    return sessionStorage.getItem('token');
  }

  //     loadGlobalSettingsFromLocalStorage(): void {
  //         if (localStorage.getItem('backend-setting') != null) {
  //             this.setting = JSON.parse(localStorage.getItem('backend-setting'));
  //         }

  //     }

  //     public handleServerErrors(result: any): any {
  //      //   let isValidationError = false;
  //      //   let errorMessage;
  //     /*    this.message.error('Encountered an error', { nzDuration: 2000 });
  //         switch (result.response_code) {
  //           case 400:
  //             errorMessage = 'Wrong method';
  //             break;
  //           case 401:
  //             errorMessage = 'Session Expired';
  //             this.message.error('Your session  has expired', { nzDuration: 4000 });
  //             break;
  //           case 403:
  //             errorMessage = 'UnAuthorized';
  //             break;
  //           case 422:
  //             isValidationError = true;
  //             errorMessage = Array.from(Object.keys(result.error_messages), k => result.error_messages[k]);
  //             break;
  //           case 404:
  //             errorMessage = 'Not Found';
  //             break;
  //           case 500:
  //             errorMessage = 'Internal Server Error';
  //             break;
  //         }
  //         return { errorMessage: errorMessage, isValidationError: isValidationError  };
  //         **/
  //       }

  //       public validateOnClientSide(validateForm: any): boolean {
  //         let hasClientValidationError = false;
  //         for (const i in validateForm.controls) {
  //           if (validateForm.controls) {
  //             validateForm.controls[i].markAsDirty();
  //             validateForm.controls[i].updateValueAndValidity();
  //             if (validateForm.controls[i].errors !=== null) {
  //               hasClientValidationError = true;
  //             }
  //           }
  //         }
  //         return hasClientValidationError;
  //       }

  //       // get Unique values in an array
  //   public uniqueBy(arr: any, fn: any): any {
  //     const unique = {};
  //     const distinct = [];
  //     arr.forEach(function (x: any): any {
  //       const key = fn(x);
  //       if (!unique[key]) {
  //         distinct.push(key);
  //         unique[key] = true;
  //       }
  //     });
  //     return distinct;
  //   }
  //   // public getUniqueListBy(arr, key) {
  //   //   return [...new Map(arr.map(item => [item[key], item])).values()]
  //   // }
  //   // Returns an array of dates between the two dates
  //   enumerateDaysBetweenDates(startDate: any, endDate: any): any {
  //     startDate = moment(startDate);
  //     endDate = moment(endDate);
  //     const now = startDate;
  //     const dates = [];
  //     while (now.isBefore(endDate) || now.isSame(endDate)) {
  //       dates.push(now.format('YYYY-MM-DD'));
  //       now.add(1, 'days');
  //     }
  //     return dates;
  //   }

  //   /**
  //    * Shuffles array in place. ES6 version
  //    */
  //   public shuffle(a: any): any {
  //     for (let i = a.length - 1; i > 0; i--) {
  //       const j = Math.floor(Math.random() * (i + 1));
  //       [a[i], a[j]] = [a[j], a[i]];
  //     }
  //     return a;
  //   }

  //   public getUserInfo(): any {
  //     const user = localStorage.getItem('user');
  //     return JSON.parse(user);
  //   }
  //   public getUserPermissions(): any {
  //     const permissions = localStorage.getItem('permissions');
  //     return JSON.parse(permissions);
  //   }

  //   public changeItemIndex(from, to, array): any {
  //     array.splice(to,0,array.splice(from,1)[0]);
  //     return array;
  //   }

  //   public IsJsonString(str) {
  //     try {
  //         JSON.parse(str);
  //     } catch (err) {
  //         return false;
  //     }
  //     return true;
  // }
}
