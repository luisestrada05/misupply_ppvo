import { Component, OnInit } from '@angular/core';
import { TransactionService } from 'src/app/services/transaction.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilService } from 'src/app/services/util.service';
import { AuthService } from 'src/app/services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { PrintTransferModel } from 'src/app/models/printTransfer.model';
import { PageChangeEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { DataResult, SortDescriptor, process } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';


declare var $;
interface ErroValidate {
  [s: string]: boolean;
}

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html'
})
export class TransferComponent implements OnInit {
  view: DataResult;
  // listShipping: any;
  tieneDatos = false;
  sort: Array<SortDescriptor> = [];
  pageSize = 10;
  skip = 0;
  pageable = false;
  // wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  // fileName = 'SheetJS.xlsx';
  // print = new PrintModel();
  // arrayBuffer: any;
  // file: File;
  // data: AOA = [];
  encabezado: FormGroup;
  listShipDestino = [];
  listParts = [];
  listShipping = [];
  detalle: FormGroup;
  advanceShipping = false;
  existeRegistro = false;
  listType = [
    {
      description: 'RACK',
      id: 'RACK'
    },
    {
      description: 'RAW MATERIAL',
      id: 'RAW'
    },
    {
      description: 'finished piece',
      id: 'FG'
    },
  ];

