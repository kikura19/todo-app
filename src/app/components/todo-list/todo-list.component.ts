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
  private gridApi: any;

  // グリッド準備完了時にAPIを取得
  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  // 選択されているか確認（ボタンの活性制御用）
  hasSelection(): boolean {
    return this.gridApi && this.gridApi.getSelectedRows().length > 0;
  }

  columnDefs: ColDef[] = [
    {
      headerName: '',        // ヘッダー名は空でOK
      field: 'checkbox',     // 内部識別用
      width: 50,             // チェックボックス用の狭い幅
      checkboxSelection: true,         // 各行にチェックボックスを表示
      headerCheckboxSelection: true,  // ヘッダーにも「全選択」チェックボックスを表示
      pinned: 'left'         // 念のため左端に固定（スクロールしても消えないように）
    },
    { headerName: 'ID', field: 'id', width: 80 },
    {
      headerName: 'タスク内容',
      field: 'task',
      flex: 1,
      editable: true,
      valueSetter: (params) => {
        // 空文字や空白だけの入力は拒否
        if (params.newValue && params.newValue.trim().length > 0) {
          params.data.task = params.newValue;
          return true; // 編集を確定させる
        }
        // 拒否してアラートを表示
        alert('タスク名は必須です！');
        return false; // 編集を確定させない（キャンセル）
      }
    }, // flexで幅を自動調整
    {
      headerName: 'ステータス',
      field: 'isCompleted',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [true, false], // プルダウンの選択肢
      },
      // 表示を見やすくするためのフォーマッター
      valueFormatter: (params) => {
        return params.value ? '✅ 完了' : '⏳ 未完了';
      },
      // 選択肢の表示名をカスタマイズ（オプション）
      valueParser: (params) => {
        // 必要に応じて型変換の制御が可能
        return params.newValue === 'true';
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

  onDeleteSelected() {
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length === 0) return;

    if (confirm(`${selectedRows.length} 件のタスクを削除しますか？`)) {
      // 1. 選択行からIDの配列だけを抽出 [1, 2, 3] のような形にする
      const ids = selectedRows.map((row: any) => row.id);

      // 2. 一括削除APIを1回だけ叩く
      this.todoService.deleteTodosBatch(ids).subscribe({
        next: () => {
          this.loadTodos(); // 完了後に画面リフレッシュ
        },
        error: (err) => {
          console.error('削除失敗', err);
        }
      });
    }
  }

  loadTodos(): void {
    this.todoService.getTodos().subscribe(data => this.todos = data);
  }
}
