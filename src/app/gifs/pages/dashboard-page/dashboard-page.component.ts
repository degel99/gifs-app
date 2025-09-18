import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from '../../components/gifs-side-menu/gifs-side-menu.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    SideMenuComponent,
    RouterOutlet
  ],
  templateUrl: './dashboard-page.component.html'
})
export default class DashboardPageComponent { }
