import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos`).pipe(
      catchError(this.handleError)
    );
  }

  // 削除用API
  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/todos/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // バッチ削除APIを叩くメソッド
  deleteTodosBatch(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/todos/batch-delete`, ids).pipe(
      catchError(this.handleError)
    );
  }

  // 更新用API
  updateTodo(todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/todos`, todo).pipe(
      catchError(this.handleError)
    );
  }

  addTodo(todo: Todo): Observable<Todo> {
    return this.http.post<Todo>(`${this.apiUrl}/todos`, todo).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'エラーが発生しました';

    if (error.status === 0) {
      errorMessage = 'サーバーに接続できません。ネットワークを確認してください。';
    } else if (error.status === 404) {
      errorMessage = 'リソースが見つかりませんでした。';
    } else if (error.status >= 500) {
      errorMessage = 'サーバー側で問題が発生しています。しばらく時間をおいてください。';
    }

    console.error('API Error', error);
    
    return throwError(()=> new Error(errorMessage));
  }
}
