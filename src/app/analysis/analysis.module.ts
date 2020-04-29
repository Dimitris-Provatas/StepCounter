import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AnalysisComponent } from './analysis.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [AnalysisComponent],
  entryComponents: [AnalysisComponent]
})
export class AnalysisComponentModule {}
