import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { UtilService } from 'src/app/services/util.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { parametroConst } from 'src/app/const.parametro';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styles: []
})
export class NewUserComponent implements OnInit {
  constAssets = parametroConst;
  listDomain = [];
  listSupplier = [];
  user: FormGroup;

  constructor(
    private commonService: CommonService,
    private alert: ToastrService,
    private utilService: UtilService,
    private userSerivce: UserService,
    private router: Router,
    private fb: FormBuilder,
    private spiiner: NgxSpinnerService
  ) {
    this.creaUser();
  }

  ngOnInit() {
    this.getDomain();
  }

  getDomain() {
    this.commonService.getDomain().subscribe(response => {
      this.listDomain = response.callback;
    }, err => {
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  changeDomain() {
    this.spiiner.show();
    this.commonService.getSupplier(this.user.value.domain).subscribe(response => {
      this.listSupplier = response.callback;
      this.spiiner.hide();
    }, err => {
      this.spiiner.hide();
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  get firstNameNoValido() {
    return this.user.get('firstName').invalid && this.user.get('firstName').touched;
  }

  get lastNameNoValido() {
    return this.user.get('lastName').invalid && this.user.get('lastName').touched;
  }

  get domainNoValido() {
    return this.user.get('domain').invalid && this.user.get('domain').touched;
  }

  get supplierNoValido() {
    return this.user.get('supplier').invalid && this.user.get('supplier').touched;
  }

  get emailNoValido() {
    return this.user.get('email').invalid && this.user.get('email').touched;
  }

  creaUser() {
    this.user = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      domain: ['', Validators.required],
      supplier: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]]
    });
    this.iniciaUsuario();
  }

  iniciaUsuario() {
    this.user.reset({
      domain: null,
      supplier: null
    });
  }

  newUser() {
    if (this.user.invalid) {
      return Object.values(this.user.controls).forEach(control => {
        control.markAsTouched();
      });
    } else {
      const v = this.user.value;
      this.userSerivce.newUser(v.domain, v.supplier, v.firstName, v.lastName, v.email).subscribe(response => {
        this.alert.success(response.response.pStatus);
        this.router.navigateByUrl('/login');
      }, err => {
        this.alert.error('Error. Favor de comunicarse con sistemas.');
      });
    }
  }
}