  idTransfer: any;
  print = new PrintTransferModel();
  value: any;
  nameShipto: any;
  imprimir = false;
  compValidator = false;

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
    this.creaDetalle();
    this.cargaDataDetalle();
  }

  ngOnInit() {
    this.getCatShipDestino();
  }


  // valida encabezado
  get shipToNoValido() {
    return this.encabezado.get('shipTo').invalid && this.encabezado.get('shipTo').touched;
  }

  get referenceNoValido() {
    return this.encabezado.get('reference').invalid && this.encabezado.get('reference').touched;
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

  get typeNoValido() {
    return this.encabezado.get('type').invalid && this.encabezado.get('type').touched;
  }

  get detail() {
    return this.encabezado.get('detail') as FormArray;
  }

  // detalle

  get partNoValido() {
    return this.detalle.get('Part').invalid && this.detalle.get('Part').touched;
  }

  get qtyNoValido() {
    return this.detalle.get('Qty').invalid && this.detalle.get('Qty').touched;
  }


  get lotNoValido() {
    return this.detalle.get('compLot').invalid && this.detalle.get('compLot').touched;
  }

  get lot() {
    return this.detalle.get('compLot') as FormControl;
  }

  get part() {
    return this.detalle.get('Part') as FormControl;
  }

  creaEncabezado() {
    this.encabezado = this.fb.group({
      shipTo: ['', [Validators.required]],
      reference: ['', [Validators.required], this.getStatusTransfer.bind(this)],
      carrier: ['', [Validators.required]],
      driver: ['', [Validators.required]],
      truck: ['', [Validators.required]],
      seal: ['', ''],
      comment: ['', ''],
      dominio: ['', ''],
      shipFrom: ['', ''],
      user: ['', ''],
      type: ['', [Validators.required]],
      detail: this.fb.array([])
    });
  }

  getCatShipDestino() {
    this.transactionService.getCatShipDestino('T').subscribe(response => {
      this.listShipDestino = response.response.ttDestino.shipTo;
      this.getCatPartes();
    }, err => {
      this.spinner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }


  getStatusTransfer(control: FormControl): Promise<ErroValidate> | Observable<ErroValidate> {
    if (!control.value) {
      return Promise.resolve(null);
    }
    return new Promise((resolve, relect) => {
      this.transactionService.getStatusTransfer(control.value).subscribe(response => {
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

  cargaDataEncabezado() {
    const user = this.authService.getUser();
    this.encabezado.reset({
      shipTo: null,
      dominio: user.login_domain,
      shipFrom: user.login_vendor_code,
      user: user.login_userid,
      type: null,
      detail: this.fb.array([])
    });
  }

  advance() {
    if (this.encabezado.invalid) {
      return Object.values(this.encabezado.controls).forEach(control => {
        control.markAsTouched();
      });
    } else {
      this.getCatPartes();
      this.advanceShipping = true;
      this.detail.reset();
    }
  }

  return() {
    this.detail.reset();
    this.tieneDatos = false;
    this.advanceShipping = false;
    this.detail.controls = [];
  }


  getCatPartes() {
    if (this.encabezado.value.type) {
      this.transactionService.obtieneNumerosParte(this.encabezado.value.type).subscribe(response => {
        this.listParts = response.parts;
      }, err => {
        this.spinner.hide();
        this.alert.error('Error. Favor de comunicarse con sistemas.');
      });
    }
  }

  creaDetalle() {
    this.detalle = this.fb.group({
      dominio: ['', ''],
      shipFrom: ['', ''],
      shipTo: ['', ''],
      reference: ['', ''],
      Part: ['', [Validators.required]],
      PartDesc: ['', ''],
      Qty: ['', [Validators.required, this.mayorCero.bind(this)]],
      UM: ['', ''],
      Lot: ['', ''],
      compLot: ['', ''],
      comp: ['', '']
    }, {
      validators: [this.listenerSubLot('comp')]
    });
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

  cargaDataDetalle() {
    const user = this.authService.getUser();
    this.detalle.reset({
      part: null
    });
  }

  add() {
    const user = this.authService.getUser();
    if (this.detalle.invalid) {
      return Object.values(this.detalle.controls).forEach(control => {
        control.markAsTouched();
      });
    } else {
      const lot = this.utilService.validateEmptyData(this.detalle.value.compLot) === true ? `` : this.detalle.value.compLot;
      this.detalle.patchValue({
        dominio: user.login_domain,
        shipFrom: user.login_vendor_code,
        shipTo: this.encabezado.value.shipTo,
        reference: this.encabezado.value.reference,
        Lot: this.utilService.validateEmptyData(this.detalle.value.comp) === true ? `${lot}` : `${lot}-${this.detalle.value.comp}`
      });

      if (!this.existeItem()) {
        this.detail.push(this.fb.group(this.detalle.value));
        this.tieneDatos = true;
        this.loadData();
        this.detalle.reset();
      }
      this.spinner.hide();
    }
  }


  existeItem(): boolean {
    this.existeRegistro = false;
    let bln = false;
    if (this.detail.value.length > 0) {
      this.detail.value.forEach(element => {
        if (element.Part === this.detalle.value.Part && element.Lot === this.detalle.value.Lot) {
          this.existeRegistro = true;
          bln = true;
        }
      }); 
    }
    return bln;
  }

  onChangeShipTo() {
    const parameter = this.encabezado.value.shipTo;
    const details = $.grep(this.listShipDestino, function (b) {
      return b.code === parameter;
    });
    // console.log(details[0].desc);
    this.nameShipto = details[0].desc;
  }

  onChangePart() {
    this.existeRegistro = false;
    const parameter = this.detalle.value.Part;
    const details = $.grep(this.listParts, function (b) {
      return b.part === parameter;
    });

    if (details[0].ctrl_lot) {
      this.lot.setValidators([Validators.required]);
    } else {
      this.lot.setValidators(null);
    }
    this.lot.updateValueAndValidity();

    this.detalle.patchValue({
      UM: details[0].um,
      PartDesc: details[0].description,
    });
  }

  mayorCero(control: FormControl): { [s: string]: boolean } {
    if (!control.value) {
      return null;
    }
    if (control.value > 0) {
      return null;
    } else {
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
    this.view = process(this.encabezado.value.detail, { skip: this.skip, take: this.pageSize, sort: this.sort });
  }

  onMinus(e: number) {
    this.detail.removeAt(e);
    this.loadData();
    if (this.detail.length <= 0) {
      this.tieneDatos = false;
    }
  }

  onSave() {
    this.print = new PrintTransferModel();
    const user = this.authService.getUser();
    this.value = `${user.login_domain}|${user.login_vendor_code}|${this.encabezado.value.reference}`;

    this.print = {
      Date: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
      nameVendor: user.login_vendor_name,
      nameShipto: this.nameShipto,
      ShipTo: this.encabezado.value.shipTo,
      transferId: null,
      Carrier: this.encabezado.value.carrier,
      Driver: this.encabezado.value.driver,
      Truck: this.encabezado.value.truck,
      Comment: this.encabezado.value.comment,
      Reference: this.encabezado.value.reference,
      QR: this.value,
      ListShipping: this.detail.value,
      Encabezado: false,
      Seal: this.encabezado.value.seal,
      Type: this.encabezado.value.type
    };

    $('#modal-print').modal('show');
  }

  confirmar() {
    this.spinner.show();
    const data = {
      data: [
        this.encabezado.value
      ]
    };

    this.transactionService.postTransfer(data).subscribe(response => {
      this.spinner.hide();
      if (response.response.pSuccess === 'true') {
        this.alert.success(response.response.pStatus);
        this.idTransfer = response.response.pTransferId;
        this.imprimir = true;
        this.detail.controls = [];
        this.advanceShipping = false;
        this.encabezado.reset();

        this.cargaDataEncabezado();
        this.tieneDatos = false;
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
    // this.router.navigateByUrl(`/impresion`);
    // window.print();
    // Converts the route into a string that can be used
    // with the window.open() function
    this.imprimir = false;
    const url = window.location.href.split('#');
    // tslint:disable-next-line:max-line-length
    window.open(url[0] + `#/impresiontransfer/${user.login_domain}/${user.login_vendor_code}/${this.idTransfer} `,
      '_blank');

    $('#modal-print').modal('hide');
  }


  // handleFileInput(evt) {
  //   this.data = [];
  //   const reader: FileReader = new FileReader();
  //   reader.onload = (e: any) => {
  //     /* read workbook */
  //     const bstr: string = e.target.result;
  //     const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

  //     /* grab first sheet */
  //     const wsname: string = wb.SheetNames[0];
  //     const ws: XLSX.WorkSheet = wb.Sheets[wsname];

  //     /* save data */
  //     const dataPre = (XLSX.utils.sheet_to_json(ws, { header: 1, raw: true })) as AOA;
  //     dataPre.forEach((element, i) => {
  //       if (i > 5) {
  //         this.data.push(element);
  //       }
  //     });

  //   };
  //   reader.readAsBinaryString(evt.target.files[0]);
  // }

  close() {
    this.imprimir = false;
  }
}
