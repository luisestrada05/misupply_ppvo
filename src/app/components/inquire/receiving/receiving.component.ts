import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import { UtilService } from 'src/app/services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { InquireService } from 'src/app/services/inquire.service';
import { DataResult, SortDescriptor, process } from '@progress/kendo-data-query';
import { PageChangeEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { ExcelExportData, Workbook } from '@progress/kendo-angular-excel-export';

declare var $;

@Component({
  selector: 'app-receiving',
  templateUrl: './receiving.component.html',
  styles: []
})
export class ReceivingComponent implements OnInit {
  view: DataResult;
  tieneDatos = false;
  sort: Array<SortDescriptor> = [];
  pageSize = 10;
  skip = 0;
  pageable = false;

  viewDet: DataResult;
  tieneDatosDet = false;
  sortDet: Array<SortDescriptor> = [];
  pageSizeDet = 10;
  skipDet = 0;
  pageableDet = false;


  fromDate: any;
  toDate: any;
  minDatefromDate: moment.Moment = moment().subtract(3, 'month');
  maxDatefromDate: moment.Moment = moment().subtract(1, 'days');
  minDatetoDate: moment.Moment = moment().subtract(3, 'month');
  maxDatetoDate: moment.Moment = moment().add(0, 'days');
  received: any;
  listFolios: any;
  titleDownload: any;
  listFile = [];


  constructor(
    private utilService: UtilService,
    private alert: ToastrService,
    private spinner: NgxSpinnerService,
    private inquireService: InquireService
  ) {
    this.allData = this.allData.bind(this);
  }

  ngOnInit() {
    this.getInicioFecha();
  }

  getInicioFecha() {
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
    if (this.validateData()) {
      const estatus = this.received === true ? 2 : 1;
      this.inquireService.getFolios(moment(this.fromDate.startDate._d).format('L'),
        moment(this.toDate.startDate._d).format('L'), estatus).subscribe(response => {
          if (response.Receipt.length === 0) {
            this.tieneDatos = false;
            this.alert.warning('No data found!');
            this.spinner.hide();
          } else {
            this.tieneDatos = true;
            this.listFolios = response.Receipt;
            this.pageable = this.listFolios.length > 9 ? true : false;
            this.loadData();
            this.inquireService.getFoliosDetalle(moment(this.fromDate.startDate._d).format('L'),
              moment(this.toDate.startDate._d).format('L'), estatus).subscribe(res => {
                this.spinner.hide();
                this.inquireService.setListRecivingDetail(res.ttdetalle);
              }, err => {
                this.spinner.hide();
                this.alert.error('Error. Favor de comunicarse con sistemas.');
              });
          }
        }, err => {
          this.spinner.hide();
          this.alert.error('Error. Favor de comunicarse con sistemas.');
        });
    } else {
      this.spinner.hide();
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
    this.view = process(this.listFolios, { skip: this.skip, take: this.pageSize, sort: this.sort });
  }

  onExcelExport(args: any): void {
    args.preventDefault();

    const workbook = args.workbook;
    const rows = workbook.sheets[0].rows;
    const headerOptions = rows[0].cells[0];
    const data = this.listFolios;
    const result = this.inquireService.getListRecivingDetail();
    const listDetails = [];


    this.listFolios.forEach(padre => {
      const lista = [];
      result.forEach(hijo => {
        if (padre.shipper === hijo.shipper) {
          lista.push(hijo);
        }
      });
      const obj = {
        id: padre.shipper,
        list: lista
      };
      listDetails.push(obj);
    });


    rows.forEach(row => {
      // console.log(row);
      if (row.type === 'data') {
        row.cells.forEach((cell) => {
          cell.background = '#aabbcc';
        });
      }
    });


    for (let idx = listDetails.length - 1; idx >= 0; idx--) {
      const detail = (listDetails[idx].list);
      for (let detailsIdx = detail.length - 1; detailsIdx >= 0; detailsIdx--) {
        const details = detail[detailsIdx];
        rows.splice(idx + 2, 0, {
          cells: [{}, { value: details.part }, { value: details.desc },
          { value: details.lote }, { value: details.qty }, { value: details.qtyrec }, { value: details.um }]
        });
      }

      rows.splice(idx + 2, 0, {
        cells: [
          {},
          Object.assign({}, headerOptions, { value: 'Part' }),
          Object.assign({}, headerOptions, { value: 'Description' }),
          Object.assign({}, headerOptions, { value: 'Lot' }),
          Object.assign({}, headerOptions, { value: 'Quantity' }),
          Object.assign({}, headerOptions, { value: 'Qty Rec' }),
          Object.assign({}, headerOptions, { value: 'UM' })
        ]
      });
    }

    new Workbook(workbook).toDataURL().then((dataUrl: string) => {
      saveAs(dataUrl, 'Inquire Reciving.xlsx');
    });
  }

  allData(): ExcelExportData {
    const result: ExcelExportData = {
      data: process(this.listFolios, {}).data
    };

    return result;
  }

  onDownload(e: any) {
    this.listFile = [];
    this.spinner.show();
    this.inquireService.getFile(e.shipfrom, e.shipto, e.shipper).subscribe(response => {
      if (response.Files.length === 0) {
        this.tieneDatosDet = false;
        this.alert.warning('No data found!');
        this.spinner.hide();
      } else {
        this.tieneDatosDet = true;
        this.listFile = response.Files;
        this.pageableDet = this.listFile.length > 9 ? true : false;
        this.titleDownload = `Shipper : ${e.shipper}`;
        this.loadDataDet();
        $('#modal-download').modal('show');
        this.spinner.hide();
      }
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  loadDataDet(): void {
    this.viewDet = process(this.listFile, { skip: this.skipDet, take: this.pageSizeDet, sort: this.sortDet });
  }

  pageChangeDet(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadDataDet();
  }

  dataStateChangeDet({ skip, take, sort }: DataStateChangeEvent): void {
    this.skipDet = skip;
    this.pageSizeDet = take;
    this.sortDet = sort;
    this.loadDataDet();
  }


  downloadFile(e: any) {
    this.spinner.show();
    const byteArray = new Uint8Array(atob(e.File).split('').map(char => char.charCodeAt(0)));
    const blob = new Blob([byteArray], {
      type: 'application/pdf'
    });
    this.spinner.hide();
    saveAs(blob, e.FileName);
  }
}
