import { Component, OnInit } from '@angular/core';
import { InquireService } from 'src/app/services/inquire.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { UtilService } from 'src/app/services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs } from 'file-saver';
import { DataResult, SortDescriptor, process } from '@progress/kendo-data-query';
import { PageChangeEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var $;

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styles: []
})
export class TransactionComponent implements OnInit {
  // kendo grid
  view: DataResult;
  listTransactionNoPart: any;
  tieneDatos = false;
  sort: Array<SortDescriptor> = [];
  pageSize = 10;
  skip = 0;
  pageable = false;

  // Formulario
  minDatefromDate: moment.Moment = moment().subtract(3, 'month');
  maxDatefromDate: moment.Moment = moment().subtract(1, 'days');
  minDatetoDate: moment.Moment = moment().subtract(3, 'month');
  maxDatetoDate: moment.Moment = moment().add(0, 'days');
  listNumeroParte = [];
  formulario: FormGroup;

  constructor(
    private inquireService: InquireService,
    private alert: ToastrService,
    private utilService: UtilService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder
  ) {
    this.allData = this.allData.bind(this);
  }

  ngOnInit() {
    this.getCatalogoNumeroParte();
    this.creaFormulario();
  }

  ngChangeFromDate(e: any) {
    this.minDatetoDate = moment(e.startDate._d);
  }

  getCatalogoNumeroParte() {
    this.inquireService.getCatalogoInqPartes().subscribe(response => {
      this.spinner.hide();
      this.listNumeroParte = response.callback;
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  get noParteNoValido() {
    return this.formulario.get('noParte').invalid && this.formulario.get('noParte').touched;
  }

  get fromDateNoValido() {
    return this.formulario.get('fromDate').invalid && this.formulario.get('fromDate').touched;
  }
  get toDateNoValido() {
    return this.formulario.get('toDate').invalid && this.formulario.get('toDate').touched;
  }

  creaFormulario() {
    this.formulario = this.fb.group({
      noParte: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    });
    this.cargaFormulario();
  }

  cargaFormulario() {
    this.formulario.reset({
      noParte: null,
      fromDate: {
        startDate: moment().subtract(1, 'days'),
        endDate: moment().subtract(1, 'days'),
      },
      toDate: {
        startDate: moment().add(0, 'days'),
        endDate: moment().add(0, 'days'),
      }
    });
  }

  onSearch() {
    if (this.formulario.invalid) {
      return Object.values(this.formulario.controls).forEach(control => {
        control.markAsTouched();
      });
    } else {
      const v = this.formulario.value;
      this.spinner.show();
      this.listTransactionNoPart = [];
      this.inquireService.getTransactionNoParte(moment(v.fromDate.startDate._d).format('L'),
        moment(v.toDate.startDate._d).format('L'), v.noParte).subscribe(response => {
          this.spinner.hide();
          if (response.callback.length === 0) {
            this.alert.warning('No data found!');
            this.tieneDatos = false;
          } else {
            this.tieneDatos = true;
            this.listTransactionNoPart = response.callback;
            this.pageable = this.listTransactionNoPart.length > 9 ? true : false;
            this.loadData();
          }
        }, err => {
          this.spinner.hide();
          this.alert.error('Error. Favor de comunicarse con sistemas.');
        });
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
    this.view = process(this.listTransactionNoPart, { skip: this.skip, take: this.pageSize, sort: this.sort });
  }

  onExcelExport(e: any): void {
    const rows = e.workbook.sheets[0].rows;
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
  }

  allData(): ExcelExportData {
    const result: ExcelExportData = {
      data: process(this.listTransactionNoPart, {}).data
    };

    return result;
  }
}
