import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment.prod';
import { parametroConst } from 'src/app/const.parametro';

const service = parametroConst.api.service;
const serviceDev = parametroConst.api.service;

@Injectable({
  providedIn: 'root'
})
export class AsnService {

  constructor(
    private http: HttpClient,
    private authSerivce: AuthService
  ) { }

  getAsn(fecIni: any, fecFin: any) {
    const user = this.authSerivce.getUser();
    return this.http.get<any>(
      `${service}/asngeneral?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pFechaIni=${fecIni}&pFechaFin=${fecFin}`
    );
  }

  getDetailASN(shipto: any, shipper: any) {
    const user = this.authSerivce.getUser();
    return this.http.get<any>(
      `${service}/asndetalle?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pShipto=${shipto}&pShipper=${shipper}`
    );
  }

  delASN(body: any, reason: any) {

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        ShipperId: body.ShipperId,
        ShipTo: body.ShipTo,
        Date: body.Date,
        Time: body.Time,
        Status: body.Status,
        Vendor: body.Vendor,
        Domain: body.Domain,
        Send: body.Send,
        Comment: reason,
        Error: body.Error,
        mssg: '',
        success: true
      },
    };
    return this.http.delete<any>(
      // `${service}/asndelete`, options
      `${service}/asndelete`, options
    );
  }

  updateASN(body: any, sendStatus: boolean) {
    const user = this.authSerivce.getUser();
    body.Send = sendStatus;
    body.User = user.login_userid;
    body.mssg = '';
    body.success = true;
    return this.http.put<any>(
      `${service}/asnupdate`, body
    );
  }

  updateASN2(body: any, sendStatus: boolean) {
    const user = this.authSerivce.getUser();
    body.Send = sendStatus;
    body.User = user.login_userid;
    body.mssg = '';
    body.success = true;
    return this.http.put<any>(
      `${service}/msasnupdate`, body
    );
  }



  // nuevos servicios

  getmsAsn(fecIni: any, fecFin: any, pStatus: any) {
    const user = this.authSerivce.getUser();
    return this.http.get<any>(
      // tslint:disable-next-line:max-line-length
      `${serviceDev}/msasngeneral?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pFechaIni=${fecIni}&pFechaFin=${fecFin}&pStatus=${pStatus}`
    );
  }


  getmsDetailASN(pId: any, pType: any, Shipto?: any) {
    const user = this.authSerivce.getUser();
    return this.http.get<any>(
      // tslint:disable-next-line:max-line-length
      `${serviceDev}/msasndetalle?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pId=${pId}&pType=${pType}&pShipto=${Shipto}`
    );
  }

  updateASN3(domain: any, vendor: any, shipTo: any, id: any, type: any) {
    const user = this.authSerivce.getUser();
    const body = {
      pDomain: domain
      // pVendor: vendor,
      // pShipto: shipTo,
      // pId: id,
      // pType: type,
      // pUser: user.login_vendor_code
    };
    return this.http.get<any>(
      `${serviceDev}/msasnupdate?pDomain=${domain}&pVendor=${vendor}&pId=${id}&pType=${type}&pShipto=${shipTo}&pUser=${user.login_userid}`,
    );
  }

  delASN2(domain: any, vendor: any, shipTo: any, id: any, type: any) {
    const user = this.authSerivce.getUser();
    // const options = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //   }),
    //   body: {
    //     ShipperId: body.ShipperId,
    //     ShipTo: body.ShipTo,
    //     Date: body.Date,
    //     Time: body.Time,
    //     Status: body.Status,
    //     Vendor: body.Vendor,
    //     Domain: body.Domain,
    //     Send: body.Send,
    //     Comment: reason,
    //     Error: body.Error,
    //     mssg: '',
    //     success: true
    //   },
    // };
    return this.http.get<any>(
      `${serviceDev}/msasndelete?pDomain=${domain}&pVendor=${vendor}&pId=${id}&pType=${type}&pShipto=${shipTo}&pUser=${user.login_userid}`,
    );
  }

}


