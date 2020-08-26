export class UserModel {
    login_userid: string;
    login_domain: string;
    login_vendor_name: string;
    login_vendor_code: string;
    userMenu: [];
    ruta: string;
    vendors: [];

    constructor() {
        this.login_userid = null;
        this.login_domain = null;
        this.login_vendor_name = null;
        this.login_vendor_code = null;
        this.userMenu = [];
        this.ruta = null;
        this.vendors = [];
    }
}

