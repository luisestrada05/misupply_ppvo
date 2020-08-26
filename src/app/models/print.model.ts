export class PrintModel {
    Date: string;
    ShipFrom: string;
    ShipToDes: string;
    ShipTo: string;
    Shipper: string;
    Carrier: string;
    Driver: string;
    Truck: string;
    Comment: string;
    QR: string;
    ListShipping: any[];
    ListRack: any[];
    Encabezado: boolean;
    Order: string;
    Seal: string;

    constructor() {
        this.Date = null;
        this.ShipFrom = null;
        this.ShipToDes = null;
        this.ShipTo = null;
        this.Shipper = null;
        this.Carrier = null;
        this.Driver = null;
        this.Truck = null;
        this.Comment = null;
        this.QR = null;
        this.ListShipping = [];
        this.ListRack = [];
        this.Encabezado = false;
        this.Order = null;
        this.Seal = null;
    }
}
