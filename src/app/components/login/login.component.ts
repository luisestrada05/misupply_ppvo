import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { parametroConst } from 'src/app/const.parametro';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Dominio } from 'src/app/models/dominio';

declare var $;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constAssets = parametroConst;
  listaDominios: Dominio[];
  formulario: FormGroup;

  constructor(
    private utilService: UtilService,
    private authService: AuthService,
    private alert: ToastrService,
    private commonService: CommonService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder
  ) {
    this.getDomain();
    this.creaFormulario();
    this.cargaDataFormulario();
  }

  ngOnInit() {

  }

  get dominioNoValido() {
    return this.formulario.get('domain').invalid && this.formulario.get('domain').touched;
  }

  get userNoValido() {
    return this.formulario.get('userId').invalid && this.formulario.get('userId').touched;
  }

  get passNoValido() {
    return this.formulario.get('password').invalid && this.formulario.get('password').touched;
  }


  creaFormulario() {
    this.formulario = this.fb.group({ 
      domain: ['', [Validators.required]],
      userId: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  cargaDataFormulario() {
    this.formulario.reset({
      domain: null,
      userId: '',
      password: ''
    });
  }

  getDomain() {
    const listDominios = [];
    this.commonService.getDomain().subscribe(dominios => {
      dominios.callback.forEach(dominio => {
        const objDominio = {
          id: dominio.ProductID,
          descripcion: dominio.ProductName
        };
        listDominios.push(objDominio);
      });
      this.listaDominios = listDominios;
    }, err => {
      this.alert.error('Error. Favor de comunicarse con sistemas.');
    });
  }

  logIn() {
    if (this.formulario.invalid) {
      return Object.values(this.formulario.controls).forEach(control => {
        control.markAsTouched();
      });
    } else {
      // console.log(this.formulario);
      this.spinner.show();
      this.authService.logIn(this.formulario.value).subscribe(resp => {
        this.spinner.hide();
        if (resp.response.dsLogin.callback[0].login_status === 'OK') {
          this.authService.userMenu(this.formulario.value).subscribe(response => {
            this.spinner.hide();
            if (!this.utilService.validateEmptyData(response.callback[0].items[0].url)) {
              const url = response.callback[0].items[0].url.split('#');
              this.router.navigateByUrl(`home${url[1]}`);
            } else {
              this.router.navigateByUrl('home');
            }
          }, err => {
            this.spinner.hide();
            this.alert.error('Error. Favor de comunicarse con sistemas.');
          });
        } else if (resp.response.dsLogin.callback[0].login_status === 'ERROR') {
          this.alert.error(resp.response.dsLogin.callback[0].login_message);
        } else {
          this.alert.warning('Error. Favor de comunicarse con sistemas.');
        }
      }, err => {
        this.spinner.hide();
        this.alert.error('Error. Favor de comunicarse con sistemas.');
      });
    }


  }
}
