import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable()
export class SingOutGuard implements CanActivate {

    constructor(private loginService: AuthService, private router: Router) { }

    canActivate() {
        /*Guardian para validar que el usuario este logeado para dejarlo acceder a la ulr que elija
          en caso que no este logeado siempre enviarlo el inicio (login)*/
        const value = this.loginService.loggedIn();
        if (value) {
            return true;
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }

}
