import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UtilService } from 'src/app/services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { parametroConst } from 'src/app/const.parametro';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styles: []
})
export class UpdatePasswordComponent implements OnInit {
  constAssets = parametroConst;
  user: any;
  ruta: any;
  formulario: FormGroup;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private spinner: NgxSpinnerService,
    private alert: ToastrService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.ruta = this.authService.getRuta();
    this.creaFormulario();
  }

  get pass1NoValido() {
    return this.formulario.get('pass1').invalid && this.formulario.get('pass1').touched;
  }

  get pass2NoValido() {
    const pass1 = this.formulario.get('pass1').value;
    const pass2 = this.formulario.get('pass2').value;
    return (pass1 === pass2) ? false : true;
  }

  creaFormulario() {
    this.formulario = this.fb.group({
      pass1: ['', Validators.required],
      pass2: ['', Validators.required]
    }, {
      validators: this.authService.password('pass1', 'pass2')
    });
  }


  onReset() {
    if (this.formulario.invalid) {
      return Object.values(this.formulario.controls).forEach(control => {
        control.markAsTouched();
      });
    } else {
      this.spinner.show();
      this.authService.updatePasword(btoa(this.formulario.value.pass1)).subscribe(response => {
        this.spinner.hide();
        this.alert.success(response.response.pStatus);
        this.formulario.reset();
      }, err => {
        this.spinner.hide();
        this.alert.error('Error. Favor de comunicarse con sistemas.');
      });
    }
  }
}
