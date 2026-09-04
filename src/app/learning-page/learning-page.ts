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
  searchText = '';
  editingNote: Note | null = null;

  note: Note = this.createEmptyNote();

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  createEmptyNote(): Note {
    return {
      title: '',
      description: '',
      level: 'Beginner',
      dataType: 'String',
      category: '',
      tags: [],
      createdAt: new Date().toISOString()
    };
  }

  async loadNotes(): Promise<void> {
    try {
      this.notes = await this.notesService.getNotes();
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }

  async saveNote(): Promise<void> {

    if (!this.note.title.trim()) {
      alert('Please enter note title.');
      return;
    }

    if (!this.note.description.trim()) {
      alert('Please enter note description.');
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
      note.title.toLowerCase().includes(search) ||
      note.description.toLowerCase().includes(search) ||
      note.category.toLowerCase().includes(search) ||
      note.level.toLowerCase().includes(search) ||
      note.dataType.toLowerCase().includes(search) ||
      note.tags.some(tag =>
        tag.toLowerCase().includes(search)
      )
    );
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
