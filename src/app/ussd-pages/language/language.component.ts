import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { HttpService } from '../../shared/services/http-service.service';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent implements OnInit, OnChanges {

  cardTitle: string = "Language Configurations";
  editConfigsL: boolean = false;
  form: FormGroup;
  languageConfigs: any = {}
  languageDefinations: {}[];
  languageList: string[];
  loading: boolean = false;

  constructor(
    private _httpService: HttpService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.retrieveAvailableLanguages();
    this.form = this.fb.group({
      languageConfigs: [{value: this.languageConfigs, disabled: this.editConfigsL}, Validators.compose([Validators.required])]
    });
    this.languageConfigs = JSON.stringify(this.languageConfigs, null, 4);
  }
  
  ngOnChanges(): void {
      
  }

  editConfigs(): void {
    this.editConfigsL = true;
  }

  retrieveAvailableLanguages(): void {
    let model = {
      page: ""
    };
    this._httpService.get("pages/languages", model).subscribe(res => {
      if (res["status"] === "success") {
        this.languageList = res["data"];
        this.retrieveLanguageObjects();
      }
    })

  }

  retrieveLanguageObjects(): void {
    this.loading = true;
    let page = this.route.snapshot.paramMap.get('params');
    let model = {
      page: page
    };
    this._httpService.get("page/language", model).subscribe(res => {
      if (res["status"] === "success") {
        this.languageConfigs = JSON.stringify(res["data"], null, 4);
        this.loading = false;
      } else {
        this.loading = false;
      }
    })

    // let getLanguage: string;
    // let container = {};


    
    // this.languageList.map(item => {
    //   getLanguage = item;
    //   model = {
    //     page: item
    //   };
    //   this._httpService.get("page/language", model).subscribe(res => {
    //     if (res["status"] === "success") {
    //       this.loading = false;
    //       // console.log(res["data"]["english"])
    //       container["english"] = Object.entries(res["data"]);
    //       return container;
    //     } else {
    //       this.loading = false;
    //       this.languageConfigs = JSON.stringify(this.languageConfigs, null, 4);
    //     }
    //   })
    // })
  }

}
