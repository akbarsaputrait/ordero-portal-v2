import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffStock } from '@app/collections/staff/stock.collection';
import { StaffAuthService } from '@app/core/services/staff/auth.service';
import { IActionGroup } from '@app/core/states/breadcrumb/breadcrumb.actions';
import { MetalQueryRowAction } from '@mtl/components/metal-query/metal-query.component';

@Component({
  selector: 'aka-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class StockListComponent implements OnInit {
  public actionGroup: IActionGroup = [
    [
      {
        icon: 'plusIcon',
        text: 'Create Stock',
        color: 'primary',
        click: () => {
          this.router.navigate(['./create'], { relativeTo: this.active });
        },
      },
    ],
  ];

  public rowActions: MetalQueryRowAction<StaffStock>[] = [
    {
      icon: 'roundEdit',
      text: 'Edit',
      action: (data) => {
        return () => {};
      },
    },
  ];

  constructor(public auth: StaffAuthService, private router: Router, private active: ActivatedRoute) {}

  ngOnInit() {}
}
