import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { App } from './app';
import { LearningPage } from './learning-page/learning-page';

@NgModule({
  declarations: [
    App
  ],

  imports: [
    BrowserModule,
    FormsModule,
    LearningPage
  ],

  providers: [],

  bootstrap: [
    App
  ]
})
export class AppModule {}
