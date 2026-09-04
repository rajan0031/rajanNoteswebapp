import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Connectdb {

  private mongoUrl =
    'mongodb+srv://raykushwaha0031:C1k4maJXzH2vAmh4@blog.zlf5agh.mongodb.net/Note';

  constructor() {
    console.log('MongoDB configuration loaded');
  }

  getMongoUrl(): string {
    return this.mongoUrl;
  }
}
