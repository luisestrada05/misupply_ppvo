import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { NewUserComponent } from './components/new-user/new-user.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { BodyComponent } from './components/body/body.component';
import { SingOutGuard } from './guards/sign-out.guard';
import { OnLineGuard } from './guards/on-line.guard';
import { TrackingComponent } from './components/releases/tracking/tracking.component';
import { InquiryComponent } from './components/releases/inquiry/inquiry.component';
import { AsnComponent } from './components/inquire/asn/asn.component';
import { TransactionComponent } from './components/inquire/transaction/transaction.component';
import { ReceivingComponent } from './components/inquire/receiving/receiving.component';
import { ShippingComponent } from './components/inquire/shipping/shipping.component';
import { UpdatePasswordComponent } from './components/account/update-password/update-password.component';
import { SendAsnComponent } from './components/ASN/send-asn/send-asn.component';
import { ReportProductionComponent } from './components/transaction/report-production/report-production.component';
import { CycleCountComponent } from './components/transaction/cycle-count/cycle-count.component';
import { ShippingTransactionComponent } from './components/transaction/shipping-transaction/shipping-transaction.component';
import { ReceivingTransactionComponent } from './components/transaction/receiving-transaction/receiving-transaction.component';
import { InventoryComponent } from './components/inquire/inventory/inventory.component';
import { ShippingPrintComponent } from './components/print/shipping-print/shipping-print.component';
import { TransferPrintComponent } from './components/print/transfer-print/transfer-print.component';
import { TransferComponent } from './components/transaction/transfer/transfer.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [OnLineGuard] },
    { path: 'newAccount', component: NewUserComponent },
    { path: 'forgottenPass', component: ForgotPasswordComponent },
    { path: 'impresion/:domain/:vendor/:shipTo/:shipper', component: ShippingPrintComponent, canActivate: [SingOutGuard] },
    { path: 'impresiontransfer/:domain/:vendor/:reference', component: TransferPrintComponent, canActivate: [SingOutGuard] },
    {
        path: 'home', component: BodyComponent, canActivate: [SingOutGuard],
        children: [
            // release
            { path: 'componentes/releases', component: InquiryComponent },
            { path: 'componentes/tracking', component: TrackingComponent },
            // transaction
            { path: 'componentes/transactions/receiving', component: ReceivingTransactionComponent },
            { path: 'componentes/transactions/report-production', component: ReportProductionComponent },
            { path: 'componentes/transactions/shipping', component: ShippingTransactionComponent },
            { path: 'componentes/transactions/cycle', component: CycleCountComponent },
            { path: 'componentes/transactions/transfer', component: TransferComponent },
            // ASN
            { path: 'componentes/asn', component: SendAsnComponent },
            // inquire
            { path: 'componentes/inquire/inq-asn', component: AsnComponent },
            { path: 'componentes/inquire/inq-transactions', component: TransactionComponent},
            { path: 'componentes/inquire/inq-receiving', component: ReceivingComponent},
            { path: 'componentes/inquire/inq-shipping', component: ShippingComponent},
            { path: 'componentes/inquire/inq-inventory', component: InventoryComponent},
            // account
            { path: 'componentes/setpas/setpas', component: UpdatePasswordComponent}
        ]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login', pathMatch: 'full' }
];


@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
