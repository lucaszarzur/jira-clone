import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { JIssue } from '@trungk18/interface/issue';
import { FormControl } from '@angular/forms';
import { quillConfiguration } from '@trungk18/project/config/editor';
import { ProjectService } from '@trungk18/project/state/project/project.service';
import { ImageUrlService } from '@trungk18/project/services/image-url.service';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'issue-description',
  templateUrl: './issue-description.component.html',
  styleUrls: ['./issue-description.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class IssueDescriptionComponent implements OnChanges {
  @Input() issue: JIssue;
  descriptionControl: FormControl;
  editorOptions = quillConfiguration;
  isEditing: boolean;
  isWorking: boolean;

  // Propriedade para armazenar o conteúdo HTML processado
  processedDescription: SafeHtml;

  constructor(
    private _projectService: ProjectService,
    private _imageUrlService: ImageUrlService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const issueChange = changes.issue;
    if (issueChange.currentValue !== issueChange.previousValue) {
      this.descriptionControl = new FormControl(this.issue.description);

      // Processar as URLs das imagens
      this.processedDescription = this._imageUrlService.processImageUrls(this.issue.description);
    }
  }

  setEditMode(mode: boolean) {
    this.isEditing = mode;
  }

  editorCreated(editor: any) {
    if (editor && editor.focus) {
      editor.focus();
    }
  }

  save() {
    this.isWorking = true;
    this._projectService.updateIssue({
      ...this.issue,
      description: this.descriptionControl.value
    });

    // Atualizar o conteúdo processado
    this.processedDescription = this._imageUrlService.processImageUrls(this.descriptionControl.value);

    this.isWorking = false;
    this.setEditMode(false);
  }

  cancel() {
    this.descriptionControl.patchValue(this.issue.description);
    this.setEditMode(false);
  }
}
