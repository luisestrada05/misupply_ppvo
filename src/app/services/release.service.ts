import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { parametroConst } from 'src/app/const.parametro';

const service = parametroConst.api.service;

@Injectable({
  providedIn: 'root'
})
export class ReleaseService {

  constructor(
    private http: HttpClient
  ) { }

  getRelease(formDate: any, toDate: any) {
    const user  = JSON.parse(localStorage.getItem('user'));
    return this.http.get<any>(
      `${service}/sendreleases?domain=${user.login_domain}&vendor=${user.login_vendor_code}&from_date=${formDate}&to_date=${toDate}`
    );
  }

  getDetailRelease(nbr: any, releaseId: any) {
    const user  = JSON.parse(localStorage.getItem('user'));
    return this.http.get<any>(
      `${service}/RelDetail?domain=${user.login_domain}&vendor=${user.login_vendor_code}&nbr=${nbr}&rlse_id=${releaseId}`
    );
  }

  getTrackingRelease() {
    const user  = JSON.parse(localStorage.getItem('user'));
    return this.http.get<any>(
      `${service}/xxtrackrel?pdomain=${user.login_domain}&pvendor=${user.login_vendor_code}`
    );
  }
}
