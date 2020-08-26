import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { BodyComponent } from './components/body/body.component';
import { NewUserComponent } from './components/new-user/new-user.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FooterComponent } from './components/body/footer/footer.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NavbarComponent } from './components/body/navbar/navbar.component';
import { SingOutGuard } from './guards/sign-out.guard';
import { OnLineGuard } from './guards/on-line.guard';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { TrackingComponent } from './components/releases/tracking/tracking.component';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { InquiryComponent } from './components/releases/inquiry/inquiry.component';
import { AsnComponent } from './components/inquire/asn/asn.component';
import { TooltipModule } from 'ng2-tooltip-directive';
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
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { DetailsShippingComponent } from './components/inquire/shipping/shipping-details.component';
import { DetailsReceivingComponent } from './components/inquire/receiving/receiving-details.component';
import { DetailsAsnComponent } from './components/inquire/asn/asn-details.component';
import { HeaderComponent } from './components/header/header.component';
import { DetailsInventoryComponent } from './components/inquire/inventory/inventory-details.component';
import { NgxImageDisplayModule } from '@creativeacer/ngx-image-display';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import {NgxPrintModule} from 'ngx-print';
import { DatePipe } from '@angular/common';
import { ShippingPrintComponent } from './components/print/shipping-print/shipping-print.component';
import { TransferPrintComponent } from './components/print/transfer-print/transfer-print.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { TransferComponent } from './components/transaction/transfer/transfer.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BodyComponent,
    NavbarComponent,
    NewUserComponent,
    ForgotPasswordComponent,
    FooterComponent,
    TrackingComponent,
    InquiryComponent,
    AsnComponent,
    TransactionComponent,
    ReceivingComponent,
    ShippingComponent,
    UpdatePasswordComponent,
    SendAsnComponent,
    ReportProductionComponent,
    CycleCountComponent,
    ShippingTransactionComponent,
    ReceivingTransactionComponent,
    InventoryComponent,
    DetailsShippingComponent,
    DetailsReceivingComponent,
    DetailsAsnComponent,
    DetailsInventoryComponent,
    HeaderComponent,
    ShippingPrintComponent,
    TransferPrintComponent,
    TransferComponent
  ],
  imports: [
    DropDownsModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    FilterPipeModule,
    TooltipModule,
    GridModule,
    NgxPrintModule,
    ExcelModule,
    SlickCarouselModule,
    NgxQRCodeModule,
    ReactiveFormsModule,
    NgxImageDisplayModule.forRoot(),
    NgxDaterangepickerMd.forRoot(),
    ToastrModule.forRoot({
      timeOut: 4000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true
    }),
  ],
  providers: [
    SingOutGuard,
    OnLineGuard,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
