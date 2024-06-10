import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HandleUssdJsonService } from '../../shared/services/handle-ussd-json.service';

@Component({
  selector: 'app-ussd-setup',
  templateUrl: './ussd-setup.component.html',
  styleUrls: ['./ussd-setup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UssdSetupComponent implements OnInit {
  configJsonData: any;
  languagesArray: string[] = [];
  responseFormatsArray: string[] = ['safaricom', 'airtel', 'telkom'];
  configsFromRedis$: Observable<Record<string, string> | string>;
  allData$: Observable<Record<string, string>>;
  allData: Record<string, string>;
  allPages: string[];
  allPrompts: string[];
  selectedFirstTypeList: string[] = [];
  firstPageType: string;
  errorMsg: string;

  ussdBasicDataForm: FormGroup;

  constructor(
    private router: Router,
    private handleJsonService: HandleUssdJsonService,
    private toastrService: ToastrService,
    private fb: FormBuilder
  ) {
    this.ussdBasicDataForm = this.fb.group({
      ussdName: [{ value: '', disabled: true }, [Validators.required]],
      language: ['', [Validators.required]],
      loadProfile: [false],
      authenticate: [false],
      internalAuthentication: [false],
      authenticateUsePage: [false] ,
      authenticateTransactions: [false],
      pinTrialMax: [3, [Validators.required, Validators.min(1)]],
      ussdResponseFormat: ['', [Validators.required]],
      firstPageType: ['', [Validators.required]],
      firstPage: ['', [Validators.required]],
      firstPromptStep: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.allData$ = this.handleJsonService.allJsonData$.pipe(
      map((resp: Record<string, string>): Record<string, string> => {
        if (resp) {
          this.allData = { ...resp };
          let langArr = new Set<string>();

          for (let key in resp) {
            if (key === 'config') {
              this.configJsonData = resp[key];
              this.configsFromRedis$ = of(this.configJsonData['meta-data']);

              let appName = sessionStorage.getItem('appName');
              let choosenLanguage = this.configJsonData['language'];
              let loadProfile = this.configJsonData['do-not-load-profile'];
              let authenticate = this.configJsonData['authenticate'];
              let internalAuthentication = this.configJsonData['internal-authentication'];
              let authenticateUsePage = this.configJsonData['authenticate-use-page'];
              let authenticateTransactions = this.configJsonData['authenticate-transactions'];
              let pinTrialMax = this.configJsonData['pin-trial-max'];
              let ussdResponseFormat = this.configJsonData['ussd-response-format'];
              let firstPage = this.configJsonData['page-switch-check']['options']['client']['page'];
              this.firstPageType = firstPage.indexOf('page') !== -1 ? 'Page' : 'Prompt';

              this.ussdBasicDataForm.setValue({
                ussdName: appName,
                language: choosenLanguage,
                loadProfile: !loadProfile,
                authenticate: authenticate,
                internalAuthentication: internalAuthentication,
                authenticateUsePage: authenticateUsePage,
                authenticateTransactions: authenticateTransactions,
                pinTrialMax: this.configJsonData['pin-trial-max'] || 3,
                ussdResponseFormat: ussdResponseFormat,
                firstPageType: this.firstPageType,
                firstPage: firstPage,
                firstPromptStep: firstPage,
              });

              let pageOne = this.configJsonData['page-switch-check']['options']['client']['page'];
              sessionStorage.setItem('pageOne', pageOne);
            }

            if (key === 'language') {
              let keys = Object.keys(this.allData[key]);
              keys.map(item => {
                let objLangs = Object.keys(this.allData[key][item]);
                objLangs.map(lang => langArr.add(lang));
              });
              this.languagesArray = Array.from(langArr);
            }

            if (key === 'pages') {
              this.allPages = Object.keys(this.allData['pages']);
            }

            if (key === 'prompts') {
              this.allPrompts = Object.keys(this.allData['prompts']);
            }
          }

          this.onChange(this.firstPageType);
          return resp;
        }
        this.toastrService.error('USSD chosen is invalid', 'USSD Parsing Error');
        this.router.navigate(['/overview']);
        throw new Error('No configuration files to read from!!');
      }),
      catchError((error) => {
        if (error.error instanceof ErrorEvent) {
          this.errorMsg = `Error: ${error.error.message}`;
          this.toastrService.error(this.errorMsg, 'Redis Error -Setup');
        } else {
          this.errorMsg = `Error: ${error.message}`;
          this.toastrService.error(this.errorMsg, 'Redis Error -Setup');
        }
        this.router.navigate(['/overview']);
        return of(error.message);
      })
    );
  }

  toggleAuth() {
    const auth = this.ussdBasicDataForm.get('authenticate');
    if (auth?.value) {
      this.ussdBasicDataForm.get('internalAuthentication')?.enable();
      this.ussdBasicDataForm.get('authenticateUsePage')?.enable();
      this.ussdBasicDataForm.get('authenticateTransactions')?.enable();
    } else {
      this.ussdBasicDataForm.get('internalAuthentication')?.disable();
      this.ussdBasicDataForm.get('authenticateUsePage')?.disable();
      this.ussdBasicDataForm.get('authenticateTransactions')?.disable();
    }
  }

  onChange(selectedValue: string) {
    if (selectedValue === 'Page') {
      this.selectedFirstTypeList = [...this.allPages];
    } else {
      this.selectedFirstTypeList = [...this.allPrompts];
    }
  }

  selectPromptStep(event: any) {
    if (this.ussdBasicDataForm.controls['firstPageType'].value === 'Prompt') {
      let pageName = event.value;
      let chosenPrompt = this.allData['prompts'][pageName]['steps'][0];
      this.ussdBasicDataForm.controls['firstPromptStep'].setValue(chosenPrompt);
    }
  }

  submit() {
    if (this.ussdBasicDataForm.valid) {
      console.log('All data submitted', this.ussdBasicDataForm.value);
      this.toastrService.success('Form submitted successfully');

      this.configJsonData['language'] = this.ussdBasicDataForm.controls['language'].value
        ? this.ussdBasicDataForm.controls['language'].value
        : this.configJsonData['language'];

      this.configJsonData['do-not-load-profile'] =
        !this.ussdBasicDataForm.controls['loadProfile'].value;
      this.configJsonData['authenticate'] =
        this.ussdBasicDataForm.controls['authenticate'].value;

      this.configJsonData['pin-trial-max'] = this.ussdBasicDataForm.controls['pinTrialMax'].value;

      if (this.ussdBasicDataForm.controls['firstPageType'].value === 'Prompt') {
        this.configJsonData['page-switch-check']['options']['client']['page'] =
          this.ussdBasicDataForm.controls['firstPromptStep'].value;
      } else {
        this.configJsonData['page-switch-check']['options']['client']['page'] =
          this.ussdBasicDataForm.controls['firstPage'].value;
      }

      sessionStorage.setItem(
        'pageOne',
        this.configJsonData['page-switch-check']['options']['client']['page']
      );

      this.allData['config'] = this.configJsonData;

      this.handleJsonService.updateAllJsonData(this.allData);

      if (this.configJsonData['do-not-load-profile']) {
        this.router.navigate(['/ussd/ussd-simulator']);
      } else {
        this.router.navigate(['/ussd/ussd-adapter']);
      }
    } else {
      this.toastrService.error('Please fill all required fields', 'Form Error');
    }
  }
}
