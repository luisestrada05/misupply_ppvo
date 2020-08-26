import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { parametroConst } from 'src/app/const.parametro';

const service = parametroConst.api.service;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }

  newUser(plant: any, supplier: any, name: any, lastName: any, email: any) {
    return this.http.get<any>(
      `${service}/iaccount?pDomain=${plant}&pVendor=${supplier}&pName=${name}&pLastN=${lastName}&pEmail=${email}`
    );
  }

  forgottenPass(plant: any, user: any, email: any) {
    return this.http.get<any>(
      `${service}/password?pDomain=${plant}&pUser=${user}&pCorreo=${email}`
    );
  }
}
