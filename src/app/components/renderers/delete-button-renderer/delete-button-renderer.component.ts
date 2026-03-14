import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-delete-button-renderer',
  templateUrl: './delete-button-renderer.component.html',
  styleUrls: ['./delete-button-renderer.component.css']
})
export class DeleteButtonRendererComponent implements ICellRendererAngularComp {
  private params: any;
  isCompleted: boolean = false;

  agInit(params: ICellRendererParams<any, any>): void {
    this.params = params;
    this.updateValues(params);
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    this.params = params;
    this.updateValues(params);
    return false;
  }

  private updateValues(params: ICellRendererParams){
    this.isCompleted = params.data.isCompleted;
  }

  onClick(event: MouseEvent) {
    if (this.params.onClick) {
      this.params.onClick(this.params.data.id);
    }
  }
  constructor() { }

  ngOnInit(): void {
  }

}
