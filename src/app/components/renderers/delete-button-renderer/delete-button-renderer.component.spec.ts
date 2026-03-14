import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteButtonRendererComponent } from './delete-button-renderer.component';

describe('DeleteButtonRendererComponent', () => {
  let component: DeleteButtonRendererComponent;
  let fixture: ComponentFixture<DeleteButtonRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteButtonRendererComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteButtonRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
