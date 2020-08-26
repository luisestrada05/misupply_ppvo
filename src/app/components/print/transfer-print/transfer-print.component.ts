import { Component, OnInit, Input } from '@angular/core';
import { PrintTransferModel } from 'src/app/models/printTransfer.model';
import { UtilService } from 'src/app/services/util.service';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from 'src/app/services/transaction.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { parametroConst } from 'src/app/const.parametro';

@Component({
  selector: 'app-transfer-print',
  templateUrl: './transfer-print.component.html'
})
export class TransferPrintComponent implements OnInit {
  @Input() public print: any;
  constAssets = parametroConst;
  fecha = new Date();
  imprimiendo = false;
  newData = false;

  constructor(
    private utilService: UtilService,
    private activatedRoute: ActivatedRoute,
    private transactionService: TransactionService,
    private spinner: NgxSpinnerService,
    private alert: ToastrService
  ) { }

  ngOnInit() {
    if (!this.utilService.validateEmptyData(this.activatedRoute.snapshot.paramMap.get('domain')) &&
      !this.utilService.validateEmptyData(this.activatedRoute.snapshot.paramMap.get('vendor')) &&
      !this.utilService.validateEmptyData(this.activatedRoute.snapshot.paramMap.get('reference'))) {
      this.spinner.show();

      this.transactionService.getTransferImpresion(this.activatedRoute.snapshot.paramMap.get('reference')).subscribe(response => {

          if (!this.utilService.validateEmptyData(response.callback[0].transferId)) {
            // tslint:disable-next-line:max-line-length
            const codeQR = `${response.callback[0].Domain}|${response.callback[0].Vendor}|${response.callback[0].transferId}`;
            this.print = {
              Date: response.callback[0].Date,
              nameVendor: response.callback[0].nameVendor,
              nameShipto: response.callback[0].nameShipto,
              ShipTo: response.callback[0].ShipTo,
              transferId: response.callback[0].transferId,
              Carrier: response.callback[0].Carrier,
              Driver: response.callback[0].Driver,
              Truck: response.callback[0].Truck,
              Comment: response.callback[0].Comment,
              Reference: response.callback[0].Reference,
              QR: codeQR,
              ListShipping: response.callback[0].callback,
              Encabezado: true,
              Type: '',
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
            }, 50);
          }

        }, err => {
          this.alert.error('Favor de comunicarse con sistemas.');
          setTimeout(() => {
            window.close();
          }, 50);
        });

    }
  }

  imprimirRemision() {
    window.print();
    window.close();
  }

}
