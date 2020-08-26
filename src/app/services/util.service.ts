import { Injectable, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
declare var $: any;

@Injectable({
    providedIn: 'root'
})
export class UtilService {
    ruta: any;

    setRuta(e: any) {
        this.ruta = e;
    }

    getRuta() {
        return this.ruta;
    }

    // Show error the required inputs
    requiredFiel(id, time) {
        $('#' + id).fadeIn('slow');

        // tslint:disable-next-line:only-arrow-functions
        setTimeout(() => {
            $('#' + id).fadeOut('slow');
        }, time);
    }

    // Validate data
    validateEmptyData(data: any) {
        let validate = false;
        if (data === undefined || data === null || data === '') {
            validate = true;
        }
        return validate;
    }

    // Get days of moth
    getDays(max: number) {
        const days = [];

        for (let i = 1; i <= max; i++) {
            const dayFormat = {
                key: i > 9 ? i : '0' + i,
                description: i
            };
            days.push(dayFormat);
        }
        return days;
    }

    // Get years
    getYears() {
        const year = new Date().getFullYear();
        const years = [];

        for (let i = year; i >= 1900; i--) {
            years.push(i);
        }
        return years;
    }

    // Get list number
    // Get days of moth
    getListNumber(numStart: number, numEnd: number, limitDate: boolean, scale: number) {
        const days = [];

        for (let i = numStart; i <= numEnd; i += scale) {
            days.push(i);
        }
        return days;
    }

    // Get years
    getYearsId() {
        const year = new Date().getFullYear();
        const years = [];

        for (let i = year; i <= 2100; i++) {
            years.push(i);
        }
        return years;
    }

    // Add external scripts in angular
    addScriptsExternal(val: any) {
        if (document.getElementById(val.id) != null) {
            document.getElementById(val.id).remove();
        }

        const node = document.createElement('script');
        node.src = val.url;
        node.type = 'text/javascript';
        node.async = false;
        node.id = val.id;
        document.getElementsByTagName('head')[0].appendChild(node);
    }

    validateEmail(email) {
        // tslint:disable-next-line:max-line-length
        const emailRegex = /^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i;
        if (!emailRegex.test(email)) {
            return false;
        }

        return true;
    }

    validateLength(data, size) {
        if (data.length === size) {
            return true;
        } else {
            return false;
        }
    }

}
