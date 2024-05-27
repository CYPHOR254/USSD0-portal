import { Injectable } from "@angular/core";
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { GlobalService } from "./global-service.service";
import { HttpService } from "./http-service.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private _authService: AuthService,
    private _globalService: GlobalService,
    private httpService: HttpService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const url: string = state.url;
    return this.checkUserLogin(route, url);
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.canActivate(childRoute, state);
  }

  checkUserLogin(route: ActivatedRouteSnapshot, url: any): boolean {
    if (!!this._globalService.getToken()) {
      const userRole = this.httpService.getProfile;
      console.log(userRole, route.data.role);
      if (route.data.role && !route.data.role.includes(userRole)) {
        this.router.navigate(["/auth/login"]);
        return false;
      }
      return true;
    }
    this.router.navigate(["/auth/login"]);
    return false;
  }
}
