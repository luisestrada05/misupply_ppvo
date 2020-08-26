import { Injectable, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment.prod';
import { parametroConst } from 'src/app/const.parametro';

const service = parametroConst.api.service;
const serviceDev = parametroConst.api.service;

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }


  getCatShip() {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${serviceDev}/receivingorigen?pVendor=${user.login_vendor_code}&pDomain=${user.login_domain}`
    );
  }

  getReceivingFolio(shipfrom: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/receivingfolios?pDomain=${user.login_domain}&pShipfrom=${shipfrom}&pShipto=${user.login_vendor_code}`
    );
  }

  getReceivinigDetalle(shipfrom: any, shipper: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/receivingdetalle?pDomain=${user.login_domain}&pShipfrom=${shipfrom}&pShipto=${user.login_vendor_code}&pShipper=${shipper}`
    );
  }



  getCatReportProduction() {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/prodpartes?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}`
    );
  }

  getDetailReportProduction(parte: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/prodpartesdet?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pPart=${parte}`
    );
  }

  getCatShipDestino(shipType: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/shippingdestino?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pShipType=${shipType}`
    );
  }

  getShippingInventory() {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/shippinginventory?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}`
    );
  }

  getInqLote(part: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/inqlote?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pPart=${part}`
    );
  }

  postShip(obj: any) {
    const user = this.authService.getUser();
    return this.http.post<any>(
      `${service}/shipupdate`, obj
    );
  }

  postShip2(obj: any) {
    const user = this.authService.getUser();
    return this.http.post<any>(
      `${service}/msshipupdate`, obj
    );
  }



  getStatusShip(shipto: string, shipper: string) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/shippingvalida?pDomain=${user.login_domain}&pShipfrom=${user.login_vendor_code}&pShipto=${shipto}&pShipper=${shipper}`
    );
  }



  getProdLotes(parent: any, noPart: any, qtyReq: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      // tslint:disable-next-line:max-line-length
      `${service}/prodlotes?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pParent=${parent}&pComp=${noPart}&pProdQty=${qtyReq}`
    );
  }
  // /produpdate
  postProdUpdate(obj) {
    return this.http.post<any>(
      `${service}/produpdate`, obj
    );
  }

  getReceivingValida(shipto: any, shipper) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/receivingvalida?pDomain=${user.login_domain}&pShipfrom=${shipto}&pShipto=${user.login_vendor_code}&pShipper=${shipper}`
    );
  }

  getOrders() {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/msprprovocs?domain=${user.login_domain}&vend=${user.login_vendor_code}`
    );
  }

  getNoPartesPorOrdenDeCompra(nbr: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/msproclineas?domain=${user.login_domain}&nbr=${nbr}`
    );
  }

  getRackOrder(nbr: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/msprprovracks?domain=${user.login_domain}&nbr=${nbr}`
    );
  }

  getShipper(shipTo: any, shipper: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${service}/msshipimpresion?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pShipto=${shipTo}&pShipper=${shipper}`
    );
  }


  // servicios nuevos

  getTransferImpresion(transferID: any) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${serviceDev}/mstransferimpresion?pDomain=${user.login_domain}&pVendor=${user.login_vendor_code}&pTransferId=${transferID}`
    );
  }

  obtieneNumerosParte(type: string) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${serviceDev}/msparts?domain=${user.login_domain}&vend=${user.login_vendor_code}&type=${type}`
    );
  }

  postShip3(obj: any) {
    const user = this.authService.getUser();
    return this.http.post<any>(
      `${serviceDev}/msshippingupd`, obj
    );
  }

  postTransfer(obj: any) {
    const user = this.authService.getUser();
    return this.http.post<any>(
      `${serviceDev}/transferupd`, obj
    );
  }

  getStatusTransfer(pReference: string) {
    const user = this.authService.getUser();
    return this.http.get<any>(
      `${serviceDev}/transfervalida?pDomain=${user.login_domain}&pShipfrom=${user.login_vendor_code}&pReference=${pReference}`
    );
  }

  postReceiving(obj: any) {
    return this.http.post<any>(
      `${serviceDev}/receivingupd`, obj
    );
  }

}
