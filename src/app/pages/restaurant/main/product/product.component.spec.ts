import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestaurantProductComponent } from './product.component';

describe('RestaurantProductComponent', () => {
  let component: RestaurantProductComponent;
  let fixture: ComponentFixture<RestaurantProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RestaurantProductComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RestaurantProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
