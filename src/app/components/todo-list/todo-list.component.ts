import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Todo } from 'src/app/models/todo.model';
import { TodoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {

  columnDefs: ColDef[] = [
    { field: 'id', width: 100 },
    { field: 'task', flex: 1 },
    { field: 'isCompleted', headerName: 'Status', width: 150 }
  ]

 todos: Todo[] = [];

  constructor(private todoService: TodoService){}

  ngOnInit(): void {
    this.todoService.getTodos().subscribe({
      next:(data)=>{
        this.todos = data;
        console.log('取得データ：',data);
      },
      error: (err)=> console.log('エラー発生', err)
    })
  }

}
