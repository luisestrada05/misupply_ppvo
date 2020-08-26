import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { saveAs } from 'file-saver';
import { TransactionService } from 'src/app/services/transaction.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataResult, SortDescriptor, process } from '@progress/kendo-data-query';
import { DataStateChangeEvent, PageChangeEvent } from '@progress/kendo-angular-grid';
import { DomSanitizer } from '@angular/platform-browser';
import { parametroConst } from 'src/app/const.parametro';
import { Router } from '@angular/router';
import { PrintModel } from 'src/app/models/print.model';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';

declare var $;

interface ErroValidate {
  [s: string]: boolean;
}


@Component({
  selector: 'app-shipping-transaction',
  templateUrl: './shipping-transaction.component.html',
  styles: []
})
export class ShippingTransactionComponent implements OnInit {
  constAssets = parametroConst;
  view: DataResult;
  // listShipping: any;
  tieneDatos = false;
  sort: Array<SortDescriptor> = [];
  pageSize = 10;
  skip = 0;
  pageable = false;

  toDate: any;
  minDatetoDate: moment.Moment = moment().subtract(3, 'month');
  maxDatetoDate: moment.Moment = moment().add(0, 'days');

  // shipDestino = null;
  listShipDestino = [];
  // order = null;
  listOrder = [];
  p: any;
  listShipInv = [];
  listInqLote = [];

  // shipper: any;
  // carrier: any;
  // driver: any;
  // vehicle: any;
  // comment: any;
  imprimir = false;
  // parte = null;
  // toShip: any;
  toShipDestinoDescripcion: any;
  // uM: any;
  parSubLot = false;
  // lot: any;
  // subLot: any;
  strVacio = '';
  add = 'A';
  save = 'S';
  // listShipping = [];
  // qty = 0;
  advanceShipping = false;
  // seal: any;

  listRack = [];
  // rack = null;
  qtyRack: any;
  html: any;
  compValidator = false;
  qtyValidator = false;
  qtyRackValidator = false;


