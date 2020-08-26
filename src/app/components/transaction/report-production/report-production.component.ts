import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { saveAs } from 'file-saver';
import { TransactionService } from 'src/app/services/transaction.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataResult, SortDescriptor, process  } from '@progress/kendo-data-query';
import { PageChangeEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';

declare var $;

@Component({
  selector: 'app-report-production',
  templateUrl: './report-production.component.html',
  styles: []
})
export class ReportProductionComponent implements OnInit {
  view: DataResult;
  tieneDatos = false;
  sort: Array<SortDescriptor> = [];
  pageSize = 10;
  skip = 0;
  pageable = false;
  subPageable = false;


  toDate: any;
  minDatetoDate: moment.Moment = moment().subtract(3, 'month');
  maxDatetoDate: moment.Moment = moment().add(0, 'days');
  p: any;

  qty: any;
  lote: any;
  noPart = null;
  listReporteProduccion: any;
  objDetail = {
    PartId: '',
    DescPart: '',
    UM: '',
    Lot: '',
    CompId: '',
    QtyPer: 0,
    QtyOh: 0
  };
  listDetail = [];
  btnBln = true;
  inputBln = false;

  constructor(
    private transactionService: TransactionService,
    private alert: ToastrService,
    private spinner: NgxSpinnerService,
    private utilService: UtilService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.getInicioFecha();
  }

  getInicioFecha() {
    this.toDate = {
      startDate: moment().add(0, 'days'),
      endDate: moment().add(0, 'days'),
    };
    this.getCatReportProduction();
  }

  getCatReportProduction() {
    this.spinner.show();
    this.transactionService.getCatReportProduction().subscribe(response => {
      this.spinner.hide();
      this.listReporteProduccion = response.callback;
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  loadData(): void {
    this.view = process(this.listDetail, { skip: this.skip, take: this.pageSize, sort: this.sort });
  }

  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadData();
  }

  dataStateChange({ skip, take, sort }: DataStateChangeEvent): void {
    this.skip = skip;
    this.pageSize = take;
    this.sort = sort;
    this.loadData();
  }

  onChangeidReport() {
    this.listDetail = [];
    this.tieneDatos = false;
    this.qty = '';
    this.lote = '';
    this.btnBln = true;
    this.spinner.show();
    this.transactionService.getDetailReportProduction(this.noPart).subscribe(response => {
      this.spinner.hide();
      this.objDetail = response.callback[0];
      if (response.callback[0].Lot === 'L') {
        this.inputBln = false;
      } else if (response.callback[0].Lot !== 'L') {
        this.inputBln = true;
        this.lote = '';
      }
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });

  }

  validateEvent(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onSearch() {
    this.listDetail = [];
    this.spinner.show();
    this.transactionService.getProdLotes(this.noPart, this.objDetail.CompId, this.qty).subscribe(response => {
      this.spinner.hide();
      this.tieneDatos = true;
      this.listDetail = response.callback;
      this.pageable = this.listDetail.length > 9 ? true : false;
      this.loadData();
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  validateBtn() {
    if (this.utilService.validateEmptyData(this.qty)) {
      this.btnBln = true;
    } else {
      this.btnBln = false;
    }
  }

  confirm(e: any) {
    this.spinner.show();
    if (this.validateData()) {
      const user = this.authService.getUser();
      const obj = {
        pCantidadComp: e.QtyReq,
        pCantidadParte: this.qty,
        pComponente: this.objDetail.CompId,
        pLoteComp: e.Lot,
        pLoteParte: this.lote,
        pParte: this.noPart,
        pDominio: user.login_domain,
        pUser: user.login_userid,
        pVendor: user.login_vendor_code
      };

      this.transactionService.postProdUpdate(obj).subscribe(response => {
        this.spinner.hide();
        this.alert.success(response.response.pStatus);
        this.clean();
      }, err => {
        this.spinner.hide();
        this.alert.error('Error. Favor de comunicarse con sistemas.');
      });
    } else {
      this.spinner.hide();
    }
  }

  clean() {
    this.lote = '';
    this.noPart = null;
    this.qty = '';
    this.listDetail = [];
    this.objDetail.QtyOh = 0;
  }

  validateData(): boolean {
    let bln = true;
    if (!this.inputBln) {
      if (this.utilService.validateEmptyData(this.lote)) {
        this.alert.warning('Lote invalid');
        bln = false;
      }
    }
    if (this.utilService.validateEmptyData(this.qty)) {
      this.alert.warning('Qty invalid');
      bln = false;
    }
    return bln;
  }

}

