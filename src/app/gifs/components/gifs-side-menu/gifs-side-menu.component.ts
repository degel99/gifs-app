import { Component } from '@angular/core';
import { SideMenuHeaderComponent } from './gifs-side-menu-header/gifs-side-menu-header.component';
import { SideMenuOptionsComponent } from './gifs-side-menu-options/gifs-side-menu-options.component';

@Component({
  selector: 'gifs-side-menu',
  imports:
    [
      SideMenuHeaderComponent,
      SideMenuOptionsComponent,
    ],
  templateUrl: './gifs-side-menu.component.html'
})
export class SideMenuComponent { }
