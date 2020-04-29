import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss'],
})
export class AnalysisComponent implements OnInit
{

  constructor(private modalctrl: ModalController,
              )
  {}

  ngOnInit() {}

  closeModal() { this.modalctrl.dismiss(); }
}
