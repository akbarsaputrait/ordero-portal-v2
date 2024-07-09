import { formatCurrency } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OwnerProfile } from '@app/collections/owner/profile.collection';
import { OwnerVariantCollection } from '@app/collections/owner/variant.collection';
import { OwnerVariantGroup } from '@app/collections/owner/variant/group.collection';
import { StaffProfile } from '@app/collections/staff/profile.collection';
import { StaffVariantCollection } from '@app/collections/staff/variant.collection';
import { ToastService } from '@app/core/services/toast.service';
import { capitalize, map } from 'lodash';

@Component({
  selector: 'aka-select-variants',
  templateUrl: './select-variants.component.html',
  styleUrls: ['./select-variants.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectVariantsComponent),
      multi: true,
    },
  ],
})
export class SelectVariantsComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() required: boolean;
  @Input() label: string;
  @Input() placeholder = 'Choose Customer';
  @Input() fieldClass = '';
  @Output() change = new EventEmitter<any>();

  _value: any;
  _disabled: boolean;

  options: any[];
  isLoading: boolean;

  _selected: string[];
  @Input()
  get selected() {
    return this._selected;
  }

  set selected(val: string[]) {
    if (val?.length > 0) {
      this._selected = val;
    } else {
      this._selected = [];
    }
  }

  _status: string;
  @Input()
  get status() {
    return this._status;
  }

  set status(val: string) {
    if (val) {
      this._status = val;
    }
  }

  @Input() user: OwnerProfile | StaffProfile = null;

  get isOwner() {
    return this.user.role.name === 'owner';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: (_: any) => void = () => null;
  onTouched = () => {};

  constructor(
    private collection: OwnerVariantCollection,
    private staffCol: StaffVariantCollection,
    private toast: ToastService
  ) {}

  async ngOnInit() {
    await this.findData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(async () => {
      const selected = changes['selected'];

      if (selected.currentValue?.length === 0) {
        this.selected = [];
      } else {
        await this.findData(selected.currentValue);
      }
    }, 0);
  }

  async findData(selected = null) {
    this.isLoading = true;
    try {
      let res;

      if (this.isOwner) {
        res = await this.collection.find(
          { where: { restaurant_id: this.user.restaurant.id } },
          { params: { include: 'group' } }
        );
      } else {
        res = await this.staffCol.find(
          { where: { restaurant_id: this.user.restaurant.id } },
          { params: { include: 'group' } }
        );
      }

      this.options = map(res, (val: { id: string; name: string; price: number; group: OwnerVariantGroup }) => {
        return {
          label: `${capitalize(val.group.name)} - ${capitalize(val.name)} (${formatCurrency(
            val.price,
            'en',
            'Rp.',
            'IDR'
          )})`,
          value: val.id,
          selected: selected ? selected.includes(val.id) : this.selected?.includes(val.id),
        };
      });
    } catch (error) {
      this.toast.error('Something bad happened', error);
    }
    this.isLoading = false;
  }

  public writeValue(value: any): void {
    this._value = value;
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  selectionChange(e: any) {
    this._value = e;

    this.onChange(this._value);
    this.change.emit(this._value);
  }
}
