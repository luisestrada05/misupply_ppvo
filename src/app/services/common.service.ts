import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { parametroConst } from 'src/app/const.parametro';
import { map } from 'rxjs/operators';

const service = parametroConst.api.service;

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
    private http: HttpClient
  ) { }

  getDomain() {
    return this.http.get<any>(
      `${service}/senddomains`
    );
  }

  getSupplier(domain: string) {
    return this.http.get<any>(
      `${service}/supplier?pDomain=${domain}`
    );
  }
}
