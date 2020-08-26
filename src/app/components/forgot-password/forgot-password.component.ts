import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { UtilService } from 'src/app/services/util.service';
import { UserService } from 'src/app/services/user.service';
import { parametroConst } from 'src/app/const.parametro';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styles: []
})
export class ForgotPasswordComponent implements OnInit {
  constAssets = parametroConst;
  listDomain = [];
  formulario: FormGroup;

  constructor(
    private commonService: CommonService,
    private alert: ToastrService,
    private utilService: UtilService,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.getDomain();
    this.creaResetPassword();
  }

  getDomain() {
    this.commonService.getDomain().subscribe(response => {
      this.listDomain = response.callback;
    }, err => {
      this.alert.error('Ocurrio un error');
    });
  }

  get emailNoValido() {
    return this.formulario.get('email').invalid && this.formulario.get('email').touched;
  }

  get userNoValido() {
    return this.formulario.get('user').invalid && this.formulario.get('user').touched;
  }

  get domainNoValido() {
    return this.formulario.get('domain').invalid && this.formulario.get('domain').touched;
  }

  creaResetPassword() {
    this.formulario = this.fb.group({
      email:  ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      user: ['', Validators.required],
      domain: ['', Validators.required]
    });
    this.iniciaFormulario();
  }

  iniciaFormulario() {
    this.formulario.reset({
      domain: null
    });
  }

  resetIn() {
    if (this.formulario.invalid) {
      return Object.values(this.formulario.controls).forEach(control => {
        control.markAsTouched();
      });
    } else {
      const v = this.formulario.value;
      this.userService.forgottenPass(v.domain, v.user, v.email).subscribe(response => {
        this.alert.success(response.response.pStatus);
        this.router.navigateByUrl('/login');
      }, err => {
        if (this.utilService.validateEmptyData(err.error.text)) {
          this.alert.error('Ocurrio un error');
        } else {
          this.alert.error(err.error.text);
        }
      });
    }
  }
}
