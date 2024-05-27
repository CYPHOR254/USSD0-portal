import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "search",
})
export class SearchPipe implements PipeTransform {
  transform(items: any[], searchText: any): any {
    if (!items) {
      return [];
    } else if (!searchText) {
      return items;
    } else {
      searchText = searchText.toLowerCase();
      return items.filter((item) => {
        return item.toLowerCase().includes(searchText);
      });
    }
  }
}