  slideConfig = {
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    focusOnSelect: true,
    centerMode: false,
    touchMove: true,
    speed: 300,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  print = new PrintModel();
  value: any;

  encabezado: FormGroup;
  detail: FormGroup;
  existeRegistro = false;

  constructor(
    private transactionService: TransactionService,
    private alert: ToastrService,
    private spinner: NgxSpinnerService,
    private utilService: UtilService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    public datepipe: DatePipe,
    private fb: FormBuilder
  ) {
    this.creaEncabezado();
    this.cargaDataEncabezado();
    this.creaDetail();
    this.cargaDataDetail();
  }

  ngOnInit() {
    this.getInicioFecha();
  }


  // valida encabezado
  get shipToNoValido() {
    return this.encabezado.get('shipTo').invalid && this.encabezado.get('shipTo').touched;
  }

  get shipperNoValido() {
    return this.encabezado.get('shipper').invalid && this.encabezado.get('shipper').touched;
  }

  get orderNoValido() {
    return this.encabezado.get('order').invalid && this.encabezado.get('order').touched;
  }

  get carrierNoValido() {
    return this.encabezado.get('carrier').invalid && this.encabezado.get('carrier').touched;
  }

  get driverNoValido() {
    return this.encabezado.get('driver').invalid && this.encabezado.get('driver').touched;
  }

  get truckNoValido() {
    return this.encabezado.get('truck').invalid && this.encabezado.get('truck').touched;
  }

  get listDetail() {
    return this.encabezado.get('detail') as FormArray;
  }

  // valida detalle
  get partNoValido() {
    return this.detail.get('Part').invalid && this.detail.get('Part').touched;
  }

  get qtyNoValido() {
    return this.detail.get('Qty').invalid && this.detail.get('Qty').touched;
  }

  get rackCodeNoValido() {
    return this.detail.get('rackCode').invalid && this.detail.get('rackCode').touched;
  }

  get rackQtyNoValido() {
    return this.detail.get('rackQty').invalid && this.detail.get('rackQty').touched;
  }

  get rackQty() {
    return this.detail.get('rackQty') as FormControl;
  }

  creaEncabezado() {
    this.encabezado = this.fb.group({
      shipTo: ['', [Validators.required]],
      shipper: ['', [Validators.required], this.getStatusShip.bind(this)],
      order: ['', [Validators.required]],
      carrier: ['', [Validators.required]],
      driver: ['', [Validators.required]],
      truck: ['', [Validators.required]],
      seal: ['', ''],
      comment: ['', ''],
      dominio: ['', ''],
      shipFrom: ['', ''],
      user: ['', ''],
      detail: this.fb.array([])
    });
  }

  cargaDataEncabezado() {
    const user = this.authService.getUser();
    this.encabezado.reset({
      shipTo: null,
      order: null,
      dominio: user.login_domain,
      shipFrom: user.login_vendor_code,
      user: user.login_userid
    });
  }

  getInicioFecha() {
    this.spinner.show();
    this.toDate = {
      startDate: moment().add(0, 'days'),
      endDate: moment().add(0, 'days'),
    };
    this.getCatShipDestino();
  }

  getCatShipDestino() {
    this.transactionService.getCatShipDestino('S').subscribe(response => {
      this.listShipDestino = response.response.ttDestino.shipTo;
      this.getCatOrder();
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  getCatOrder() {
    this.transactionService.getOrders().subscribe(response => {
      this.listOrder = response.callback;
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  getStatusShip(control: FormControl): Promise<ErroValidate> | Observable<ErroValidate> {
    if (!control.value) {
      return Promise.resolve(null);
    }
    return new Promise((resolve, relect) => {
      this.transactionService.getStatusShip(this.encabezado.value.shipTo, control.value).subscribe(response => {
        if (!this.utilService.validateEmptyData(response.response.pstatus)) {
          this.alert.warning(response.response.pstatus);
          resolve({ existe: true });
        } else {
          resolve(null);
        }
      }, err => {
        this.alert.error('Error. Favor de comunicarse con sistemas.');
      });
    });
  }

  advance() {
    if (this.encabezado.invalid) {
      return Object.values(this.encabezado.controls).forEach(control => {
        control.markAsTouched();
      });
    } else {
      this.detail.reset();
      this.advanceShipping = true;
      this.onChangeOrder();
    }
  }

  onChangeShipTo() {
    const parameter = this.encabezado.value.shipTo;
    const details = $.grep(this.listShipDestino, function (b) {
      return b.code === parameter;
    });
    this.toShipDestinoDescripcion = details[0].desc;
  }

  onChangeOrder() {
    this.listShipInv = [];
    this.spinner.show();
    this.transactionService.getNoPartesPorOrdenDeCompra(this.encabezado.value.order).subscribe(response => {
      this.listShipInv = response.oc;
      this.spinner.hide();
      this.getRack();
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  getRack() {
    this.listRack = [];
    this.transactionService.getRackOrder(this.encabezado.value.order).subscribe(response => {
      response.callback.forEach(item => {
        const parId = item.img.split('.', 1);
        item.id = parId[0];
        const parImg = `${this.constAssets.img.par}images/rack/${item.img}`;
        item.img = parImg;
        this.listRack.push(item);
      });
      this.spinner.hide();
      this.selectImg(null, this.listRack[0].id);
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  selectImg(slide: any, parRack?: any) {
    let rackItem: any;
    if (!this.utilService.validateEmptyData(slide)) {
      this.detail.patchValue({ rackCode: slide.id });
      rackItem = slide;
    } else {
      this.detail.patchValue({ rackCode: parRack });
      rackItem = this.getItemRack(parRack);
    }

    if (rackItem.rack === 'RK-NA') {
      this.rackQty.setValidators(null);
    } else {
      this.rackQty.setValidators([Validators.required, this.mayorCeroQtyRack.bind(this)]);
    }
    this.rackQty.updateValueAndValidity();

    this.html = '';
    const url = `${rackItem.img}`;
    const html = `<embed width="250" class="rounded float-center" height="200" src="${url}" />`;
    this.html = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getItemRack(rack?: any): any {
    const parameter = this.detail.value.rackCode;
    const details = $.grep(this.listRack, function (b) {
      return b.id === parameter;
    });
    return details[0];
  }

  mayorCeroQtyRack(control: FormControl): { [s: string]: boolean } {
    if (!control.value) {
      return null;
    }
    if (control.value > 0) {
      this.qtyRackValidator = false;
      return null;
    } else {
      this.qtyRackValidator = true;
      return { valor: true };
    }
  }

  creaDetail() {
    this.detail = this.fb.group({
      dominio: ['', ''],
      shipFrom: ['', ''],
      shipTo: ['', ''],
      shipper: ['', ''],
      Part: ['', [Validators.required]],
      Qty: ['', [Validators.required, this.mayorCeroQty.bind(this)]],
      rackCode: ['', [Validators.required]],
      rackQty: ['', ''],
      PartDesc: ['', ''],
      rackDesc: ['', ''],
      lot: ['', ''],
      compLot: ['', ''],
      comp: ['', ''],
      UM: ['', '']
    }, {
      validators: [this.listenerSubLot('comp')]
    });
  }

  onChangeRack() {
    this.selectImg(null, this.detail.value.rackCode);
  }

  listenerSubLot(par: string) {
    return (formGroup: FormGroup) => {
      const parameter = formGroup.controls[par];
      if (parameter.value < 100) {
        parameter.setErrors(null);
        this.compValidator = false;
      } else {
        this.compValidator = true;
        parameter.setErrors({ noEsMayor: true });
      }
    };
  }

  cargaDataDetail() {
    this.detail.reset({
      Part: null,
      rackCode: null
    });
  }

  mayorCeroQty(control: FormControl): { [s: string]: boolean } {
    if (!control.value) {
      return null;
    }
    if (control.value > 0) {
      this.qtyValidator = false;
      return null;
    } else {
      this.qtyValidator = true;
      return { valor: true };
    }
  }

  onlyNumber(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onChangeidParte() {
    this.existeRegistro = false;
    this.transactionService.getInqLote(this.detail.value.Part).subscribe(response => {
      this.spinner.hide();
      this.listInqLote = response.data;
      const objSelected = this.getItemPart();
      this.detail.patchValue({
        UM: `${objSelected.um.toUpperCase()}`,
        comp: '',
        lot: ''
      });
      this.parSubLot = !objSelected.editlot;
      if (objSelected.editlot) {
        this.detail.controls.comp.disable();
      } else {
        this.detail.controls.comp.enable();
      }
      if (!this.utilService.validateEmptyData(objSelected.dfltRack)) {
        this.detail.patchValue({ rackCode: objSelected.dfltRack[0].rack });
        this.selectImg(null, objSelected.dfltRack[0].rack);
      }
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  getItemPart(): any {
    const parameter = this.detail.value.Part;
    const details = $.grep(this.listShipInv, function (b) {
      return b.part === parameter;
    });
    return details[0];
  }



  onAdd() {
    this.spinner.show();
    if (this.detail.invalid) {
      this.spinner.hide();
      return Object.values(this.detail.controls).forEach(control => {
        control.markAsTouched();
      });
    } else {
      const user = this.authService.getUser();
      const itemPart = this.getItemPart();
      const itemRack = this.getItemRack();
      const lot = this.utilService.validateEmptyData(this.detail.value.compLot) === true ? `` : this.detail.value.compLot;
      // genera codigo de lote para poder validarlo en existeItem()
      this.detail.patchValue({
        lot: this.utilService.validateEmptyData(this.detail.value.comp) === true ? `${lot}` : `${lot}-${this.detail.value.comp}`
      });

      if (!this.existeItem()) {
        // de ser existeItem setea el resto de valores
        this.detail.patchValue({
          dominio: user.login_domain,
          shipFrom: user.login_vendor_code,
          shipTo: this.encabezado.value.shipTo,
          shipper: this.encabezado.value.shipper,
          PartDesc: itemPart.description,
          rackDesc: itemRack.description,
          rackCode: itemRack.rack === 'default' ? 'RK-NA' : itemRack.rack,
          rackQty: itemRack.rack === 'RK-NA' ? 0 : this.detail.value.rackQty,
          lot: this.utilService.validateEmptyData(this.detail.value.comp) === true ? `${lot}` : `${lot}-${this.detail.value.comp}`,
          compLot: this.utilService.validateEmptyData(this.detail.value.compLot) === true ? `` : this.detail.value.compLot,
          comp: this.utilService.validateEmptyData(this.detail.value.comp) === true ? `` : this.detail.value.comp
        });

        this.listDetail.push(this.fb.control(this.detail.value));
        // this.listShipping.push(this.detail.value);
        this.tieneDatos = true;
        this.pageable = this.listDetail.value.length > 9 ? true : false;
        this.detail.reset();
        this.loadData();
      }
      this.spinner.hide();
    }
  }



  existeItem(): boolean {
    this.existeRegistro = false;
    let bln = false;
    if (this.listDetail.value.length > 0) {
      this.listDetail.value.forEach(element => {
        if (element.Part === this.detail.value.Part && element.lot === this.detail.value.lot) {
          this.existeRegistro = true;
          bln = true;
        }
      });
    }
    return bln;
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
    this.view = process(this.listDetail.value, { skip: this.skip, take: this.pageSize, sort: this.sort });
  }

  onMinus(i: any) {
    setTimeout(() => {
      this.listDetail.removeAt(i);
      this.loadData();
      if (this.listDetail.length <= 0) {
        this.tieneDatos = false;
      }
    }, 200);
  }

  onSave() {

    this.print = new PrintModel();
    const user = this.authService.getUser();
    this.value = `${user.login_domain}|${user.login_vendor_code}|${this.encabezado.value.shipTo}|${this.encabezado.value.shipper}`;

    const listRackGlobal = [];
    listRackGlobal.push({ code: this.listDetail.value[0].rackCode, qty: 0, desc: this.listDetail.value[0].rackDesc });


    this.listDetail.value.forEach(element => {

      const parameter = element.rackCode;
      const details = $.grep(listRackGlobal, function (b) {
        return b.code === parameter;
      });

      if (this.utilService.validateEmptyData(details[0])) {
        listRackGlobal.push({ code: element.rackCode, qty: Number(element.rackQty), desc: element.rackDesc });
      } else {
        listRackGlobal.forEach(elementRack => {
          if (element.rackCode === details[0].code) {
            details[0].qty = Number(details[0].qty) + Number(element.rackQty);
          }
        });
      }
    });

    this.print = {
      Date: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
      ShipFrom: user.login_vendor_name,
      ShipToDes: this.toShipDestinoDescripcion,
      ShipTo: this.encabezado.value.shipTo,
      Shipper: this.encabezado.value.shipper,
      Carrier: this.encabezado.value.carrier,
      Driver: this.encabezado.value.driver,
      Truck: this.encabezado.value.truck,
      Comment: this.encabezado.value.comment,
      QR: this.value,
      ListShipping: this.listDetail.value,
      ListRack: listRackGlobal,
      Encabezado: false,
      Order: this.encabezado.value.order,
      Seal: this.encabezado.value.seal
    };

    $('#modal-print').modal('show');

  }

  return() {
    this.listDetail.controls = [];
    this.tieneDatos = false;
    this.advanceShipping = false;
  }

  confirmar() {
    this.spinner.show();
    const data = {
      data: [
        this.encabezado.value
      ]
    };

    this.transactionService.postShip3(data).subscribe(response => {
      this.spinner.hide();
      if (response.response.pSuccess === 'true') {
        this.tieneDatos = false;
        this.listDetail.controls = [];
        this.encabezado.reset();
        this.cargaDataEncabezado();
        this.advanceShipping = false;
        this.alert.success(response.response.pStatus);
        this.imprimir = true;
      } else {
        this.alert.warning(response.response.pStatus);
      }
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });

  }

  imprimirRemision() {
    const user = this.authService.getUser();
    this.imprimir = false;
    const url = window.location.href.split('#');
    // tslint:disable-next-line:max-line-length
    window.open(url[0] + `#/impresion/${user.login_domain}/${user.login_vendor_code}/${this.print.ShipTo}/${this.print.Shipper} `,
      '_blank');

    $('#modal-print').modal('hide');
  }

  close() {
    this.imprimir = false;
  }
}
