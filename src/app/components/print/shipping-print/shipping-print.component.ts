import { Component, OnInit, Input } from '@angular/core';
import { parametroConst } from 'src/app/const.parametro';
import { PrintModel } from 'src/app/models/print.model';
import { UtilService } from 'src/app/services/util.service';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from 'src/app/services/transaction.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

declare var $;

@Component({
  selector: 'app-shipping-print',
  templateUrl: './shipping-print.component.html'
})
export class ShippingPrintComponent implements OnInit {

  @Input() public print: any;
  constAssets = parametroConst;

  // print = new PrintModel();


  fecha = new Date();
  imprimiendo = false;
  newData = false;
  constructor(
    private utilService: UtilService, 
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
    private spinner: NgxSpinnerService,
    private alert: ToastrService
  ) {
  }

  ngOnInit() {
    if (!this.utilService.validateEmptyData(this.activatedRoute.snapshot.paramMap.get('domain')) &&
      !this.utilService.validateEmptyData(this.activatedRoute.snapshot.paramMap.get('vendor')) &&
      !this.utilService.validateEmptyData(this.activatedRoute.snapshot.paramMap.get('shipTo')) &&
      !this.utilService.validateEmptyData(this.activatedRoute.snapshot.paramMap.get('shipper'))) {
      this.spinner.show();


      this.transactionService.getShipper(this.activatedRoute.snapshot.paramMap.get('shipTo'),
        this.activatedRoute.snapshot.paramMap.get('shipper')).subscribe(response => {
          if (!this.utilService.validateEmptyData(response.callback[0].ShipperId)) {
            // tslint:disable-next-line:max-line-length
            const codeQR = `${response.callback[0].Domain}|${response.callback[0].Vendor}|${response.callback[0].ShipTo}|${response.callback[0].ShipperId}`;
            this.print = {
              Date: response.callback[0].Date,
              ShipFrom: response.callback[0].nameVendor,
              ShipToDes: response.callback[0].nameShipto,
              ShipTo: response.callback[0].ShipTo,
              Shipper: response.callback[0].ShipperId,
              Carrier: response.callback[0].Carrier,
              Driver: response.callback[0].Driver,
              Truck: response.callback[0].Truck,
              Comment: response.callback[0].Comment,
              QR: codeQR,
              ListShipping: response.callback[0].callback,
              Encabezado: true,
              ListRack: this.obtieneRack(response.callback[0].callback),
              Order: response.callback[0].Order,
              Seal:  response.callback[0].Seal
            };
            this.spinner.hide();
            setTimeout(() => {
              this.imprimirRemision();
            }, 500);
          } else {
            this.alert.error('Favor de comunicarse con sistemas.');
            setTimeout(() => {
              window.close();
            }, 2000);
          }

        }, err => {
          this.alert.error('Favor de comunicarse con sistemas.');
          setTimeout(() => {
            window.close();
          }, 2000);
        });
    }
  }

  imprimirRemision() {
    window.print();
    window.close();
  }

  obtieneRack(list: any) {
    const listRackGlobal = [];
    listRackGlobal.push({ code: list[0].rackCode, qty: 0, desc: list[0].rackDesc });
    list.forEach(element => {
      const parameter = element.rackCode;
      const details = $.grep(listRackGlobal, function (b) {
        return b.code === parameter;
      });

      if (this.utilService.validateEmptyData(details[0])) {
        listRackGlobal.push({ code: element.rackCode, qty: Number(element.rackQty), desc: element.rackDesc });
      } else {
        listRackGlobal.forEach(elementRack => {
          if (element.rackCode === details[0].code) {
            details[0].qty = Number(details[0].qty) + Number(element.rackQty);
          }
        });
      }
    });





    return listRackGlobal;
  }
}
