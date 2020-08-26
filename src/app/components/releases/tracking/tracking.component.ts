import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReleaseService } from 'src/app/services/release.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { PageChangeEvent, GridDataResult, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { GroupDescriptor, DataResult, process, SortDescriptor } from '@progress/kendo-data-query';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { parametroConst } from 'src/app/const.parametro';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styles: []
})
export class TrackingComponent implements OnInit, OnDestroy {
  constAssets = parametroConst;
  view: GridDataResult;
  tieneDatos = false;
  pageSizes = true;
  pageable = false;
  pageSize = 10;
  skip = 0;
  sort: Array<SortDescriptor> = [];
  groups: GroupDescriptor[] = [{ field: 'order' }];


  listTracking = [];
  t: any;
  tmasUno: any;
  tmasDos: any;
  cuerpo: any;

  count: number;
  counter: Observable<number>;
  unsubscribe: Subject<void> = new Subject();

  constructor(
    private releaseService: ReleaseService,
    private alert: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    this.allData = this.allData.bind(this);
  }

  ngOnInit() {
    this.counter = new Observable<number>(observer => {
      let index = -1;
      // tslint:disable-next-line:no-shadowed-variable
      const interval = setInterval(() => {
        index++;
        this.getTrackingRelease();
        observer.next(index);
      }, 1800000);

      // teardown
      return (() => {
        clearInterval(interval);
      });
    });

    this.counter
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (value) => this.count = value,
        (error) => console.error(error)
      );

    this.getTrackingRelease();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getTrackingRelease() {
    this.spinner.show();
    this.listTracking = [];
    this.releaseService.getTrackingRelease().subscribe(response => {
      if (response.callback.length === 0) {
        this.alert.warning('No data found!');
        this.tieneDatos = false;
        this.spinner.hide();
      } else {
        response.callback.forEach(element => {
          if (element.status === 'rojo') {
            element.image = `rojo`;
            element.img = `${this.constAssets.img.par}images/false.png`;
          } else if (element.status === 'verde') {
            element.image = `verde`;
            element.img = `${this.constAssets.img.par}images/true.png`;
          }
          this.listTracking.push(element);
          this.myFunctiondate();
        });
        this.pageable = this.listTracking.length > 9 ? true : false;
        this.tieneDatos = true;
        this.loadItems();
      }
    }, err => {
      this.spinner.hide();
      this.alert.error('Favor de comunicarse con sistemas.');
    });
  }

  myFunctiondate() {
    this.t = new Date();
    this.t = moment(this.t).format('ll');
    this.myFunction_tomorrow();
  }

  myFunction_tomorrow(): any {
    this.tmasUno = new Date();
    this.tmasUno = moment(this.tmasUno.getTime() + 86400000).format('ll');
    this.myFunction_t_tomorrow();
  }

  myFunction_t_tomorrow() {
    this.tmasDos = new Date();
    this.tmasDos = moment(this.tmasDos.getTime() + 172800000).format('ll');
    this.spinner.hide();
  }

  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadItems();
  }

  groupChange(groups: GroupDescriptor[]): void {
    this.groups = groups;
    this.loadItems();
  }

  dataStateChange({ skip, take, sort }: DataStateChangeEvent): void {
    this.skip = skip;
    this.pageSize = take;
    this.sort = sort;
    this.loadItems();
  }

  loadItems(): void {
    this.view = process(this.listTracking, { group: this.groups, skip: this.skip, take: this.pageSize, sort: this.sort });
  }

  allData(): ExcelExportData {
    const result: ExcelExportData = {
      data: process(this.listTracking, { group: this.groups }).data,
      group: this.groups
    };

    return result;
  }

  onExcelExport(e: any): void {
    this.spinner.show();
    const rows = e.workbook.sheets[0].rows;

    // align multi header
    rows[0].cells[2].hAlign = 'center';

    // set alternating row color
    let altIdx = 0;
    rows.forEach((row) => {
      row.cells.forEach(element => {
        if (element.value === 'rojo') {
          element.value = '⚫';
          element.format = ';;;[red]';
        } else if (element.value === 'verde') {
          element.value = '⚫';
          element.format = ';;;[green]';
        }
      });
      if (row.type === 'data') {
        if (altIdx % 2 !== 0) {
          row.cells.forEach((cell) => {
            cell.background = '#aabbcc';
          });
        }
        altIdx++;
      }
    });
    this.spinner.hide();
  }

}
