import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;



  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoService]
    });
    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getTodos()は正しいエンドポイントを叩くべき', ()=>{
    const dummyTodos = [{id: 1,task:'テスト', isCompleted: false}];

    service.getTodos().subscribe(data => {
      expect(data).toEqual(dummyTodos);
    });

    const req = httpMock.expectOne(`http://localhost:8080/todos`);
    expect(req.request.method).toBe('GET');

    req.flush(dummyTodos);
  });


});
