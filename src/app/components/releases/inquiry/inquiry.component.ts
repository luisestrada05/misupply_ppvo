import { Component, OnInit } from '@angular/core';
import { ReleaseService } from 'src/app/services/release.service';
import { UtilService } from 'src/app/services/util.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { saveAs } from 'file-saver'; 
import * as moment from 'moment';
import { ExcelExportData, Workbook } from '@progress/kendo-angular-excel-export';
import { PageChangeEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { GroupDescriptor, DataResult, process, SortDescriptor } from '@progress/kendo-data-query';
import { IntlService } from '@progress/kendo-angular-intl';
import { parametroConst } from 'src/app/const.parametro';

declare var $;

interface ColumnSetting {
  field: string;
  title: string;
  format?: string;
  type: 'text' | 'numeric' | 'boolean' | 'date';
  width: string;
}

@Component({
  selector: 'app-inquiry',
  templateUrl: './inquiry.component.html',
  styles: []
})
export class InquiryComponent implements OnInit {
  constAssets = parametroConst;
  gridView: DataResult;
  pageSize = 10;
  skip = 0;
  tieneDatos = false;
  pageable = false;
  sort: Array<SortDescriptor> = [];

  fromDate: any;
  toDate: any;
  p = 1;
  a = 1;
  w = 4;
  cuerpo: any;
  title: any;
  detailRelease = [];
  minDatefromDate: moment.Moment = moment().subtract(3, 'month');
  maxDatefromDate: moment.Moment = moment().subtract(1, 'days');
  minDatetoDate: moment.Moment = moment().subtract(3, 'month');
  maxDatetoDate: moment.Moment = moment().add(0, 'days');
  listRelease = [];

  columnsDay = [];
  columnsWekk = [];
  columnsMonth = [];
  day: number;
  month: number;
  week: number;

  gridViewDetails: DataResult;
  pageSizeDetail = 10;
  skipDetail = 0;
  tieneDatosDetail = true;
  pageableDetail = true;
  sortDetail: Array<SortDescriptor> = [];
  listDetalle = [];
  columns: ColumnSetting[];
  // tslint:disable-next-line:variable-name
  private _fieldsMapping: any = {};
  constructor(
    private releaseService: ReleaseService,
    private utilService: UtilService,
    private alert: ToastrService,
    private spinner: NgxSpinnerService,
    private sanitizer: DomSanitizer,
    public intl: IntlService
  ) {
    this.allData = this.allData.bind(this);
  }

  ngOnInit() {
    this.toDate = {
      startDate: moment().add(0, 'days'),
      endDate: moment().add(0, 'days'),
    };

    this.fromDate = {
      startDate: moment().subtract(1, 'days'),
      endDate: moment().subtract(1, 'days'),
    };
  }

  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadItems();
  }

  loadItems(): void {
    this.gridView = process(this.listRelease, { skip: this.skip, take: this.pageSize });
  }


  ngChangeFromDate(e: any) {
    this.minDatetoDate = moment(e.startDate._d);
  }

  dataStateChange({ skip, take, sort }: DataStateChangeEvent): void {
    this.skip = skip;
    this.pageSize = take;
    this.sort = sort;
    this.loadItems();
  }


  onSearch() {
    this.spinner.show();
    this.listRelease = [];
    if (this.validateData()) {
      this.releaseService.getRelease(moment(this.fromDate.startDate._d).format('L'),
        moment(this.toDate.startDate._d).format('L')).subscribe(response => {
          if (response.callback.length === 0) {
            this.alert.warning('No data found!');
            this.tieneDatos = false;
            this.spinner.hide();
          } else {
            this.spinner.hide();
            response.callback.forEach(element => {
              if (element.ttractive) {
                element.image = `verde`;
                element.img = `${this.constAssets.img.par}images/true.png`;
              } else if (!element.ttractive) {
                element.image = `rojo`;
                element.img = `${this.constAssets.img.par}images/false.png`;
              }
              this.listRelease.push(element);
            });
            this.tieneDatos = true;
            this.pageable = this.listRelease.length > 9 ? true : false;
            this.loadItems();
          }
        }, err => {
          this.spinner.hide();
          this.alert.error('Error');
        });
    }
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

  pageChangeDetail(event: PageChangeEvent): void {
    this.skipDetail = event.skip;
    this.loadItemsDetails();
  }


  loadItemsDetails(): void {
    this.gridViewDetails = process(this.detailRelease, { skip: this.skipDetail, take: this.pageSizeDetail });
  }

  onDetail(item: any) {
    this.detailRelease = [];
    this.spinner.show();
    this.title = item.ttrid + ' - ' + item.ttrnbr;
    this.releaseService.getDetailRelease(item.ttrnbr, item.ttrid).subscribe(response => {
      if (!this.utilService.validateEmptyData(response.row)) {
        response.row.forEach((elementCuerpo, i) => {
          if (i === 0) {
            this.columns = [
              {
                field: 'part',
                title: 'Item',
                type: 'text',
                width: '150px'
              }, {
                field: 'custpart',
                title: 'Supplier',
                type: 'text',
                width: '150px'
              }, {
                field: 'lastps',
                title: 'Last Shipper',
                type: 'text',
                width: '150px'
              }, {
                field: 'delayamt',
                title: 'Qty Pendding',
                type: 'text',
                width: '150px',
                format: '{0:n}',
              }];
            elementCuerpo.column.forEach(elementDetailCuerpo => {
              const fechaField = elementDetailCuerpo.dateini.split('-')[2] + '$' +
                elementDetailCuerpo.dateini.split('-')[1] + '$' + elementDetailCuerpo.dateini.split('-')[0];
              const fechaTitle = elementDetailCuerpo.dateini.split('-')[2] + '/' +
                elementDetailCuerpo.dateini.split('-')[1] + '/' + elementDetailCuerpo.dateini.split('-')[0];
              this.columns.push({
                field: `Date_${fechaField}`,
                title: fechaTitle,
                type: 'date',
                format: '{0:d}',
                width: '100px'
              });
            });
          }
        });

        response.row.forEach(elementCuerpo => {
          const objParametro = {
              part: String(elementCuerpo.part),
              custpart: String(elementCuerpo.custpart),
              lastps: String(elementCuerpo.lastps),
              delayamt: String(elementCuerpo.delayamt)
            };
          elementCuerpo.column.forEach(elementDetailCuerpo => {
            const fechaField = elementDetailCuerpo.dateini.split('-')[2] + '$' +
                  elementDetailCuerpo.dateini.split('-')[1] + '$' + elementDetailCuerpo.dateini.split('-')[0];
            objParametro[`Date_${fechaField}`] =  Number(elementDetailCuerpo.qty);
          });
          this.detailRelease.push(objParametro);
        });

        this.loadItemsDetails();

        setTimeout(() => {
          this.spinner.hide();
          $('#modal-release').modal('show');
        }, 200);
      } else {
        this.alert.warning('No data found!');
        this.spinner.hide();
      }
    }, err => {
      this.alert.error('Error');
    });
  }

  onExcelExport(e: any): void {
    this.spinner.show();
    e.preventDefault();

    const workbook = e.workbook;
    const rows = workbook.sheets[0].rows;
    rows[0].cells[2].hAlign = 'center';
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
    new Workbook(workbook).toDataURL().then((dataUrl: string) => {
      this.spinner.hide();
      saveAs(dataUrl, 'Release Detail.xlsx');
    });
  }

  allData(): ExcelExportData {
    const result: ExcelExportData = {
      data: process(this.detailRelease, {}).data
    };
    return result;
  }

}

