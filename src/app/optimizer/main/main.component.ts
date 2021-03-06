import { ResultService } from './../services/result.service';
import { Component, OnInit } from '@angular/core';
import { ProblemService } from '../services/problem.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  providers: [ProblemService, ResultService],
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
