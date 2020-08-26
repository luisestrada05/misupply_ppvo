import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import * as moment from 'moment';
import { UtilService } from 'src/app/services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { InquireService } from 'src/app/services/inquire.service';
import { PageChangeEvent, DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { ExcelExportData, Workbook } from '@progress/kendo-angular-excel-export';
import { saveAs } from '@progress/kendo-file-saver';
import { DataResult, SortDescriptor, process } from '@progress/kendo-data-query';

declare var $;

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styles: []
})
export class ShippingComponent implements OnInit {
  view: DataResult;
  tieneDatos = false;
  pageSize = 10;
  pageable = false;
  sort: Array<SortDescriptor> = [];
  skip = 0;

  listShipping: any;
  listShippingDetail = [];
  fromDate: any;
  toDate: any;
  minDatefromDate: moment.Moment = moment().subtract(3, 'month');
  maxDatefromDate: moment.Moment = moment().subtract(1, 'days');
  minDatetoDate: moment.Moment = moment().subtract(3, 'month');
  maxDatetoDate: moment.Moment = moment().add(0, 'days');

  constructor(
    private utilService: UtilService,
    private spinner: NgxSpinnerService,
    private alert: ToastrService,
    private inquireService: InquireService
  ) {
    this.allData = this.allData.bind(this);
  }

  ngOnInit() {
    this.getDate();
  }

  onSearch() {
    this.listShipping = [];
    this.listShippingDetail = [];
    this.spinner.show();
    if (this.validateData()) {
      this.inquireService.getShipping(moment(this.fromDate.startDate._d).format('L'),
        moment(this.toDate.startDate._d).format('L')).subscribe(response => {
          if (response.Shipping.length === 0) {
            this.tieneDatos = false;
            this.alert.warning('No data found!');
            this.spinner.hide();
          } else {
            this.tieneDatos = true;
            this.listShipping = response.Shipping;
            this.pageable = this.listShipping.length > 9 ? true : false;
            this.loadData();
            this.inquireService.getShippingDetail(moment(this.fromDate.startDate._d).format('L'),
              moment(this.toDate.startDate._d).format('L')).subscribe(resp => {
                this.spinner.hide();
                this.inquireService.setListShippingDetail(resp.ShippingDetail);
                this.listShippingDetail = resp.ShippingDetail;
              }, err => {
                this.spinner.hide();
                this.alert.error('Error. Favor de comunicarse con sistemas.');
              });
          }
        }, err => {
          this.spinner.hide();
          this.alert.error('Error. Favor de comunicarse con sistemas.');
        });
    }
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

  pageChange(event: PageChangeEvent): void {
    // console.log('CHANGE PAGE' + event.skip);
    this.skip = event.skip;
    this.loadData();
  } 

  dataStateChange({ skip, take, sort }: DataStateChangeEvent): void {
    // console.log(skip + ' ' + take + ' ' + sort + ' ');
    // console.log('CHANGE DATA');
    this.skip = skip;
    this.pageSize = take;
    this.sort = sort;
    this.loadData();
  }

  loadData(): void {
    this.view = process(this.listShipping, { skip: this.skip, take: this.pageSize, sort: this.sort });
  }

  onExcelExport(args: any): void {
    args.preventDefault();

    const workbook = args.workbook;
    const rows = workbook.sheets[0].rows;
    const headerOptions = rows[0].cells[0];
    const listDetails = [];


    this.listShipping.forEach(padre => {
      const lista = [];
      this.listShippingDetail.forEach(hijo => {
        if (padre.Shipper === hijo.Shipper) {
          lista.push(hijo);
        }
      });
      const obj = {
        id: padre.Shipper,
        list: lista
      };
      listDetails.push(obj);
    });


    rows.forEach(row => {
      if (row.type === 'data') {
        row.cells.forEach((cell) => {
          cell.background = '#aabbcc';
        });
      }
    });



    for (let i = listDetails.length - 1; i >= 0; i--) {
      const detail = (listDetails[i].list);
      for (let y = detail.length - 1; y >= 0; y--) {
        const details = detail[y];
        rows.splice(i + 2, 0, {
          cells: [{}, { value: details.part }, { value: details.desc },
          { value: details.lote }, { value: details.qty }, { value: details.um }]
        });
      }

      rows.splice(i + 2, 0, {
        cells: [
          {},
          Object.assign({}, headerOptions, { value: 'Part' }),
          Object.assign({}, headerOptions, { value: 'Description' }),
          Object.assign({}, headerOptions, { value: 'Lot' }),
          Object.assign({}, headerOptions, { value: 'Quantity' }),
          Object.assign({}, headerOptions, { value: 'UM' })
        ]
      });
    }

    new Workbook(workbook).toDataURL().then((dataUrl: string) => {
      saveAs(dataUrl, 'Inquire Shipping.xlsx');
    });
  }

  allData(): ExcelExportData {
    const result: ExcelExportData = {
      data: process(this.listShipping, {}).data
    };

    return result;
  }

}
