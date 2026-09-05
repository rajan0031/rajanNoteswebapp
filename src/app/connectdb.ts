import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Connectdb {
  constructor() {
    // MongoDB is accessed only by the Netlify serverless function.
  }

  getMongoUrl(): string {
    return '/.netlify/functions/visits';
  }
}
