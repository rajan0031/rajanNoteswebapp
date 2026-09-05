import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Note, NotesService } from '../notes.service';

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
