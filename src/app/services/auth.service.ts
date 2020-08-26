import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { UserModel } from '../models/user.model';
import { map } from 'rxjs/operators';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { UtilService } from './util.service';
import { parametroConst } from 'src/app/const.parametro';
import { FormGroup } from '@angular/forms';

const service = parametroConst.api.service;

@Injectable({
  providedIn: 'root'
}) 
export class AuthService {
  user: any;
  ruta: any;
  userModel = new UserModel();
  constructor(
    private http: HttpClient,
    private utilService: UtilService
  ) { }

  base64(texto: any) {
    return btoa(texto);
  }

  logIn(user: any) {
    const pass = this.base64(user.password);
    return this.http.get<any>(
      `${service}/validateaccess?domain=${user.domain}&user_id=${user.userId}&password=${pass}`
    ).pipe(map(resp => {
      this.userModel.login_domain = resp.response.dsLogin.callback[0].login_domain;
      this.userModel.login_userid = resp.response.dsLogin.callback[0].login_userid;
      this.userModel.login_vendor_code = resp.response.dsLogin.callback[0].login_vendor_code;
      this.userModel.login_vendor_name = resp.response.dsLogin.callback[0].login_vendor_name;
      this.userModel.vendors = resp.response.dsLogin.callback[0].vendors;
      return resp;
    }));
  }

  actualizaUser(domain: any, userId: any, vendorCode: any, vendorName: any, vendors: [], userMenu: []) {
    this.userModel.login_domain = domain;
    this.userModel.login_userid = userId;
    this.userModel.login_vendor_code = vendorCode;
    this.userModel.login_vendor_name = vendorName;
    this.userModel.vendors = vendors;
    this.userModel.userMenu = userMenu;
    localStorage.setItem('user', JSON.stringify(this.userModel));
  }

  userMenu(user: any) {
    const pass = this.base64(user.password);
    return this.http.get<any>(
      `${service}/sendusermenu?domain=${user.domain}&user_id=${user.userId}&password=${pass}`
    ).pipe(map(resp => {
      this.userModel.userMenu = resp.callback;
      this.actualizaRuta(resp.callback[0].items[0].text);
      localStorage.setItem('user', JSON.stringify(this.userModel));
      return resp;
    }));
  }

  actualizaRuta(e: any) {
    this.ruta = e;
    localStorage.setItem('ruta', JSON.stringify(this.ruta));
  }

  getRuta() {
    return JSON.parse(localStorage.getItem('ruta'));
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  logOut() {
    localStorage.removeItem('ruta');
    localStorage.removeItem('user');
  }

  loggedIn(): boolean {
    return localStorage.getItem('user') !==  null;
  }

  updatePasword(pass: any) {
    const user = this.getUser();
    return this.http.get<any>(
      `${service}/passwupd?pDomain=${user.login_domain}&pUser=${user.login_userid}&pPassword=${pass}`
    );
  }

  password(pass1: string, pass2: string) {
    return (formGroup: FormGroup) => {
      const pass1Name = formGroup.controls[pass1];
      const pass2Name = formGroup.controls[pass2];
      if (pass1Name.value === pass2Name.value) {
        pass2Name.setErrors(null);
      } else {
        pass2Name.setErrors({ noEsIgual: true });
      }
    };
  }
}
