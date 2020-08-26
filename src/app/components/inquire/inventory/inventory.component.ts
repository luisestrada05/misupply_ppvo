import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { InquireService } from 'src/app/services/inquire.service';
import { GridDataResult, PageChangeEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor, process } from '@progress/kendo-data-query';
import { Workbook, ExcelExportData } from '@progress/kendo-angular-excel-export';
import { saveAs } from '@progress/kendo-file-saver';
import { parametroConst } from 'src/app/const.parametro';

declare var $;

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styles: []
})
export class InventoryComponent implements OnInit {
  constAssets = parametroConst;
  view: GridDataResult;
  listInventory: any;
  listDetailInventory = [];
  tieneDatos = false;
  sort: Array<SortDescriptor> = [];
  pageSizes = true;
  skip = 0;
  pageable = false;
  pageSize = 10;
  info = true;
  previousNext = true;

  objDetail = {
    PartID: '',
    Desc: '',
    UM: '',
    Qty: 0,
    Image: '',
    img: ''
  };



  constructor(
    private utilService: UtilService,
    private spinner: NgxSpinnerService,
    private alert: ToastrService,
    private inquireService: InquireService
  ) {
    this.allData = this.allData.bind(this);


  }

  ngOnInit() {
    this.getInventory();
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
    this.view = process(this.listInventory, { skip: this.skip, take: this.pageSize, sort: this.sort });
  }

  getInventory() {
    this.listInventory = [];
    this.listDetailInventory = [];
    this.spinner.show();
    this.inquireService.getInventory().subscribe(response => {
      if (response.callback.length === 0) {
        this.tieneDatos = false;
        this.alert.warning('No data found!');
        this.spinner.hide();
      } else {
        this.tieneDatos = true;
        response.callback.forEach(element => {
          element.img = `${this.constAssets.img.par}images/${element.Image}`;
        });
        this.listInventory = response.callback;
        this.pageable = this.listInventory.length > 9 ? true : false;
        this.loadData();
        this.inquireService.getDetailInventory().subscribe(resp => {
          this.spinner.hide();
          this.inquireService.setListInventoryDetail(resp.callback);
          this.listDetailInventory = resp.callback;
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


  onExcelExport(args: any): void {
    this.spinner.show();
    args.preventDefault();

    const workbook = args.workbook;
    const rows = workbook.sheets[0].rows;
    const headerOptions = rows[0].cells[0];
    const listDetails = [];


    this.listInventory.forEach(padre => {
      const lista = [];
      this.listDetailInventory.forEach(hijo => {
        if (padre.PartID === hijo.PartID) {
          lista.push(hijo);
        }
      });
      const obj = {
        id: padre.PartID,
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
          cells: [{}, { value: details.PartID }, { value: details.PartLot },
          { value: details.UM }, { value: details.CompLot }, { value: details.um }]
        });
      }

      rows.splice(idx + 2, 0, {
        cells: [
          {},
          Object.assign({}, headerOptions, { value: 'Part' }),
          Object.assign({}, headerOptions, { value: 'Lot' }),
          Object.assign({}, headerOptions, { value: 'UM' }),
          Object.assign({}, headerOptions, { value: 'Qty Avaliable' }),
          Object.assign({}, headerOptions, { value: 'Component' })
        ]
      });
    }

    new Workbook(workbook).toDataURL().then((dataUrl: string) => {
      saveAs(dataUrl, 'Inquire Inventory.xlsx');
      this.spinner.hide();
    });
  }

  allData(): ExcelExportData {
    const result: ExcelExportData = {
      data: process(this.listInventory, {}).data
    };

    return result;
  }

  modalImage(e: any) {
    this.objDetail = null;
    this.objDetail = e;
    $('#modal-img').modal('show');
  }

}
