import { Component, OnInit } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { error, log } from 'console';
import { Category, Todo } from 'src/app/models/todo.model';
import { TodoService } from 'src/app/services/todo.service';
import { CategoryUtil } from 'src/app/shared/utils/todo-helper';
import { DeleteButtonRendererComponent } from '../renderers/delete-button-renderer/delete-button-renderer.component';

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
    this.loadTodos(); // 準備ができたらデータを読み込む
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
      editable: (params) => {
        if (params.data.isCompleted) {
          return false;
        }
        return true;
      },
      valueSetter: (params) => {
        // 空文字や空白だけの入力は拒否
        if (params.newValue && params.newValue.trim().length > 0) {
          params.data.task = params.newValue;
          return true; // 編集を確定させる
        }
        // 拒否してアラートを表示
        alert('タスク名は必須です！');
        return false; // 編集を確定させない（キャンセル）
      },
      cellClassRules: {
        'disabled-cell': (params) => params.data.isCompleted === true
      }
    }, // flexで幅を自動調整
    {
      headerName: '区分',
      field: 'category',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: Object.values(Category),
      },
      valueFormatter: (params) => CategoryUtil.getLabel(params.value),
      cellStyle: (params) => {
        return { backgroundColor: CategoryUtil.getBgColor(params.value) }
      }
    },
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
      cellRenderer: DeleteButtonRendererComponent,
      cellRendererParams: {
        onClick: (id: number) => this.onDelete(id)
      }
    }
  ];

  gridOptions = {
    suppressRowClickSelection: true,

    rowSelction: 'multiple' as const,
  }

  // 表示するテンプレートを定義
  noRowsTemplate = `
    <div style="padding: 20px; text-align: center; color: #666; font-size: 14px;">
      <p>まだTodoはありません。</p>
      <p>新しいタスクを追加しましょう！</p>
    </div>
  `;

  // Loading表示用テンプレート
  loadingTemplate = `
    <div style="padding: 20px; text-align: center;">
      <span class="ag-overlay-loading-center">読み込み中...</span>
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


  onCellValueChanged(params: any) {
    const data = params.data;

    if (!data.id) {
      // 新規作成時はIDがnullなのでPOST
      this.todoService.addTodo(data).subscribe({
        next: (newTodo: Todo) => {
          // 重要：APIから返ってきた「IDが入ったデータ」でグリッドを更新する
          params.data.id = newTodo.id;

          // グリッドに「データが変わったよ」と通知して再描画させる
          this.gridApi.refreshCells({ rowNodes: [params.node] });
          console.log('新規作成成功！ID:', newTodo.id);
        },
        error: (err) => {
          alert(err.message)
          this.todos = this.todos.filter(t => t !== data);
        }
      });
    } else {
      // 更新時はPUT
      this.todoService.updateTodo(data).subscribe({
        next: () => {
          console.log("更新成功");
        },
        error: (err) => {
          params.data[params.column.getColId()] = params.oldValue;
          this.gridApi.refreshCells({
            rowNodes: [params.node],
            columns: [params.column.getColId()],
          });
          alert(err.message);
        }
      });
      console.log("UPDATE");
    }
  }

  addNewTask() {
    const newTodo = { id: null, task: '', category: Category.PERSONAL, isCompleted: false }; // 空のタスクを作成
    this.todos = [newTodo, ...this.todos]; // 配列の先頭に追加

    // 少し遅らせてから編集モードを起動（DOM反映待ち）
    setTimeout(() => {
      this.gridApi.startEditingCell({
        rowIndex: 0,
        colKey: 'task'
      });
    }, 0);
  }

  count: number = 0;
  addNewTestTask() {
    const newTodo: Todo = { id: null, task: `テスト${this.count}`, category: Category.PERSONAL, isCompleted: false }; // 空のタスクを作成
    this.todos = [newTodo, ...this.todos]; // 配列の先頭に追加


    this.todoService.addTodo(newTodo).subscribe({
      next: (savedTodo: Todo) => {
        this.loadTodos();
        this.count++;
        console.log(`テストタスク保存成功: ID=${savedTodo.id}`);
      },
      error: (err) => {
        alert(`テストタスクの保存に失敗しました: ${err.message}`);
        // 4. 失敗した場合は、画面から取り除く（不整合防止）
        this.todos = this.todos.filter(t => t !== newTodo);
      }
    });
  }

  // 削除ボタンが押された時の処理
  onDelete(id: number): void {
    if (confirm('本当に削除しますか？')) {
      this.todoService.deleteTodo(id).subscribe({
        next: () => {
          this.loadTodos(); // 完了後に画面リフレッシュ
        },
        error: (err) => {
          alert(err.message);
        }
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
          alert(err.message);
        }
      });
    }
  }

  completed() {
    const selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length === 0) return;

    if (confirm(`${selectedRows.length} 件のタスクを完了しますか？`)) {
      selectedRows.forEach((row:Todo) => {
        row.isCompleted = true;

        this.todoService.updateTodo(row).subscribe({
          next: () => {
            // 個別に成功したらセルをリフレッシュ
            this.gridApi.refreshCells({ rowNodes: [this.gridApi.getRowNode(row.id!.toString())] });
          },
          error: (err) => {
            // 失敗した場合は元に戻す（整合性維持）
            row.isCompleted = false;
            this.gridApi.refreshCells({ rowNodes: [this.gridApi.getRowNode(row.id!.toString())] });
            alert(`一部の更新に失敗しました: ${err.message}`);
          }
        });
      });
      this.loadTodos();
    }
  }

  onDeleteCompleted() {
    const completedRows = this.todos.filter(todo => todo.isCompleted && todo.id);

    if (completedRows.length === 0) {
      alert('完了済みのタスクはありません')
      return;
    }

    if (confirm(`${completedRows.length}件の完了済みのタスクを一括削除しますか？`)) {
      const ids = completedRows.map(todo => todo.id as number);

      this.todoService.deleteTodosBatch(ids).subscribe({
        next: () => {
          console.log('一括削除完了');
          this.loadTodos();
        },
        error: (err) => {
          alert(err.message);
        }
      })
    }


  }

  loadTodos(): void {
    // 1. Loadingオーバーレイを表示
    this.gridApi.showLoadingOverlay();

    this.todoService.getTodos().subscribe({
      next: (data) => {
        this.todos = data;
        // 2. 成功したらオーバーレイを非表示
        this.gridApi.hideOverlay();
      },
      error: (err) => {
        // 1. ユーザーへアラート（実務ではSnackBarやDialogが理想）
        alert(err.message);

        // 2. ローディング表示を消す（これを忘れると画面が固まって見える）
        this.gridApi?.hideOverlay();

        // 3. 必要に応じて「データなし」用の表示に切り替え
        if (this.todos.length === 0) {
          this.gridApi?.showNoRowsOverlay();
        }
      }
    });
  }
}
