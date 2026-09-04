import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningPage } from './learning-page';

describe('LearningPage', () => {
  let component: LearningPage;
  let fixture: ComponentFixture<LearningPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LearningPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
