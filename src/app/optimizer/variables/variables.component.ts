import { Observable, pipe, Subscription } from 'rxjs';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatColumnDef, MatTable, MatTableDataSource } from '@angular/material/table';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { RangeValidator } from 'src/app/validator/range.validator';

interface DataType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-variables',
  templateUrl: './variables.component.html',
  styleUrls: ['./variables.component.css'],
})
export class VariablesComponent implements OnInit, AfterViewInit, OnDestroy {
  public variablesForm: FormGroup;
  variablesArrayForm$: Observable<any>;
  private _variablesArrayForm: FormArray;
  myDataSource: MatTableDataSource<any>;

  public get variablesArrayForm(): FormArray {
    return this.variablesForm.get('variables') as FormArray;
  }
  public set variablesArrayForm(value: FormArray) {
    this._variablesArrayForm = value;
  }

  displayedColumns: string[] = ['name', 'min', 'max', 'description', 'delete'];
  displayedColumnsBinary: string[] = ['name', 'bits', 'description', 'delete'];

  @ViewChild(MatTable) _matTable: MatTable<any>;
  @ViewChild(MatColumnDef) minDef: MatColumnDef;

  subscription: Subscription;
  typeSubscription: Subscription;

  dataTypes: Array<DataType>;

  constructor(private _formBuilder: FormBuilder, private rangeValidator: RangeValidator) {
    this.dataTypes = [
      { value: 'int', viewValue: 'Integer' },
      { value: 'double', viewValue: 'Double' },
      { value: 'binary', viewValue: 'Binary' },
    ];

    this.variablesForm = this._formBuilder.group({
      objectives: ['', [Validators.required, Validators.min(1)]],
      type: [null, Validators.required],
      variables: this._formBuilder.array([]),
    },
    { updateOn: 'blur' });

    this.variablesArrayForm$ = this.variablesArrayForm.valueChanges;

    this.myDataSource = new MatTableDataSource();

    if (this.subscription == null) {
      this.subscription = this.variablesArrayForm$
        .pipe(
          distinctUntilChanged(),
          filter(elem => elem.length != this.myDataSource.data.length)
        )
        .subscribe((data) => {
          return (this.myDataSource.data = data);
        });
    }

    if (this.typeSubscription == null) {
      this.typeSubscription = this.variablesForm.get('type')
        .valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((type) => {
          if (type == 'binary') {
            (this.variablesForm.get('variables') as FormArray).controls.forEach(elem => {
              elem.get('min').patchValue(null);
              elem.get('max').patchValue(null);
              elem.get('min').disable();
              elem.get('max').disable();
              elem.get('bits').enable();
            })
          } else {
            (this.variablesForm.get('variables') as FormArray).controls.forEach(elem => {
              elem.get('bits').patchValue(null);
              elem.get('min').enable();
              elem.get('max').enable();
              elem.get('bits').disable();
            })
          }
        });
    }
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    if (this.variablesArrayForm.controls.length === 0) {
      this.variablesArrayForm = this.variablesForm.get(
        'variables'
      ) as FormArray;
      this.variablesArrayForm.push(this.createVariableItem());
      this._matTable.renderRows();
    }
  }

  createVariableItem(): FormGroup {
    return this._formBuilder.group(
      {
        name: [null, [Validators.required, Validators.maxLength(23)]],
        min: [{value: null, disabled: this.isDisabled()}, Validators.required],
        max: [{value: null, disabled: this.isDisabled()}, Validators.required],
        bits: [{value: null, disabled: !this.isDisabled()}, [Validators.required, Validators.min(1)]],
        description: [null],
      },
      {
        validators: [this.rangeValidator.minLessThanMax()],
        updateOn: 'blur'
      }
    );
  }

  isDisabled(): Boolean {
    return this.variablesForm.get('type').value == 'binary';
  }

  addRow(): void {
    this.checkAllFormControls(this.variablesArrayForm);
    if (this.variablesArrayForm.valid) {
      this.variablesArrayForm = this.variablesForm.get('array') as FormArray;
      this.variablesArrayForm.push(this.createVariableItem());
    }
  }

  checkAllFormControls(group: FormGroup | FormArray) {
    Object.keys(group.controls).forEach((key) => {
      const currControl = group.get(key);
      if (currControl instanceof FormGroup) {
        this.checkAllFormControls(currControl);
      } else {
        currControl.markAsDirty();
        currControl.updateValueAndValidity();
      }
    });
  }

  deleteRow(index: number): void {
    if (this.variablesArrayForm.controls.length > 1) {
      this.variablesArrayForm.removeAt(index);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.typeSubscription.unsubscribe();
  }
}
