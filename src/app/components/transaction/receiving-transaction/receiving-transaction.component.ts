import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { saveAs } from 'file-saver';
import { TransactionService } from 'src/app/services/transaction.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/services/auth.service';
import { UtilService } from 'src/app/services/util.service';
import { DataResult, SortDescriptor, process } from '@progress/kendo-data-query';
import { DataStateChangeEvent, PageChangeEvent } from '@progress/kendo-angular-grid';
import { FolioModel } from 'src/app/models/folio';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var $;
 
@Component({
  selector: 'app-receiving-transaction',
  templateUrl: './receiving-transaction.component.html',
  styles: []
})
export class ReceivingTransactionComponent implements OnInit {
  // grid
  tieneDatos = false;
  view: DataResult;
  listDetail: any;
  sort: Array<SortDescriptor> = []; 
  pageSize = 10;
  skip = 0;
  pageable = false;
  confirmacionNoValida = false;

  // formulario
  formulario: FormGroup;
  toDate: any;
  listShipFrom = [];
  listFolio: FolioModel[] = [];
  customFileLang: any;
  comment: any;
  listPart = [];
  listFile = [];

  constructor(
    private transactionService: TransactionService,
    private alert: ToastrService,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private utilService: UtilService,
    private fb: FormBuilder
  ) {
    this.creaFormulario();
  }

  ngOnInit() {
    this.customFileLang = 'Seleccionar Archivo';
    this.getInicioFecha();
  }

  get shipperNoValido() {
    return this.formulario.get('shipper').invalid && this.formulario.get('shipper').touched;
  }

  get shipFromNoValido() {
    return this.formulario.get('shipFrom').invalid && this.formulario.get('shipFrom').touched;
  }

  creaFormulario() {
    this.formulario = this.fb.group({
      shipFrom: ['', Validators.required],
      shipper: ['', Validators.required],
      toDate: [{ disable: true }]
    });
  }

  getInicioFecha() {
    this.formulario.reset({
      shipFrom: null,
      shipper: null,
      toDate: {
        startDate: moment().add(0, 'days'), endDate: moment().add(0, 'days')
      },
    });

    this.getCatShipFrom();
  }

  getCatShipFrom() {
    this.listShipFrom = [];
    this.spinner.show();
    this.transactionService.getCatShip().subscribe(response => {
      this.spinner.hide();
      this.listShipFrom = response.shipFrom;
      // console.log(this.listShipFrom);
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  onChangeShipFrom() {
    this.reset();
    this.formulario.patchValue({ shipper: null });
    this.listFolio = [];
    this.tieneDatos = false;

    this.spinner.show();
    this.transactionService.getReceivingFolio(this.formulario.value.shipFrom).subscribe(response => {
      this.spinner.hide();
      response.ttfolios.forEach(element => {
        this.listFolio.push({ Folio: element.ttnum });
      });
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  onChangeFolio(): void {
    this.tieneDatos = false;

    this.spinner.show();
    this.transactionService.getReceivingValida(this.formulario.value.shipFrom, this.formulario.value.shipper).subscribe(response => {
      this.spinner.hide();
      if (response.response.remisionStatus === 'Error') {
        this.alert.warning(response.response.remisionMensaje);
      }
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  onSearch() {
    if (this.formulario.invalid) {
      return Object.values(this.formulario.controls).forEach(control => {
        control.markAsTouched();
      });
    } else {
      this.listDetail = [];
      this.spinner.show();
      this.transactionService.getReceivinigDetalle(this.formulario.value.shipFrom, this.formulario.value.shipper).subscribe(response => {
        this.spinner.hide();
        this.tieneDatos = true;
        this.listDetail = response.ttdetalle;
        this.pageable = this.listDetail.lenght > 9 ? true : false;
        this.loadData();
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
    this.view = process(this.listDetail, { skip: this.skip, take: this.pageSize, sort: this.sort });
  }

  // GRID Y ARCHIVO
  handleFileInput(Files: FileList) {
    this.confirmacionNoValida = false;
    const user = this.authService.getUser();
    this.customFileLang = 'Seleccionar Archivo';
    this.listFile = [];
    // tslint:disable-next-line:forin
    for (const propiedad in Object.getOwnPropertyNames(Files)) {
      const archivoTemporal = Files[propiedad];
      if (archivoTemporal.size < 5000000) {

        // nombre label
        if (this.customFileLang === 'Seleccionar Archivo') {
          this.customFileLang = archivoTemporal.name;
        } else {
          this.customFileLang = `${this.customFileLang}, ${archivoTemporal.name}`;
        }

        // genera objeto
        const posicion = this.listFile.length;
        this.listFile.push({
          Dominio: user.login_domain,
          ShipFrom: this.formulario.value.shipFrom,
          ShipTo: user.login_vendor_code,
          Shipper: this.formulario.value.shipper,
          FileName: archivoTemporal.name,
          FileSize: archivoTemporal.size,
          File: ''
        });

        const reader = new FileReader();
        reader.readAsBinaryString(archivoTemporal);
        reader.onload = (e) => {
          this.listFile[posicion].File = btoa(reader.result.toString());
        };
      } else {
        this.alert.error('File size exceeded, allowed limit is 5Mb.');
        this.listFile = [];
      }
    }

  }

  onConfirm() {
    if (this.listFile.length > 0) {
      this.spinner.show();
      if (this.generateResponse()) {
        // genera objeto requerido
        const data = {
          Part: this.listPart,
          Files: this.listFile
        };
        this.transactionService.postReceiving(data).subscribe(response => {
          this.spinner.hide();

          if (response.response.pSuccess === 'true') {
            this.alert.success(response.response.pMssg);
            this.reset();
            this.getInicioFecha();
          } else {
            this.alert.warning(response.response.pMssg);
          }

          if (!this.utilService.validateEmptyData(response.response.pEmailMssg)) {
            this.alert.warning(response.response.pEmailMssg);
          }

        }, err => {
          this.spinner.hide();
          this.alert.error('Error. Favor de comunicarse con sistemas.');
        });
      } else {
        this.spinner.hide();
        this.customFileLang = 'Seleccionar Archivo';
        this.listFile = [];
        this.alert.warning('Favor de volverlo a intentar');
      }
    } else {
      this.confirmacionNoValida = true;
      return;
    }
  }

  generateResponse(): boolean {
    let bln = true;
    const user = this.authService.getUser();
    this.listPart = [];
    this.listDetail.forEach(element => {
      this.listPart.push({
        Dominio: user.login_domain,
        ShipFrom: this.formulario.value.shipFrom,
        ShipTo: user.login_vendor_code,
        Shipper: this.formulario.value.shipper,
        User: user.login_userid,
        Part: element.ttparte,
        Lot: element.ttlote,
        QtyShip: element.ttqty,
        QtyRec: element.ttqtyrec,
        Comment: this.comment
      });
    });
    this.listFile.forEach(element => {
      if (this.utilService.validateEmptyData(element.File)) {
        bln = false;
        return bln;
      }
    });
    return bln;
  }

  updateDiscrepancia(element: any, update: any) {
    element.ttqtyrec = Number(update);
  }

  reset() {
    this.customFileLang = '';
    this.comment = '';
    this.confirmacionNoValida = false;
    this.listDetail = [];
    this.tieneDatos = false;
    this.listFile = [];
  }

}
