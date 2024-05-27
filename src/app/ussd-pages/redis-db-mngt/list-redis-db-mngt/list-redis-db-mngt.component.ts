import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NzButtonSize, NzModalService } from 'ng-zorro-antd';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../../../shared/services/http-service.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AddEditRedisDbMngtComponent } from '../add-edit-redis-db-mngt/add-edit-redis-db-mngt.component';


@Component({
  selector: 'app-list-redis-db-mngt',
  templateUrl: './list-redis-db-mngt.component.html',
  styleUrls: ['./list-redis-db-mngt.component.scss']
})
export class ListRedisDbMngtComponent implements OnInit {
  dataSource: MatTableDataSource<Record<string, string>[]> =
  new MatTableDataSource<Record<string, string>[]>([]);

  listOfData: any[] = [];
  listRedisdbMngt$: Observable<any>;

  displayedColumns: string[] = [
    "id",
    "ip",
    "port",
    "db",
    "action"
  ]
  size: NzButtonSize = "default";

  constructor(
    private _httpService: HttpService,
    public dialog: MatDialog,
    private popConfirmModal: NzModalService,
    private ref: ChangeDetectorRef,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const model: any = {
      adminId: Number(sessionStorage.getItem("adminId"))
  };

    this.listRedisdbMngt$ = this._httpService.createConn("/ussd/list-redis-db-mngt", model).pipe(
      map((resp: any) => {
        console.log(resp)
        if (resp) {
          this.listOfData = resp.findAllRedisdbMngt.map((item: any, index: any) => {
            let response: any = {
              id: item.id,
              listId: index + 1,
              ip: item.redisIP,
              port: item.redisPort,
              db: item.redisdb,
              allowedUsers: JSON.parse(item.allowedUserId)
            };
            return response;
          });
          this.dataSource = new MatTableDataSource(this.listOfData);
          return this.listOfData;
        }
      })
    )
  }

  addRedisdb() {
    let dialogRef = this.dialog.open(AddEditRedisDbMngtComponent, {});

    dialogRef.afterClosed().subscribe(() => {
      this.loadData();
      this.ref.detectChanges();
    })
  }

  editRedisdb(element) {
    let dialogRef = this.dialog.open(AddEditRedisDbMngtComponent, {
      data: {
        userData: element,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.listRedisdbMngt$ = null;
      this.loadData();
      this.ref.detectChanges();
    });
  }

  removeRedisdb(element: any) {
    const model = {
      id: element['id'],
    }

    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete this item</b>?`,
      nzContent: `<b style="color:red;">It will be permanently DELETED</b>`,
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        this._httpService.post("/ussd/delete-redis-db-mngt", model).subscribe((resp) => {
          if(resp.respCode == "00") {
            this.toastrService.success(
              "Redis db management deleted successfully",
              "Deletion status"
            );
            this.ngOnInit();
          }
          this.ref.detectChanges();
        })
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.info("Redis db management not deleted", "Deletion Status");
      },
    })
  }

}
