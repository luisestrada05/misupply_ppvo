import { Component, OnInit, Input } from '@angular/core';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import { UtilService } from 'src/app/services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { InquireService } from 'src/app/services/inquire.service';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { GroupDescriptor, DataResult, process } from '@progress/kendo-data-query';

declare var $;

@Component({
  selector: 'app-details-shipping',
  templateUrl: './shipping-details.component.html',
  styles: []
})
export class DetailsShippingComponent implements OnInit {
  @Input() public objDetail: any;
  gridView: DataResult;
  listShippingDetail: any;

  constructor(
    private spinner: NgxSpinnerService,
    private inquireService: InquireService
  ) {  }

  ngOnInit() {
    this.listShippingDetail = this.inquireService.getListShippingDetail();
    this.getListShippingDetail();
  }

  loadItems(): void {
    this.gridView = process(this.listShippingDetail, { });
    this.spinner.hide();
  }

  getListShippingDetail() {
    this.spinner.show();
    const parametroShipper = this.objDetail.Shipper;
    const details = $.grep(this.listShippingDetail, function(b) {
      return b.Shipper === parametroShipper;
    });
    this.listShippingDetail = details;
    this.loadItems();
  }
}
