import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RaffleResultPage } from './raffle-result-page';
import { COMMON_PROVIDERS } from 'src/testing/test-providers';

describe('RaffleResult', () => {
  let component: RaffleResultPage;
  let fixture: ComponentFixture<RaffleResultPage>;
  const inputId = '123';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaffleResultPage],
      providers: [...COMMON_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(RaffleResultPage);
    fixture.componentRef.setInput('id', inputId);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
