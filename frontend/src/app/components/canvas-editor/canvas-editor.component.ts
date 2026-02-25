/**
 * Canvas Editor Component
 * WYSIWYG editor with formatting toolbar.
 * Renders markdown as rich HTML in a contenteditable div.
 */

import {AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIconButton, MatButton} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {CommonModule} from '@angular/common';
import {marked} from 'marked';

@Component({
  selector: 'app-canvas-editor',
  templateUrl: './canvas-editor.component.html',
  styleUrl: './canvas-editor.component.scss',
  imports: [
    CommonModule,
    MatIcon,
    MatTooltip,
    MatIconButton,
    MatButton,
    MatMenuModule,
  ],
})
export class CanvasEditorComponent implements OnChanges, AfterViewInit {
  @Input() content: string = '';
  @Input() title: string = '';
  @Input() isOpen: boolean = false;
  @Output() closeCanvas = new EventEmitter<void>();
  @Output() contentChange = new EventEmitter<string>();

  @HostBinding('class.canvas-visible')
  get isVisible() { return this.isOpen; }

  @ViewChild('editableArea') editableArea!: ElementRef<HTMLDivElement>;

  private viewReady = false;

  // Heading options for the dropdown
  headingOptions = [
    { label: 'Normal text', tag: 'p' },
    { label: 'Heading 1', tag: 'h1' },
    { label: 'Heading 2', tag: 'h2' },
    { label: 'Heading 3', tag: 'h3' },
  ];
  currentHeadingLabel = 'Normal text';

  ngOnChanges(changes: SimpleChanges) {
    if (!this.viewReady) return;

    if (changes['content'] && this.content) {
      this.renderMarkdown();
    } else if (changes['isOpen'] && this.isOpen && this.content) {
      setTimeout(() => this.renderMarkdown());
    }
  }

  ngAfterViewInit() {
    this.viewReady = true;
    if (this.content) {
      this.renderMarkdown();
    }
  }

  private renderMarkdown() {
    if (!this.editableArea?.nativeElement) return;
    const html = marked.parse(this.content, {async: false}) as string;
    this.editableArea.nativeElement.innerHTML = html;
  }

  private getCurrentText(): string {
    return this.editableArea?.nativeElement?.innerText ?? this.content;
  }

  // ── Formatting commands ──

  execCommand(command: string, value?: string) {
    document.execCommand(command, false, value);
    this.editableArea?.nativeElement.focus();
  }

  formatBold() {
    this.execCommand('bold');
  }

  formatItalic() {
    this.execCommand('italic');
  }

  formatUnorderedList() {
    this.execCommand('insertUnorderedList');
  }

  formatOrderedList() {
    this.execCommand('insertOrderedList');
  }

  formatHeading(option: { label: string; tag: string }) {
    this.currentHeadingLabel = option.label;
    if (option.tag === 'p') {
      this.execCommand('formatBlock', 'p');
    } else {
      this.execCommand('formatBlock', option.tag);
    }
  }

  // ── Actions ──

  close() {
    this.closeCanvas.emit();
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.getCurrentText());
  }

  downloadAsFile() {
    const blob = new Blob([this.getCurrentText()], {type: 'text/markdown'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (this.title || 'document') + '.md';
    a.click();
    URL.revokeObjectURL(url);
  }
}
