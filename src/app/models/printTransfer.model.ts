export class PrintTransferModel {
    Date: string;
    nameVendor: string;
    nameShipto: string;
    ShipTo: string;
    transferId: string;
    Reference: string;
    Carrier: string;
    Driver: string;
    Truck: string;
    Comment: string;
    QR: string;
    ListShipping: any[];
    Type: string;
    Seal: string;
    Encabezado: boolean;

    constructor() {
        this.Date = null;
        this.nameVendor = null;
        this.nameShipto = null;
        this.ShipTo = null;
        this.transferId = null;
        this.Carrier = null;
        this.Driver = null;
        this.Truck = null;
        this.Comment = null;
        this.QR = null;
        this.Reference =  null;
        this.ListShipping = [];
        this.Type = null;
        this.Seal = null;
        this.Encabezado = false;
    }
}
