import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { App } from './app';
import { LearningPage } from './learning-page/learning-page';

@NgModule({
  declarations: [
    App
  ],

  imports: [
    BrowserModule,
    LearningPage
  ],

  providers: [],

  bootstrap: [
    App
  ]
})
export class AppModule {}
