import { Component, OnInit } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular'

import { Stepcounter } from '@ionic-native/stepcounter/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

const startingTheDay: number = 0;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit
{
  steps: number = 0;      // number of steps that have been counted since the start
  isCounting = false;     // bool to check if the app has started counting
  canCount = false;        // bool to know if the device can count
  intervalCounting: any;  // how often the step count will be updated on the screen

  action: string = "Initializing...";

  constructor(private stepcounter: Stepcounter,
              private storage: NativeStorage,
              private platform: Platform,
              private backgroundMode: BackgroundMode,
              private alertctrl: AlertController,
              )
  {}

  ngOnInit()
  {
  }

  async initialize()
  {
    const deviceCanCount = await this.stepcounter.deviceCanCountSteps();

    if (deviceCanCount)
      this.deviceCanCount(startingTheDay)
    else
      this.deviceCannotCount()
  }

  async deviceCanCount(countOffset)
  {
    this.stepcounter.start(countOffset).then(() =>
    {
      this.backgroundMode.enable();

      this.action = "Stop Counting";
      this.isCounting = true;
      this.canCount = true;

      this.intervalCounting = setInterval(async () =>
      {
        this.steps = await this.stepcounter.getStepCount()
      }, 1000)
    })
  }

  async deviceCannotCount()
  {
    await this.alertctrl.create(
    {
      header: "Error",
      message: "Your device does not support the step counter API.",
      buttons: [
      {
        text: 'Dismiss',
        role: 'cancel'
      }]
    }).then(async alert =>
    {
      await alert.present();
      this.action = "Start Counting";
    })
  }

  changeAction()
  {
    if (this.isCounting)
      this.pauseCounting()
    else
      this.resumeCounting()
  }

  async pauseCounting()
  {
    this.backgroundMode.disable();

    await this.alertctrl.create(
    {
      header: "Stopped the counter",
      message: "The counter has been stopped. It will automatically resume counting if you restart the app.",
      buttons: ["OK"]
    }).then(async alert =>
    {
      await alert.present();
      this.action = "Start Counting"
      this.isCounting = false;
    })
  }

  async resumeCounting()
  {
    this.backgroundMode.enable();

    await this.alertctrl.create(
    {
      header: "Resumed the counter",
      message: "The counter has been resumed. It will work in the background, so you do not have to leave the app open.",
      buttons: ["OK"]
    }).then(async alert =>
    {
      await alert.present();
      this.action = "Stop Counting"
      this.isCounting = true;
    })
  }

}
