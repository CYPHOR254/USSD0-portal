import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { HttpService } from "../../shared/services/http-service.service";
import { FormGroup } from "@angular/forms";
import { NzButtonSize, NzModalService } from "ng-zorro-antd";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { AddusersModalComponent } from "./addusers-modal/addusers-modal.component";
// import { privateDecrypt } from "crypto";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
  dataSource: MatTableDataSource<Record<string, string>[]> =
    new MatTableDataSource<Record<string, string>[]>([]);

  listOfData: any[] = [];
  listUsers$: Observable<any>;

  displayedColumns: string[] = [
    "id",
    "email",
    "idNumber",
    "phoneNumber",
    "userType",
    "status",
    "isBlocked",
    "action",
  ];
  size: NzButtonSize = "default";

  constructor(
    private _httpService: HttpService,
    public dialog: MatDialog,
    private popConfirmModal: NzModalService,
    private ref: ChangeDetectorRef,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.listUsers$ = this._httpService.findAll("/auth/find-all").pipe(
      map((resp: any) => {
        if (resp) {
          this.listOfData = resp.listUsers.map((item: any, index: any) => {
            let response: any = {
              id: item.id,
              listId: index + 1,
              email: item.email,
              idNumber: item.idNumber,
              phoneNumber: item.phoneNumber,
              userType: item.userType,
              isActive: item.status ? 'Active' : 'Inactive',
              isEnabled: item.isBlocked ? 'Disabled' : 'Enabled'
            };
            return response;
          });
          this.dataSource = new MatTableDataSource(this.listOfData);
          return this.listOfData;
        }
      })
    );
  }

  addUser() {
    let dialogRef = this.dialog.open(AddusersModalComponent, {});

    dialogRef.afterClosed().subscribe(() => {
      this.loadData();
      this.ref.detectChanges();
    });
  }

  editUser(element) {
    let dialogRef = this.dialog.open(AddusersModalComponent, {
      data: {
        userData: element,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.listUsers$ = null;
      this.loadData();
      this.ref.detectChanges();
    });
  }

  removeUser(element: any) {
    const model = {
      id: element["id"],
    };

    this.popConfirmModal.confirm({
      nzTitle: `Do you want to delete this item</b>?`,
      nzContent: `<b style="color:red;">It will be permanently DELETED</b>`,
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOnOk: () => {
        this._httpService.post("/auth/delete-user", model).subscribe((resp) => {
          if (resp.respCode === "00") {
            this.toastrService.success(
              "User deleted successfully",
              "Deletion status"
            );
            this.ngOnInit();
          }
          this.ref.detectChanges();
        });
      },
      nzCancelText: "No",
      nzOnCancel: () => {
        this.toastrService.info("User not deleted", "Deletion Status");
      },
    });
  }
}
