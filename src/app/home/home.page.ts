import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, Platform, ModalController } from '@ionic/angular'

import { Stepcounter } from '@ionic-native/stepcounter/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';

import { AnalyzeDataService } from '../Services/analyze-data/analyze-data.service';

import { AnalysisComponent } from '../analysis/analysis.component';

const startingTheDay: number = 0;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy
{
  steps: number = 0;      // number of steps that have been counted since the start
  isCounting = false;     // bool to check if the app has started counting
  canCount = false;       // bool to know if the device can count
  intervalCounting: any;  // how often the step count will be updated on the screen

  actionButton: string = "Initializing...";
  action: string = "Not Counting"

  points;

  constructor(private stepcounter: Stepcounter,
              private storage: NativeStorage,
              private platform: Platform,
              private backgroundMode: BackgroundMode,
              private geo: BackgroundGeolocation,
              private diagnostic: Diagnostic,
              private settings: OpenNativeSettings,
              private loadingctrl: LoadingController,
              private alertctrl: AlertController,
              private modalctrl: ModalController,
              private analyzeData: AnalyzeDataService
              )
  {}

  ngOnInit()
  {
    this.platform.ready().then(() =>
    {
      // this.initialize()
    })
  }

  ngOnDestroy()
  {
    if (!this.backgroundMode.isActive())
    {
      clearInterval(this.intervalCounting)
    }
  }

  async initialize()
  {
    await this.loadingctrl.create(
    {
      message: "Initializing StepCounter Plugin API...",
      animated: true,
      spinner: "lines",
      cssClass: 'custom-loading'
    }).then(async loading =>
    {
      await loading.present().then(async () =>
      {
        await this.stepcounter.deviceCanCountSteps().then(deviceCanCount =>
        {
          if (deviceCanCount)
            this.deviceCanCount(startingTheDay);
          else
            this.deviceCannotCount();

          loading.dismiss();
        });
      });
    });
  }

  async deviceCanCount(countOffset)
  {
    this.stepcounter.start(countOffset).then(async () =>
    {
      this.backgroundMode.enable();

      this.actionButton = "Stop Counting";
      this.isCounting = true;
      this.canCount = true;
      this.action = "Counting..."

      this.intervalCounting = setInterval(async () =>
      {
        this.steps = await this.stepcounter.getStepCount()
      }, 1000)

      if (this.diagnostic.isGpsLocationEnabled())
        this.geo.configure(
        {
          desiredAccuracy: 1,
          stationaryRadius: 5,
          distanceFilter: 5,
          interval: 5000,
          fastestInterval: 2500,
          activitiesInterval: 5000,
          startOnBoot: true,
          stopOnTerminate: false,
          notificationsEnabled: false,
          startForeground: true,
          notificationTitle: "Background Location Usage",
          notificationText: "This app uses your location on the background, in order to track the distance you have walked. NOTE: We do NOT use this information in any way."
        })
      else
        await this.alertctrl.create(
        {
          header: "Error",
          message: "Geolocation is not enabled on this device. Please enable it and restart the application.",
          buttons: [
          {
            text: 'Settings',
            role: 'ok',
            handler: () =>
            {
              this.settings.open("location")
            }
          }]
        }).then(alert =>
        {
          alert.present();
        })
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
      this.actionButton = "Start Counting";
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
      this.actionButton = "Start Counting"
      this.isCounting = false;
      this.action = "Not Counting"
      this.geo.stop();
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
      this.actionButton = "Stop Counting"
      this.isCounting = true;
      this.action = "Counting...";
      this.geo.start();
    })
  }

  async analyze()
  {
    await this.geo.getLocations().then(locations =>
    {
      this.points = locations
    })

    const data =
    {
      steps: this.steps,
      points: this.points
    }

    await this.loadingctrl.create(
    {
      message: "Analyzing Data...",
      animated: true,
      spinner: "lines",
      cssClass: 'custom-loading'
    }).then(async loading =>
    {
      loading.present()

      this.analyzeData.analyze(data).then(analysis =>
      {
        this.modalctrl.create(
        {
          component: AnalysisComponent,
          componentProps: { analysis },
          backdropDismiss: true
        }).then(async modal =>
        {
          await loading.dismiss();
          modal.present();
        })
      })
    })
  }

}
