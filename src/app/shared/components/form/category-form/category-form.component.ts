import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OwnerCategory, OwnerCategoryCollection } from '@app/collections/owner/category.collection';
import { OwnerAuthService } from '@app/core/services/owner/auth.service';
import { ToastService } from '@app/core/services/toast.service';
import { Form, FormRecord } from '@lib/form';
import { has } from 'lodash';

@Component({
  selector: 'aka-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
})
export class CategoryFormComponent implements OnInit {
  @Form({
    name: 'required|alphaNumSpace',
  })
  formData: FormRecord;

  _record: OwnerCategory = null;
  @Input()
  get record(): OwnerCategory {
    return this._record;
  }

  set record(val) {
    if (this.record !== val) {
      this._record = val;
    }
  }

  @Output() onClose: EventEmitter<boolean> = new EventEmitter();
  @Output() onSuccess: EventEmitter<OwnerCategory> = new EventEmitter();

  get isEdit() {
    return has(this.record, 'id');
  }

  constructor(private collection: OwnerCategoryCollection, private auth: OwnerAuthService, private toast: ToastService) {}

  ngOnInit() {
    if (!this.isEdit) {
      this.record = null;
      this.formData.$import({
        name: null,
      });
    } else {
      this.formData.$import({
        name: this.record.name,
      });
    }
  }

  cancel() {
    this.onClose.emit(true);
  }

  async execute() {
    try {
      let res = null;

      if (has(this.record, 'id')) {
        res = await this.collection.update(this.record.id, {
          ...this.formData.$payload,
          restaurant_id: this.auth.currentRestaurant.id,
        });
        this.toast.info(`Category successfully updated`);
      } else {
        res = await this.collection.create({ ...this.formData.$payload, restaurant_id: this.auth.currentRestaurant.id });
        this.toast.info(`Category ${res.name} successfully created`);
      }

      this.onSuccess.emit(res);
    } catch (error) {
      this.toast.error('Something bad happened', error);
    }
  }
}
