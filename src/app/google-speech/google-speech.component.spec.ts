import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleSpeechComponent } from './google-speech.component';

describe('GoogleSpeechComponent', () => {
  let component: GoogleSpeechComponent;
  let fixture: ComponentFixture<GoogleSpeechComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoogleSpeechComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleSpeechComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
