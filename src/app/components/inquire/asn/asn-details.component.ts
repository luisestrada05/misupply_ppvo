import { Component, OnInit, Input } from '@angular/core';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import { UtilService } from 'src/app/services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { InquireService } from 'src/app/services/inquire.service';
import { DataResult, process } from '@progress/kendo-data-query';

declare var $;

@Component({
  selector: 'app-details-asn',
  templateUrl: './asn-details.component.html',
  styles: []
})
export class DetailsAsnComponent implements OnInit {
  @Input() public objDetail: any;
  gridView: DataResult;
  listASNDetail: any;

  constructor(
    private spinner: NgxSpinnerService,
    private inquireService: InquireService
  ) {  }

  ngOnInit() {
    this.listASNDetail = this.inquireService.getListASNDetail();
    this.getListASNDetail();
  }

  loadItems(): void {
    this.gridView = process(this.listASNDetail, { });
    this.spinner.hide();
  }

  getListASNDetail() {
    this.spinner.show();
    const parametroShipperId = this.objDetail.ShipperId;
    const details = $.grep(this.listASNDetail, function(b) {
      return b.ShipperId === parametroShipperId;
    });
    this.listASNDetail = details;
    this.loadItems();
  }

}
