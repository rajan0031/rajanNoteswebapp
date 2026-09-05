import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Note, NotesService } from '../notes.service';

interface DsaQuestion { name: string; difficulty: 'Easy' | 'Medium' | 'Hard'; link: string; }
interface DsaPattern { name: string; accent: string; questions: DsaQuestion[]; }
const q = (name: string, difficulty: 'Easy' | 'Medium' | 'Hard', link: string): DsaQuestion => ({ name, difficulty, link });

@Component({
  selector: 'app-learning-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './learning-page.html',
  styleUrl: './learning-page.css'
})
export class LearningPage implements OnInit {

  notes: Note[] = [];
  isLoading = true;
  loadError = '';
  searchText = '';
  editingNote: Note | null = null;
  currentPage = 1;
  readonly pageSize = 5;
  activeView: 'roadmap' | 'questions' = 'roadmap';
  patternSearch = '';
  selectedPattern = 'All patterns';

  readonly patterns: DsaPattern[] = [
    { name: 'Two Pointers', accent: 'blue', questions: [q('Pair with Target Sum', 'Easy', 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/description/'), q('Rearrange 0 and 1', 'Easy', 'https://www.geeksforgeeks.org/problems/segregate-0s-and-1s5106/1'), q('Remove Duplicates', 'Easy', 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/description/'), q('Squaring a Sorted Array', 'Easy', 'https://leetcode.com/problems/squares-of-a-sorted-array/'), q('Triplet Sum to Zero', 'Medium', 'https://leetcode.com/problems/3sum/'), q('Triplet Sum Close to Target', 'Medium', 'https://leetcode.com/problems/3sum-closest/'), q('Dutch National Flag Problem', 'Medium', 'https://leetcode.com/problems/sort-colors/description/'), q('Quadruple Sum to Target', 'Medium', 'https://leetcode.com/problems/4sum/')] },
    { name: 'Fast & Slow Pointers', accent: 'violet', questions: [q('LinkedList Cycle', 'Easy', 'https://leetcode.com/problems/linked-list-cycle/'), q('Start of LinkedList Cycle', 'Medium', 'https://leetcode.com/problems/linked-list-cycle-ii/'), q('Happy Number', 'Medium', 'https://leetcode.com/problems/happy-number/'), q('Find Duplicate Number', 'Medium', 'https://leetcode.com/problems/find-the-duplicate-number/description/'), q('Middle of the LinkedList', 'Easy', 'https://leetcode.com/problems/middle-of-the-linked-list/'), q('Palindrome LinkedList', 'Medium', 'https://leetcode.com/problems/palindrome-linked-list/'), q('Rearrange a LinkedList', 'Medium', 'https://leetcode.com/problems/reorder-list/')] },
    { name: 'Sliding Window', accent: 'cyan', questions: [q('Maximum Sum Subarray of Size K', 'Easy', 'https://www.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1'), q('Smallest Subarray with a Given Sum', 'Easy', 'https://leetcode.com/problems/minimum-size-subarray-sum/'), q('Longest Substring with K Distinct Characters', 'Medium', 'https://www.geeksforgeeks.org/problems/longest-k-unique-characters-substring0853/1'), q('Fruits into Baskets', 'Medium', 'https://leetcode.com/problems/fruit-into-baskets/'), q('No-repeat Substring', 'Hard', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/'), q('Longest Repeating Character Replacement', 'Hard', 'https://leetcode.com/problems/longest-repeating-character-replacement/'), q('Minimum Window Substring', 'Hard', 'https://leetcode.com/problems/minimum-window-substring/description/'), q('Permutation in a String', 'Hard', 'https://leetcode.com/problems/permutation-in-string/')] },
    { name: 'Kadane & Prefix Sum', accent: 'amber', questions: [q('Maximum Subarray Sum', 'Easy', 'https://leetcode.com/problems/maximum-subarray/'), q('Minimum Subarray Sum', 'Medium', 'https://www.geeksforgeeks.org/problems/smallest-sum-contiguous-subarray/1'), q('Maximum Product Subarray', 'Medium', 'https://leetcode.com/problems/maximum-product-subarray/'), q('Maximum Sum Circular Subarray', 'Medium', 'https://leetcode.com/problems/maximum-sum-circular-subarray/'), q('Subarray Sum Equals K', 'Easy', 'https://leetcode.com/problems/subarray-sum-equals-k/description/'), q('Find Pivot Index', 'Easy', 'https://leetcode.com/problems/find-pivot-index/description/'), q('Subarray Sums Divisible By K', 'Medium', 'https://leetcode.com/problems/subarray-sums-divisible-by-k/description/'), q('Shortest Subarray With Sum at Least K', 'Hard', 'https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/description/')] },
    { name: 'Intervals & Linked Lists', accent: 'rose', questions: [q('Merge Intervals', 'Medium', 'https://leetcode.com/problems/merge-intervals/description/'), q('Insert Interval', 'Medium', 'https://leetcode.com/problems/insert-interval/'), q('Interval List Intersections', 'Medium', 'https://leetcode.com/problems/interval-list-intersections/'), q('Minimum Meeting Rooms', 'Hard', 'https://www.geeksforgeeks.org/problems/attend-all-meetings-ii/1'), q('Reverse a LinkedList', 'Easy', 'https://leetcode.com/problems/reverse-linked-list/'), q('Reverse a Sub-list', 'Medium', 'https://leetcode.com/problems/reverse-linked-list-ii/'), q('Reverse Nodes in K-Group', 'Hard', 'https://leetcode.com/problems/reverse-nodes-in-k-group/'), q('Rotate a LinkedList', 'Medium', 'https://leetcode.com/problems/rotate-list/')] },
    { name: 'Stack & Hash Maps', accent: 'orange', questions: [q('Remove Adjacent Duplicates', 'Easy', 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/description/'), q('Balanced Parentheses', 'Easy', 'https://leetcode.com/problems/valid-parentheses/description/'), q('Next Greater Element', 'Easy', 'https://leetcode.com/problems/next-greater-element-ii/description/'), q('Daily Temperatures', 'Easy', 'https://leetcode.com/problems/daily-temperatures/'), q('Simplify Path', 'Medium', 'https://leetcode.com/problems/simplify-path/'), q('Remove K Digits', 'Hard', 'https://leetcode.com/problems/remove-k-digits/'), q('First Non-repeating Character', 'Easy', 'https://leetcode.com/problems/first-unique-character-in-a-string/'), q('Longest Palindrome', 'Easy', 'https://leetcode.com/problems/longest-palindrome/')] },
    { name: 'Binary Search', accent: 'indigo', questions: [q('Binary Search Basic', 'Easy', 'https://leetcode.com/problems/binary-search/'), q('First and Last Position', 'Medium', 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/'), q('Peak Index in Mountain Array', 'Medium', 'https://leetcode.com/problems/peak-index-in-a-mountain-array/'), q('Find Minimum in Rotated Sorted Array', 'Medium', 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/'), q('Search in Rotated Sorted Array', 'Medium', 'https://leetcode.com/problems/search-in-rotated-sorted-array/description/'), q('Koko Eating Bananas', 'Medium', 'https://leetcode.com/problems/koko-eating-bananas/'), q('Capacity to Ship Packages', 'Medium', 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/description/'), q('Median of Two Sorted Arrays', 'Hard', 'https://leetcode.com/problems/median-of-two-sorted-arrays/')] },
    { name: 'Heap & Greedy', accent: 'emerald', questions: [q('Kth Smallest Element', 'Easy', 'https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1'), q('Kth Largest Element', 'Medium', 'https://leetcode.com/problems/kth-largest-element-in-an-array/description/'), q('Top K Frequent Elements', 'Medium', 'https://leetcode.com/problems/top-k-frequent-elements/description/'), q('K Closest Points to Origin', 'Medium', 'https://leetcode.com/problems/k-closest-points-to-origin/description/'), q('Merge K Sorted Arrays', 'Medium', 'https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1'), q('Task Scheduler', 'Medium', 'https://leetcode.com/problems/task-scheduler/description/'), q('Reorganize String', 'Medium', 'https://leetcode.com/problems/reorganize-string/'), q('Find Median from Data Stream', 'Hard', 'https://leetcode.com/problems/find-median-from-data-stream/description/')] },
    { name: 'Recursion & Backtracking', accent: 'purple', questions: [q('Fibonacci', 'Easy', 'https://leetcode.com/problems/fibonacci-number/description/'), q('Check if String is Palindrome', 'Easy', 'https://www.geeksforgeeks.org/problems/palindrome-string0817/1'), q('Check if Array is Sorted', 'Easy', 'https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1'), q('Generate Parentheses', 'Medium', 'https://leetcode.com/problems/generate-parentheses/description/'), q('Letter Combinations of a Phone Number', 'Medium', 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/'), q('Permutations', 'Medium', 'https://leetcode.com/problems/permutations/description/'), q('Combination Sum', 'Medium', 'https://leetcode.com/problems/combination-sum/description/'), q('Palindrome Partitioning', 'Medium', 'https://leetcode.com/problems/palindrome-partitioning/')] },
    { name: 'Trees', accent: 'teal', questions: [q('Binary Tree Inorder Traversal', 'Easy', 'https://leetcode.com/problems/binary-tree-inorder-traversal/description/'), q('Binary Tree Level Order Traversal', 'Medium', 'https://leetcode.com/problems/binary-tree-level-order-traversal/description/'), q('Invert Binary Tree', 'Easy', 'https://leetcode.com/problems/invert-binary-tree/description/'), q('Lowest Common Ancestor of a Binary Tree', 'Medium', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/description/'), q('Validate Binary Search Tree', 'Medium', 'https://leetcode.com/problems/validate-binary-search-tree/description/'), q('Diameter of Binary Tree', 'Easy', 'https://leetcode.com/problems/diameter-of-binary-tree/description/'), q('Binary Tree Maximum Path Sum', 'Hard', 'https://leetcode.com/problems/binary-tree-maximum-path-sum/description/'), q('Construct Tree from Preorder and Inorder', 'Medium', 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/')] },
    { name: 'Graphs', accent: 'sky', questions: [q('Graph DFS', 'Easy', 'https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1'), q('Graph BFS', 'Easy', 'https://www.geeksforgeeks.org/problems/bfs-traversal-for-a-graph/1'), q('Number of Islands', 'Medium', 'https://leetcode.com/problems/number-of-islands/description/'), q('Rotting Oranges', 'Medium', 'https://leetcode.com/problems/rotting-oranges/'), q('Topological Sort', 'Medium', 'https://www.geeksforgeeks.org/problems/topological-sort/1'), q('Is Graph Bipartite?', 'Medium', 'https://leetcode.com/problems/is-graph-bipartite/'), q("Dijkstra's Algorithm", 'Medium', 'https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1'), q('Word Ladder', 'Hard', 'https://leetcode.com/problems/word-ladder/')] },
    { name: 'Dynamic Programming', accent: 'fuchsia', questions: [q('Fibonacci', 'Easy', 'https://leetcode.com/problems/fibonacci-number/description/'), q('Climbing Stairs', 'Easy', 'https://leetcode.com/problems/climbing-stairs/description/'), q('House Robber', 'Medium', 'https://leetcode.com/problems/house-robber/'), q('0/1 Knapsack', 'Medium', 'https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1'), q('Subset Sum', 'Medium', 'https://www.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1'), q('Target Sum', 'Medium', 'https://www.geeksforgeeks.org/problems/target-sum-1626326450/1'), q('Longest Increasing Subsequence', 'Medium', 'https://leetcode.com/problems/longest-increasing-subsequence/'), q('Longest Common Subsequence', 'Medium', 'https://leetcode.com/problems/longest-common-subsequence/description/')] },
    { name: 'Greedy', accent: 'lime', questions: [q('Lemonade Change', 'Easy', 'https://leetcode.com/problems/lemonade-change/'), q('Jump Game', 'Medium', 'https://leetcode.com/problems/jump-game/description/'), q('Assign Cookies', 'Easy', 'https://leetcode.com/problems/assign-cookies/description/'), q('Fractional Knapsack', 'Medium', 'https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1')] }
  ];

  note: Note = this.createEmptyNote();

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  createEmptyNote(): Note {
    return {
      question: '',
      answer: '',
      level: 'Beginner',
      dataType: 'String',
      category: '',
      tags: [],
      createdAt: new Date().toISOString()
    };
  }

  async loadNotes(): Promise<void> {
    this.isLoading = true;
    this.loadError = '';
    try {
      await this.notesService.seedDsaQuestions();
      this.notes = await this.notesService.getNotes();
      this.currentPage = 1;
    } catch (error) {
      console.error('Error loading notes:', error);
      this.loadError = 'Questions could not be loaded. Please refresh the page.';
    } finally {
      this.isLoading = false;
    }
  }

  async saveNote(): Promise<void> {

    if (!this.note.question.trim()) {
      alert('Please enter a question.');
      return;
    }

    if (!this.note.answer.trim()) {
      alert('Please enter an answer.');
      return;
    }

    if (this.editingNote?.id !== undefined) {

      this.note.id = this.editingNote.id;

      await this.notesService.updateNote(this.note);

    } else {

      this.note.createdAt = new Date().toISOString();

      await this.notesService.addNote(this.note);
    }

    await this.loadNotes();

    this.closeModal();
  }

  openAddModal(): void {

    this.editingNote = null;
    this.note = this.createEmptyNote();

    const modalElement = document.getElementById('noteModal');

    if (modalElement) {
      const modal = (window as any).bootstrap.Modal
        .getOrCreateInstance(modalElement);

      modal.show();
    }
  }

  editNote(note: Note): void {

    this.editingNote = note;

    this.note = {
      ...note,
      tags: [...note.tags]
    };

    const modalElement = document.getElementById('noteModal');

    if (modalElement) {
      const modal = (window as any).bootstrap.Modal
        .getOrCreateInstance(modalElement);

      modal.show();
    }
  }

  async deleteNote(note: Note): Promise<void> {

    if (note.id === undefined) {
      return;
    }

    if (!confirm(`Are you sure you want to delete "${note.title}"?`)) {
      return;
    }

    await this.notesService.deleteNote(note.id);

    await this.loadNotes();
  }

  closeModal(): void {

    const modalElement = document.getElementById('noteModal');

    if (modalElement) {
      const modal = (window as any).bootstrap.Modal
        .getOrCreateInstance(modalElement);

      modal.hide();
    }

    this.editingNote = null;
    this.note = this.createEmptyNote();
  }

  getTags(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.note.tags = input.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  get filteredNotes(): Note[] {

    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      return this.notes;
    }

    return this.notes.filter(note =>
      note.question.toLowerCase().includes(search) ||
      note.answer.toLowerCase().includes(search) ||
      note.category.toLowerCase().includes(search) ||
      note.level.toLowerCase().includes(search) ||
      note.dataType.toLowerCase().includes(search) ||
      note.tags.some(tag =>
        tag.toLowerCase().includes(search)
      )
    );
  }

  get totalRoadmapQuestions(): number { return this.patterns.reduce((total, pattern) => total + pattern.questions.length, 0); }

  get visiblePatterns(): DsaPattern[] {
    const search = this.patternSearch.trim().toLowerCase();
    return this.patterns
      .filter(pattern => this.selectedPattern === 'All patterns' || pattern.name === this.selectedPattern)
      .map(pattern => ({ ...pattern, questions: pattern.questions.filter(question => !search || question.name.toLowerCase().includes(search)) }))
      .filter(pattern => pattern.questions.length > 0);
  }

  showRoadmap(): void { this.activeView = 'roadmap'; }
  showQuestions(): void { this.activeView = 'questions'; }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredNotes.length / this.pageSize));
  }

  get pagedNotes(): Note[] {
    const page = Math.min(this.currentPage, this.totalPages);
    const start = (page - 1) * this.pageSize;
    return this.filteredNotes.slice(start, start + this.pageSize);
  }

  get hasMultiplePages(): boolean {
    return this.filteredNotes.length > this.pageSize;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.currentPage = 1;
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
