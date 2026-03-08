import { Component, OnInit } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Todo } from 'src/app/models/todo.model';
import { TodoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {

  columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'id', width: 80 },
    {
      headerName: 'タスク内容',
      field: 'task',
      flex: 1,
      editable: true
    }, // flexで幅を自動調整
    {
      headerName: '完了',
      field: 'isCompleted',
      width: 150,
      cellRenderer: (params: any) => {
        return params.value ? '✅ 完了' : '⏳ 未完了'; // 簡単な条件分岐
      }
    },
    {
      headerName: '操作',
      width: 150,
      cellRenderer: (params: ICellRendererParams) => {
        // ボタンのHTMLを生成
        const button = document.createElement('button');
        button.innerText = '削除';
        button.addEventListener('click', () => this.onDelete(params.data.id));
        return button;
      }
    }
  ];

  // 表示するテンプレートを定義
  noRowsTemplate = `
    <div style="padding: 20px; text-align: center; color: #666; font-size: 14px;">
      <p>まだTodoはありません。</p>
      <p>新しいタスクを追加しましょう！</p>
    </div>
  `;

  todos: Todo[] = [];

  constructor(private todoService: TodoService) { }

  ngOnInit(): void {
    this.todoService.getTodos().subscribe({
      next: (data) => {
        this.todos = data;
        console.log('取得データ：', data);
      },
      error: (err) => console.log('エラー発生', err)
    })
  }

  onCellValueChanged(params: any): void {
  const updatedTodo = params.data; // 更新された行データ
  this.todoService.updateTodo(updatedTodo).subscribe({
    next: () => console.log('更新成功！'),
    error: (err) => console.error('更新失敗', err)
  });
}

  // 削除ボタンが押された時の処理
  onDelete(id: number): void {
    if (confirm('本当に削除しますか？')) {
      this.todoService.deleteTodo(id).subscribe(() => {
        // 削除成功したらリストを再読み込み
        this.loadTodos();
      });
    }
  }

  loadTodos(): void {
    this.todoService.getTodos().subscribe(data => this.todos = data);
  }
}
