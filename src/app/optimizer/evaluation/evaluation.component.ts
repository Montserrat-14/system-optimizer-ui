import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent implements OnInit {
  public evaluationForm: FormGroup;

  urlRegex = "^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$";

  constructor(
    private _formBuilder: FormBuilder
  ) {
    this.evaluationForm = this._formBuilder.group({
      endpoint: ['', Validators.required],
      payload: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]]
    }, { updateOn: 'blur' });
  }

  ngOnInit(): void {
  }

}
