import { Component, OnInit } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular'

import { Stepcounter } from '@ionic-native/stepcounter/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';

const startingOffset: number = 0;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit
{
  steps: number = 0;      // number of steps that have been counted since the start
  isCounting = false;     // bool to check if the app has started counting
  intervalCounting: any;  // how often the step count will be updated on the screen

  constructor(private stepcounter: Stepcounter,
              private storage: NativeStorage,
              private platform: Platform,
              private alertctrl: AlertController,
              private browsertab: BrowserTab,
              )
  {}

  ngOnInit()
  {
  }

  async initialize()
  {
    const deviceCanCount = await this.stepcounter.deviceCanCountSteps();

    if (deviceCanCount)
      this.deviceCanCount()
    else
      this.deviceCannotCount()
  }

  async deviceCanCount()
  {
    this.stepcounter.start(startingOffset).then(() =>
    {
      this.isCounting = true;

      this.intervalCounting = setInterval(async () =>
      {
        this.steps = await this.stepcounter.getStepCount()
      }, 1000)
    })
  }

  async deviceCannotCount()
  {
    const alert = await this.alertctrl.create(
    {
      header: "Error",
      message: "Your device does not support the ",
      buttons: [
      {
        text: 'Learn More',
        role: 'ok',
        handler: () =>
        {
          this.browsertab.isAvailable().then(isAvailable =>
          {
            if (isAvailable)
              this.browsertab.openUrl('https://developers.google.com/fit/scenarios/record-steps');
          });
        }
      },
      {
        text: 'Dismiss',
        role: 'cancel'
      }]
    })

    await alert.present()
  }

}
