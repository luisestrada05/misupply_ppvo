import { Component, OnInit, Input } from '@angular/core';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UtilService } from 'src/app/services/util.service';
import { parametroConst } from 'src/app/const.parametro';
import { NgxSpinnerService } from 'ngx-spinner';

declare var $;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  constAssets = parametroConst;
  ruta: any;
  user = new UserModel();
  rutaActual: any;
  userId = null;
  listVendors = [];
  userModel = new UserModel();
  vendor = false;

  constructor(
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {
  }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.ruta = this.authService.getRuta();
    this.listVendors = this.user.vendors;
    this.listVendors.length > 1 ? this.vendor = true : this.vendor = false;

  }

  onChangeuserId() {
    this.spinner.show();
    setTimeout(() => {
      const parametroID = this.userId;
      const details = $.grep(this.listVendors, function (b) {
        return b.vendor_name === parametroID;
      });
      // tslint:disable-next-line:max-line-length
      this.authService.actualizaUser(details[0].vendor_domain, details[0].vendor_userid, details[0].vendor_code, details[0].vendor_name, this.user.vendors, this.user.userMenu);
      location.reload();
    }, 300);
  }
}
