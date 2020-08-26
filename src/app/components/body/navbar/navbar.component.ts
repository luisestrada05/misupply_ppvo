import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserModel } from 'src/app/models/user.model';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { parametroConst } from 'src/app/const.parametro';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: []
})
export class NavbarComponent implements OnInit {
  constAssets = parametroConst;
  user = new UserModel();
  menu2 = [];
  menu1: any;
  ruta: any;

  constructor(
      private authService: AuthService,
      private router: Router,
      private authSerive: AuthService
  ) { }

  ngOnInit() {
      this.user = this.authService.getUser();
  }

  logOut() {
    this.authService.logOut();
    this.router.navigateByUrl('/login');
  }

  routing(e: any) {
    const url = e.url.split('#');
    this.ruta = e.text;
    this.authSerive.actualizaRuta(e.text);
    this.router.navigateByUrl(`home${url[1]}`);
  }
}
