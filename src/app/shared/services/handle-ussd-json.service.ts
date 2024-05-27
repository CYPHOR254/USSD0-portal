import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class HandleUssdJsonService {
  private allJsonDataBehvSubj = new BehaviorSubject<Record<string, string>>({});
  public allJsonData$ = this.allJsonDataBehvSubj.asObservable();
  
  private pendingPublishBehvSubj = new BehaviorSubject<boolean>(false);
  public pendingPublish$ = this.pendingPublishBehvSubj.asObservable();

  formData: Record<string, string>;

  constructor() {}
  updatePendingPublish(data: boolean) {
    this.pendingPublishBehvSubj.next(data);
  }

  updateAllJsonData(data: Record<string, string>, publishFlag?: boolean) {
    if(publishFlag === false) {
      this.updatePendingPublish(false)
    } else {
      this.updatePendingPublish(true)
    }
    this.allJsonDataBehvSubj.next(data);
  }

  getKeyFromLang(allJSON: Record<string, string>, searchKey: string): string {
    let lang = allJSON["config"]["language"];

    let allKeys = Object.keys(allJSON["language"]);
    let str: string = "";

    allKeys.every((key) => {
      if (
        allJSON["language"][key][lang] === undefined ||
        allJSON["language"][key][lang] === null
      ) {
        let emptyLangObj = { ...allJSON["language"][key]["english"] };
        for (let obj in emptyLangObj) {
          emptyLangObj[obj] = emptyLangObj[obj].concat(
            ` <${lang[0]}${lang[1]}>`
          );
        }
        allJSON["language"][key] = Object.assign(allJSON["language"][key], {
          [lang]: { ...emptyLangObj },
        });
      }

      let result = allJSON["language"][key][lang][searchKey];

      if (result !== undefined && result !== "") {
        str = result;
        return false;
      } else {
        return true;
      }
    });

    return str;
  }

  getKeyValueInstancesFromLang(
    allJSON: Record<string, string>,
    searchKey: string,
    mainObjName?: string
  ): string[] {
    let lang = allJSON["config"]["language"];

    let allKeys = Object.keys(allJSON["language"]);
    let str: string[] = [];

    allKeys.forEach((key) => {
      let result = allJSON["language"][key][lang][searchKey];
      console.log(result, "is res: is key", key);

      if (result !== undefined) {
        str.push(key);
      } else {
        console.log("Not in ", key);
      }
    });

    if (str.length > 1 && mainObjName) {
      let itemsToDelete = [...str].filter(
        (item) => !mainObjName.includes(item)
      );
      str = str.filter((item) => mainObjName.includes(item));
      itemsToDelete.forEach((keyName) => {
        delete allJSON["language"][keyName][lang][searchKey];
      });
    }

    console.log(allJSON["language"]);
    this.updateAllJsonData(allJSON);

    return str;
  }

  getPromptNameFromCache(
    allJSON: Record<string, string>,
    searchKey: string
  ): string {
    let prCache = allJSON["prompts_cache"];

    let promptKeys = Object.keys(prCache);

    let mainPrompt = "";
    promptKeys.forEach((key) => {
      if (allJSON["prompts_cache"][key].includes(searchKey)) {
        mainPrompt = key;
        return mainPrompt;
      }
    });

    return mainPrompt;
  }
}
