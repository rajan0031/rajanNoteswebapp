import { Injectable } from '@angular/core';

export interface Note {
  id?: number;
  seedId?: string;
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
  private visitStoreName = 'visits';
  private dbVersion = 2;

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

        if (!db.objectStoreNames.contains(this.visitStoreName)) {
          db.createObjectStore(this.visitStoreName, { keyPath: 'id' });
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

  async seedDsaQuestions(): Promise<void> {
    const existingNotes = await this.getNotes();
    const seededQuestions = new Set(
      existingNotes
        .filter(note => note.seedId?.startsWith('dsa-'))
        .map(note => note.seedId)
    );

    if (seededQuestions.size === 100) {
      return;
    }

    const topics = [
      ['Big O notation', 'Big O describes how an algorithm grows as input size increases. Common classes are O(1), O(log n), O(n), O(n log n), and O(n^2).'],
      ['arrays', 'An array stores elements in contiguous memory and provides O(1) indexed access. Inserting or deleting in the middle usually costs O(n).'],
      ['dynamic arrays', 'A dynamic array grows its backing storage when full. Appending is amortized O(1), although an occasional resize costs O(n).'],
      ['strings', 'A string is a sequence of characters. Many string problems can be solved with two pointers, sliding windows, hashing, or frequency counts.'],
      ['two pointers', 'Two pointers maintain two positions in a sequence and move them according to a condition. This often reduces a nested loop to O(n).'],
      ['sliding window', 'A sliding window maintains a valid contiguous range and expands or shrinks it as needed. It is useful for substring and subarray problems.'],
      ['prefix sums', 'A prefix sum stores cumulative totals, allowing a range sum to be calculated in O(1) after O(n) preprocessing.'],
      ['linked lists', 'A linked list stores nodes connected by references. Inserting after a known node is O(1), but random access is O(n).'],
      ['fast and slow pointers', 'Fast and slow pointers move at different speeds. They can detect cycles and find the middle of a linked list in O(n) time and O(1) space.'],
      ['stacks', 'A stack follows LIFO order. Push, pop, and peek are normally O(1), making stacks useful for parsing, undo operations, and depth-first search.'],
      ['queues', 'A queue follows FIFO order. Enqueue and dequeue are O(1) with a suitable implementation, such as a linked list or circular buffer.'],
      ['deques', 'A deque supports insertion and removal at both ends. It is useful for sliding-window maximum problems and breadth-first search variants.'],
      ['hash tables', 'A hash table maps keys to values using a hash function. Average lookup, insertion, and deletion are O(1), with collisions handled by buckets or probing.'],
      ['recursion', 'Recursion solves a problem by calling the same function on smaller inputs. Every recursive solution needs a base case and progress toward it.'],
      ['backtracking', 'Backtracking builds a candidate step by step and undoes choices when a path cannot work. It is common in permutations, subsets, and maze problems.'],
      ['binary search', 'Binary search repeatedly halves a sorted search space. Its time complexity is O(log n), and the loop must maintain clear inclusive or exclusive bounds.'],
      ['sorting', 'Sorting arranges data according to a comparison rule. Merge sort and heap sort guarantee O(n log n), while quicksort has O(n log n) average time.'],
      ['merge sort', 'Merge sort divides the array, sorts each half, and merges them. It runs in O(n log n) time and uses O(n) extra space.'],
      ['quick sort', 'Quicksort partitions around a pivot and recursively sorts both sides. Its average time is O(n log n), but poor pivots can produce O(n^2).'],
      ['binary trees', 'A binary tree has at most two children per node. Traversals include preorder, inorder, postorder, and level order.'],
      ['binary search trees', 'A binary search tree keeps smaller values left and larger values right. Search is O(log n) when balanced but can degrade to O(n).'],
      ['heaps', 'A heap is a complete tree where each parent follows a priority rule. A min-heap gives the smallest element in O(1), with insert and remove in O(log n).'],
      ['graphs', 'A graph contains vertices and edges. It can be represented by an adjacency list or matrix, and may be directed, undirected, weighted, or unweighted.'],
      ['breadth-first search', 'BFS explores a graph level by level using a queue. It finds shortest paths in unweighted graphs in O(V + E) time.'],
      ['depth-first search', 'DFS explores as far as possible before backtracking. It uses recursion or a stack and runs in O(V + E) on an adjacency list.']
    ];

    const questions = topics
      .flatMap(([topic, answer], topicIndex) => [
        this.createSeedNote(`What is ${topic}?`, answer, `dsa-${topicIndex}-1`),
        this.createSeedNote(`What is the key idea behind ${topic}?`, answer, `dsa-${topicIndex}-2`),
        this.createSeedNote(`What should a beginner remember about ${topic}?`, answer, `dsa-${topicIndex}-3`),
        this.createSeedNote(`What is a common use of ${topic}?`, answer, `dsa-${topicIndex}-4`)
      ])
      .filter(question => !seededQuestions.has(question.seedId));

    if (questions.length === 0) {
      return;
    }

    const db = await this.openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      questions.forEach(question => store.add(question));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private createSeedNote(question: string, answer: string, seedId: string): Note {
    return {
      seedId,
      question,
      answer,
      level: 'Beginner',
      dataType: 'Concept',
      category: 'DSA',
      tags: ['dsa', 'reading', 'dsa-seed'],
      createdAt: new Date().toISOString()
    };
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

  async incrementVisits(): Promise<number> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.visitStoreName, 'readwrite');
      const store = transaction.objectStore(this.visitStoreName);
      const request = store.get('site-visits');

      request.onsuccess = () => {
        const current = request.result?.count ?? 0;
        const count = current + 1;
        const saveRequest = store.put({ id: 'site-visits', count });

        saveRequest.onsuccess = () => resolve(count);
        saveRequest.onerror = () => reject(saveRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }
}
