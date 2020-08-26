import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable()
export class OnLineGuard implements CanActivate {

    constructor(private loginService: AuthService, private router: Router) { }

    canActivate() {
        /*Guardian para validar cuando el usuario intenta acceder al login pero esta logeado
          enviarlo siempre al dashboard */
        const value = this.loginService.loggedIn();
        if (value) {
            this.router.navigate(['/home']);
            return false;
        } else {
            return true;
        }
    }

}
