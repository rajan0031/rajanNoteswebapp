import { Injectable } from '@angular/core';

export interface Note {
  id?: number;
  question: string;
  answer: string;
  title?: string;
  description?: string;
  level: string;
  dataType: string;
  category: string;
  tags: string[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  private dbName = 'LearningNotesDB';
  private storeName = 'notes';
  private dbVersion = 1;

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });

          store.createIndex('title', 'title', { unique: false });
          store.createIndex('level', 'level', { unique: false });
          store.createIndex('category', 'category', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async addNote(note: Note): Promise<number> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {

      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.add(note);

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getNotes(): Promise<Note[]> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {

      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);

      const request = store.getAll();

      request.onsuccess = () => {
        const notes = (request.result as Note[]).map(note =>
          this.normalizeNote(note)
        );

        notes.sort((a, b) => {
          return new Date(b.createdAt).getTime() -
                 new Date(a.createdAt).getTime();
        });

        resolve(notes);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private normalizeNote(note: Note): Note {
    return {
      ...note,
      question: note.question ?? note.title ?? '',
      answer: note.answer ?? note.description ?? '',
      tags: note.tags ?? []
    };
  }

  async updateNote(note: Note): Promise<void> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {

      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.put(note);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteNote(id: number): Promise<void> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {

      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}
