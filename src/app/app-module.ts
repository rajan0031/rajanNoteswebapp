import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { App } from './app';
import { DsaDashboard } from './dsa-dashboard/dsa-dashboard';

@NgModule({
  declarations: [
    App
  ],

  imports: [
    BrowserModule,
    FormsModule,
    DsaDashboard
  ],

  providers: [],

  bootstrap: [
    App
  ]
})
export class AppModule {}
