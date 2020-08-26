import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'miSupply';

  constructor(
    private ref: ChangeDetectorRef
  ) {
    ref.detach();
    setInterval(() => { this.ref.detectChanges(); }, 100);
  }

}
