import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from 'src/app/services/todo.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let todoServiceSpy: jasmine.SpyObj<TodoService>;

  // モック用のGridApiを用意
  const mockGridApi = jasmine.createSpyObj('GridApi', [
    'getSelectedRows', 
    'refreshCells', 
    'showLoadingOverlay', 
    'hideOverlay', 
    'startEditingCell'
  ]);

  beforeEach(async () => {
    // TodoServiceのメソッドをスパイ（監視）できるようにする
    const spy = jasmine.createSpyObj('TodoService', ['getTodos', 'deleteTodo', 'deleteTodosBatch', 'addTodo', 'updateTodo']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TodoListComponent],
      providers: [{ provide: TodoService, useValue: spy }]
    }).compileComponents();

    todoServiceSpy = TestBed.inject(TodoService) as jasmine.SpyObj<TodoService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    
    // GridApiを無理やりセットする（onGridReadyを呼ぶのと同じ状態にする）
    (component as any).gridApi = mockGridApi; 
  });

  it('ngOnInit時にtodoService.getTodosが呼ばれるべき', () => {
    todoServiceSpy.getTodos.and.returnValue(of([{ id: 1, task: 'テスト', isCompleted: false }]));
    
    component.ngOnInit();
    
    expect(todoServiceSpy.getTodos).toHaveBeenCalled();
    expect(component.todos.length).toBe(1);
  });

  it('onDelete実行時に確認ダイアログが出て、削除APIが呼ばれるべき', () => {
    // window.confirmをモック化
    spyOn(window, 'confirm').and.returnValue(true);
    todoServiceSpy.deleteTodo.and.returnValue(of());
    // loadTodos内でgridApiを使うのでモック化
    spyOn(component, 'loadTodos');

    component.onDelete(1);

    expect(window.confirm).toHaveBeenCalled();
    expect(todoServiceSpy.deleteTodo).toHaveBeenCalledWith(1);
  });
});