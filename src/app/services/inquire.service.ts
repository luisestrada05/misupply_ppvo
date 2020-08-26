import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment.prod';
import { parametroConst } from 'src/app/const.parametro';

const service = parametroConst.api.service;

@Injectable({
  providedIn: 'root'
})
export class InquireService {
  listShippingDetail = [];
  listRecivingDetail = [];
  listASNDetail = [];
  listInventoryDetail = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  setListInventoryDetail(e: any) {
    this.listInventoryDetail = [];
    this.listInventoryDetail = e;
  }

  getListInventoryDetail(): any {
    return this.listInventoryDetail;
  }

  setListASNDetail(e: any) {
    this.listASNDetail = [];
    this.listASNDetail = e;
  }

  getListASNDetail(): any {
    return this.listASNDetail;
  }

  setListRecivingDetail(e: any) {
    this.listRecivingDetail = [];
    this.listRecivingDetail = e;
  }

  getListRecivingDetail(): any {
    return this.listRecivingDetail;
  }

  setListShippingDetail(e: any) {
    this.listShippingDetail = [];
    this.listShippingDetail = e;
  }

  getListShippingDetail(): any {
    return this.listShippingDetail;
  }

  getAsnDetail(fechIni: any, fechFin: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/inqasndet?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pFechaIni=${fechIni}&pFechaFin=${fechFin}`
    );
  }

  getAsn(fechIni: any, fechFin: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/inqasn?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pFechaIni=${fechIni}&pFechaFin=${fechFin}`
    );
  }

  getCatalogoInqPartes() {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/inqpartes?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}`
    );
  }

  getTransactionNoParte(fechaIni: any, fechaFin: any, noParte: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      // tslint:disable-next-line:max-line-length
      `${service}/inqtrans?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pFechaIni=${fechaIni}&pFechaFin=${fechaFin}&pPart=${noParte}`
    );
  }

  getFolios(fechaIni: any, fecFin: any, status: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      // tslint:disable-next-line:max-line-length
      `${service}/receivingfolios2?pDomain=${user.login_domain}&pShipto=${user.login_vendor_code}&pFecini=${fechaIni}&pFecfin=${fecFin}&pStatus=${status}`
    );
  }

  getFoliosDetalle(fechaIni: any, fecFin: any, status: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      // tslint:disable-next-line:max-line-length
      `${service}/receivingdetalle2?pDomain=${user.login_domain}&pShipto=${user.login_vendor_code}&pFecini=${fechaIni}&pFecfin=${fecFin}&pStatus=${status}`
    );
  }

  getFile(shipfrom: any, shipto: any, shipper: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/files?pDomain=${user.login_domain}&pShipfrom=${shipfrom}&pShipto=${shipto}&pShipper=${shipper}`
    );
  }

  getShipping(fechaIni: any, fecFin: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/inq-shipping?pDomain=${user.login_domain}&pShipfrom=${user.login_vendor_code}&pFecini=${fechaIni}&pFecfin=${fecFin}`
    );
  }

  getShippingDetail(fechaIni: any, fecFin: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/inq-shippingdet?pDomain=${user.login_domain}&pShipfrom=${user.login_vendor_code}&pFecini=${fechaIni}&pFecfin=${fecFin}`
    );
  }

  getInventory() {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/inqinvmstr?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}`
    );
  }

  getDetailInventory() {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/inqinvdet?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}`
    );
  }

}
