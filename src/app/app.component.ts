import { Component, OnInit } from '@angular/core';
import { Todo } from './models/todo.model';
import { TodoService } from './services/todo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'title'

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
