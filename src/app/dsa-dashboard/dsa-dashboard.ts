import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ProgressStatus = 'Unsolved' | 'Attempted' | 'Done' | 'Solved' | 'Revision';
interface Progress { status: ProgressStatus; lastAttempt?: string; lastRevision?: string; revisionCount: number; }
interface DsaQuestion { id: string; group: string; question: string; links: string[]; notes: string[]; }
interface DsaPattern { name: string; questions: DsaQuestion[]; }

@Component({
  selector: 'app-dsa-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dsa-dashboard.html',
  styleUrl: './dsa-dashboard.css'
})
export class DsaDashboard implements OnInit {
  readonly progressKey = 'dsa-cheat-sheet-progress-v1';
  readonly statuses: ProgressStatus[] = ['Unsolved', 'Attempted', 'Done', 'Solved', 'Revision'];
  patterns: DsaPattern[] = [];
  progress: Record<string, Progress> = {};
  patternSearch = '';
  selectedPattern = 'All patterns';
  selectedStatus = 'All statuses';
  isLoading = true;
  loadError = '';

  ngOnInit(): void { this.readProgress(); void this.loadRoadmap(); }

  async loadRoadmap(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await fetch('/dsa-patterns-cheat-sheet.csv');
      if (!response.ok) throw new Error(`CSV load failed (${response.status})`);
      this.patterns = this.parseCsv(await response.text());
    } catch (error) {
      console.error('Unable to load DSA cheat sheet:', error);
      this.loadError = 'The DSA cheat sheet could not be loaded. Please refresh the page.';
    } finally { this.isLoading = false; }
  }

  private parseCsv(csv: string): DsaPattern[] {
    const patterns: DsaPattern[] = [];
    let currentPattern: DsaPattern | undefined;
    const patternHeadings = new Set([
      '1. Pattern: Two Pointers', '2. Pattern: Fast & Slow pointers', '3. Pattern: Sliding Window',
      'Pattern: Kadane pattern', 'PATTERN: PREFIX SUM', '4. Pattern: Merge Intervals',
      '6. Pattern: In-place Reversal of a LinkedList', '7. Pattern: Stack', '9. Pattern: Hash Maps',
      '10. Pattern : Binary Search', 'HEAP PATTERN', 'Recursion and Backtracking Pattern',
      'Tree Pattern', 'GRAPHS', 'DP (Dynamic Programming)', 'GREEDY '
    ]);
    csv.split(/\r?\n/).slice(2).forEach((line, index) => {
      const cells = line.split(',');
      const group = cells[0] ?? '';
      const question = cells[1] ?? '';
      const linkCells = cells.slice(2, 5).filter(cell => cell.length > 0);
      if (!group && !question && !linkCells.length) return;
      if (patternHeadings.has(question) && !group && !linkCells.length) {
        currentPattern = { name: question, questions: [] };
        patterns.push(currentPattern);
        return;
      }
      if (!currentPattern) { currentPattern = { name: 'Ungrouped', questions: [] }; patterns.push(currentPattern); }
      currentPattern.questions.push({
        id: `csv-row-${index + 3}`,
        group,
        question,
        links: linkCells.filter(cell => /^https?:\/\//i.test(cell)),
        notes: linkCells.filter(cell => !/^https?:\/\//i.test(cell))
      });
    });
    return patterns;
  }

  get totalQuestions(): number { return this.patterns.reduce((total, pattern) => total + pattern.questions.length, 0); }
  get solvedQuestions(): number { return Object.values(this.progress).filter(item => item.status === 'Solved' || item.status === 'Done').length; }
  get revisionQuestions(): number { return Object.values(this.progress).filter(item => item.status === 'Revision').length; }
  get completionPercent(): number { return this.totalQuestions ? Math.round((this.solvedQuestions / this.totalQuestions) * 100) : 0; }

  get visiblePatterns(): DsaPattern[] {
    const search = this.patternSearch.trim().toLowerCase();
    return this.patterns
      .filter(pattern => this.selectedPattern === 'All patterns' || pattern.name === this.selectedPattern)
      .map(pattern => ({ ...pattern, questions: pattern.questions.filter(question => {
        const matchesSearch = !search || [pattern.name, question.group, question.question].some(value => value.toLowerCase().includes(search));
        return matchesSearch && (this.selectedStatus === 'All statuses' || this.getProgress(question.id).status === this.selectedStatus);
      }) }))
      .filter(pattern => pattern.questions.length > 0);
  }

  getProgress(id: string): Progress { return this.progress[id] ?? { status: 'Unsolved', revisionCount: 0 }; }
  changeStatus(id: string, status: ProgressStatus): void { this.progress[id] = { ...this.getProgress(id), status }; this.saveProgress(); }
  markAttempt(id: string): void { const item = this.getProgress(id); this.progress[id] = { ...item, status: item.status === 'Unsolved' ? 'Attempted' : item.status, lastAttempt: new Date().toISOString() }; this.saveProgress(); }
  markSolved(id: string): void { this.progress[id] = { ...this.getProgress(id), status: 'Solved', lastAttempt: new Date().toISOString() }; this.saveProgress(); }
  markRevision(id: string): void { const item = this.getProgress(id); this.progress[id] = { ...item, status: 'Revision', lastRevision: new Date().toISOString(), revisionCount: item.revisionCount + 1 }; this.saveProgress(); }
  decrementRevision(id: string): void {
    const item = this.getProgress(id);
    const revisionCount = Math.max(0, item.revisionCount - 1);
    this.progress[id] = { ...item, revisionCount, lastRevision: revisionCount ? item.lastRevision : undefined };
    this.saveProgress();
  }
  leetCodeLink(question: DsaQuestion): string | undefined {
    return question.links.find(link => link.toLowerCase().includes('leetcode.com'));
  }
  statusClass(id: string): string { return this.getProgress(id).status.toLowerCase(); }
  formatDate(date?: string): string { return date ? new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'; }
  private readProgress(): void { try { this.progress = JSON.parse(localStorage.getItem(this.progressKey) ?? '{}'); } catch { this.progress = {}; } }
  private saveProgress(): void { localStorage.setItem(this.progressKey, JSON.stringify(this.progress)); }
}
