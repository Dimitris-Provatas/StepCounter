import { Component, OnInit } from '@angular/core';

import { Stepcounter } from '@ionic-native/stepcounter/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit
{
  steps: any = null;
  error: any = null;

  constructor(private stepcounter: Stepcounter,)
  {}

  ngOnInit()
  {
    console.log("Page Loaded")

    let startingOffset = 0;
    this.stepcounter.start(startingOffset).then(onSuccess =>
    {
      console.log('stepcounter-start success', onSuccess);
    }, onFailure =>
    {
      console.log('stepcounter-start error', onFailure);
    });

    this.stepcounter.getHistory().then(historyObj =>
    {
      console.log('stepcounter-history success', historyObj);
    }, onFailure =>
    {
      console.log('stepcounter-history error', onFailure);
    });
  }

}
