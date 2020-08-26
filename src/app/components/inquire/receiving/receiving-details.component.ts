import { Component, OnInit, Input } from '@angular/core';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import { UtilService } from 'src/app/services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { InquireService } from 'src/app/services/inquire.service';
import { GroupDescriptor, DataResult, process } from '@progress/kendo-data-query';

declare var $;

@Component({
  selector: 'app-details-receiving',
  templateUrl: './receiving-details.component.html',
  styles: []
})
export class DetailsReceivingComponent implements OnInit {
  @Input() public objDetail: any;
  gridView: DataResult;
  listRecivingDetail: any;

  constructor(
    private spinner: NgxSpinnerService,
    private inquireService: InquireService
  ) {  }

  ngOnInit() {
    // console.log(this.objDetail);
    this.listRecivingDetail = this.inquireService.getListRecivingDetail();
    this.getListRecivingDetail();
  }

  loadItems(): void {
    this.gridView = process(this.listRecivingDetail, { });
    this.spinner.hide();
  }

  getListRecivingDetail() {
    this.spinner.show();
    const parametroShipper = this.objDetail.shipper;
    const details = $.grep(this.listRecivingDetail, function(b) {
      return b.shipper === parametroShipper;
    });
    this.listRecivingDetail = details;
    this.loadItems();
  }

}
