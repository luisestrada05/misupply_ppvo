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
import { AuthService } from 'src/app/services/auth.service';
import { parametroConst } from 'src/app/const.parametro';

declare var $;

@Component({
  selector: 'app-asn',
  templateUrl: './asn.component.html',
  styles: []
})
export class AsnComponent implements OnInit {
  constAssets = parametroConst;
  view: DataResult;
  lisAsn: any;
  tieneDatos = false;
  sort: Array<SortDescriptor> = [];
  pageSize = 10;
  skip = 0;
  pageable = false;


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
    private inquireService: InquireService,
    private authService: AuthService
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

  onSearch() {
    this.spinner.show();
    this.lisAsn = [];
    if (this.validateData()) {
      this.inquireService.getAsn(moment(this.fromDate.startDate._d).format('L'),
        moment(this.toDate.startDate._d).format('L')).subscribe(responseAsn => {
          if (responseAsn.callback.length === 0) {
            this.alert.warning('No data found!');
            this.spinner.hide();
            this.tieneDatos = false;
          } else {
            responseAsn.callback.forEach(element => {
              const par = Number(element.Status) + 1;
              element.img = `${this.constAssets.img.par}/images/${par}.png`;
            });
            this.lisAsn = responseAsn.callback;
            this.pageable = this.lisAsn.length > 9 ? true : false;
            this.loadData();
            this.tieneDatos = true;
            this.inquireService.getAsnDetail(moment(this.fromDate.startDate._d).format('L'),
            moment(this.toDate.startDate._d).format('L')).subscribe(responseAsnDetail => {
              this.inquireService.setListASNDetail(responseAsnDetail.callback);
              this.spinner.hide();
            }, err => {
              this.spinner.hide();
              this.alert.error('Error');
            });
          }
        }, err => {
          this.spinner.hide();
          this.alert.error('Error');
        });
    }
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
    this.view = process(this.lisAsn, { skip: this.skip, take: this.pageSize, sort: this.sort });
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

  onExcelExport(args: any): void {
    this.spinner.show();
    args.preventDefault();

    const workbook = args.workbook;
    const rows = workbook.sheets[0].rows;
    const headerOptions = rows[0].cells[0];
    const result = this.inquireService.getListASNDetail();
    const listDetails = [];


    this.lisAsn.forEach(padre => {
      const lista = [];
      result.forEach(hijo => {
          if (padre.ShipperId === hijo.ShipperId) {
              lista.push(hijo);
          }
      });
      const obj = {
        id: padre.ShipperId,
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


    for (let idx = listDetails.length - 1; idx >= 0; idx--) {
      const detail = (listDetails[idx].list);
      for (let detailsIdx = detail.length - 1; detailsIdx >= 0; detailsIdx--) {
        const details = detail[detailsIdx];
        rows.splice(idx + 2, 0, {
          cells: [{}, { value: details.PartID }, { value: details.PartDesc },
          { value: details.Lot }, { value: details.Qty }, { value: details.UM }]
        });
      }

      rows.splice(idx + 2, 0, {
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
      this.spinner.hide();
      saveAs(dataUrl, 'Inquire ASN.xlsx');
    });
  } 

  allData(): ExcelExportData {
    const result: ExcelExportData = {
      data: process(this.lisAsn, {}).data
    };

    return result;
  }

}
