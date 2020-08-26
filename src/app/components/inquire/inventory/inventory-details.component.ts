import { Component, OnInit, Input } from '@angular/core';
import { InquireService } from 'src/app/services/inquire.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataResult, process } from '@progress/kendo-data-query';

declare var $;

@Component({
    selector: 'app-details-inventory',
  templateUrl: './inventory-details.component.html',
  styles: []
})
export class DetailsInventoryComponent implements OnInit {
  @Input() public objDetail: any;
  gridView: DataResult;
  listInventoryDetail: any;

  constructor(
    private spinner: NgxSpinnerService,
    private inquireService: InquireService
  ) {  }

  ngOnInit() {
    this.listInventoryDetail = this.inquireService.getListInventoryDetail();
    this.getListInventoryDetail();
  }

  loadItems(): void {
    this.gridView = process(this.listInventoryDetail, { });
    this.spinner.hide();
  }

  getListInventoryDetail() {
    this.spinner.show();
    const parametroPartID = this.objDetail.PartID;
    const details = $.grep(this.listInventoryDetail, function(b) {
      return b.PartID === parametroPartID;
    });
    this.listInventoryDetail = details;
    this.loadItems();
  }
}
