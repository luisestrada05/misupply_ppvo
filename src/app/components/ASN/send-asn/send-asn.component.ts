import { Component, OnInit, Inject } from '@angular/core';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import { UtilService } from 'src/app/services/util.service';
import { AsnService } from 'src/app/services/asn.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DataResult, SortDescriptor, process } from '@progress/kendo-data-query';
import { PageChangeEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { parametroConst } from 'src/app/const.parametro';

declare var $;

@Component({
  selector: 'app-send-asn',
  templateUrl: './send-asn.component.html',
  styles: []
})
export class SendAsnComponent implements OnInit {
  constAssets = parametroConst;
  view: DataResult;
  gridView: DataResult;
  listAsn: any;
  tieneDatos = false;
  sort: Array<SortDescriptor> = [];
  pageSize = 10;
  skip = 0;
  pageable = false;
  subPageable = false;

  fromDate: any;
  toDate: any;
  minDatefromDate: moment.Moment = moment().subtract(3, 'month');
  maxDatefromDate: moment.Moment = moment().subtract(1, 'days');
  minDatetoDate: moment.Moment = moment().subtract(3, 'month');
  maxDatetoDate: moment.Moment = moment().add(0, 'days');

  // listAsn = [];
  listDetailAsn: any;
  title: any;

  objDelete: any;
  titleDelete: any;
  reason: any;
  delete: any;

  objUpd: any;
  titleUpd: any;
  reasonUpd: any;
  send: boolean;

  constructor(
    private utilService: UtilService,
    private asnService: AsnService,
    private spinner: NgxSpinnerService,
    private alert: ToastrService
  ) {
    this.allData = this.allData.bind(this);
  }

  ngOnInit() {
    this.getDate();
  }

  getDate() {
    this.toDate = {
      startDate: moment().add(0, 'days'),
      endDate: moment().add(0, 'days'),
    };

    this.fromDate = {
      startDate: moment().subtract(1, 'days'),
      endDate: moment().subtract(1, 'days'),
    };
  }

  ngChangeFromDate(e: any) {
    this.minDatetoDate = moment(e.startDate._d);
  }

  validateData(): boolean {
    let bln = true;
    if (this.utilService.validateEmptyData(this.fromDate.startDate._d)) {
      bln = false;
    }
    if (this.utilService.validateEmptyData(this.toDate.startDate._d)) {
      bln = false;
    }
    return bln;
  }

  onSearch() {
    this.spinner.show();
    this.listAsn = [];
    const estatus = this.send === true ? 2 : 1;
    if (this.validateData()) {
      this.asnService.getmsAsn(moment(this.fromDate.startDate._d).format('L'),
        moment(this.toDate.startDate._d).format('L'), estatus).subscribe(response => {
          if (response.callback.length === 0) {
            this.alert.warning('No data found!');
            this.spinner.hide();
            this.tieneDatos = false;
          } else {
            this.spinner.hide();
            this.tieneDatos = true;
            response.callback.forEach(element => {
              if (element.Status === '2') {
                element.img = `${this.constAssets.img.par}images/yellow.png`;
              } else if (element.Status === '1') {
                element.img = `${this.constAssets.img.par}images/false.png`;
              } else {
                element.img = `${this.constAssets.img.par}images/true.png`;
              }
              this.listAsn.push(element);
            });
            this.pageable = this.listAsn.length > 9 ? true : false;
            this.loadData();
          }

        }, err => {
          this.spinner.hide();
          this.alert.error('Error. Favor de comunicarse con sistemas.');
        });
    } else {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    }
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

  loadData(): void {
    // console.log(this.listAsn);
    this.view = process(this.listAsn, { skip: this.skip, take: this.pageSize, sort: this.sort });
  }

  pageChangeUNO(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadDataUNO();
  }

  dataStateChangeUNO({ skip, take, sort }: DataStateChangeEvent): void {
    this.skip = skip;
    this.pageSize = take;
    this.sort = sort;
    this.loadDataUNO();
  }

  loadDataUNO(): void {
    this.gridView = process(this.listDetailAsn, { skip: this.skip, take: this.pageSize, sort: this.sort });
  }

  onDetailASN(e: any) {
    this.spinner.show();
    this.listDetailAsn = [];
    this.asnService.getmsDetailASN(e.id, e.type, e.ShipTo).subscribe(response => {
      this.spinner.hide();
      this.listDetailAsn = response.callback;
      this.subPageable = this.listDetailAsn > 14 ? true : false;
      this.loadDataUNO();
      this.title = `Shipper ${e.ShipTo}`;
      $('#modal-asnDetail').modal('show');
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  onPrint(e: any) {
    const url = window.location.href.split('#');
    switch (e.type) {
      case 'Transfer':
        window.open(url[0] + `#/impresiontransfer/${e.Domain}/${e.Vendor}/${e.id}`,
          '_blank');
        break;
      case 'Sale':
        window.open(url[0] + `#/impresion/${e.Domain}/${e.Vendor}/${e.ShipTo}/${e.id}`,
          '_blank');
        break;
      default:
        break;
    }
  }

  onExcelExport(e: any): void {
    const rows = e.workbook.sheets[0].rows;

    // align multi header
    rows[0].cells[2].hAlign = 'center';

    // set alternating row color
    let altIdx = 0;
    rows.forEach((row) => {
      if (row.type === 'data') {
        if (altIdx % 2 !== 0) {
          row.cells.forEach((cell) => {
            cell.background = '#aabbcc';
          });
        }
        altIdx++;
      }
    });
  }

  allData(): ExcelExportData {
    const result: ExcelExportData = {
      data: process(this.listDetailAsn, {}).data
    };

    return result;
  }

  onDelete(e: any) {
    this.delete = '';
    this.objDelete = '';
    this.objDelete = e;
    this.titleDelete = `Reason to Delete ASN - Shipper ${e.ShipperId}`;
    this.reason = `FROM: ${e.Vendor} - TO: ${e.ShipTo}`;
    $('#modal-delete').modal('show');
  }

  onDeleteShipper(e: any) {
    this.spinner.show();
    if (this.validateDelete()) {
      this.asnService.delASN2(e.Domain, e.Vendor, e.ShipTo, e.id, e.type).subscribe(response => {
        this.spinner.hide();
        // ANTES
        // this.alert.warning(response.callback[0].Error);
        // $('#modal-delete').modal('hide');
        // this.onSearch();
        // DESPUES
        if (response.response.pSuccess === 'true') {
          this.alert.success(response.response.pMssg);
          $('#modal-delete').modal('hide');
          this.onSearch();
        } else {
          this.alert.warning(response.response.pMssg);
        }
      }, err => {
        this.spinner.hide();
        this.alert.error('Error. Favor de comunicarse con sistemas.');
      });
    } else {
      this.spinner.hide();
    }
  }

  validateDelete(): boolean {
    let bln = true;
    if (this.utilService.validateEmptyData(this.delete)) {
      this.utilService.requiredFiel('delete', 3000);
      bln = false;
    }
    return bln;
  }

  // pDomain",
  // pVendor",
  // pShipto",
  // pId",
  // pType",
  // pUser",

  onUpdate(e: any) { // modal comment
    this.spinner.show();
    if (!e.Send) {
      this.asnService.updateASN3(e.Domain, e.Vendor, e.ShipTo, e.id, e.type).subscribe(response => {
        this.spinner.hide();
        if (response.response.pSuccess === 'true') {
          this.alert.success(response.response.pMssg);
          this.onSearch();
        } else {
          this.alert.warning(response.response.pMssg);
        }
      }, err => {
        this.spinner.hide();
        this.alert.error('Error. Favor de comunicarse con sistemas.');
      });
    } else {
      this.spinner.hide();
    }
  }
}

