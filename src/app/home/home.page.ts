import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit
{
  steps: any;
  error: any = null;

  constructor()
  {}

  ngOnInit()
  {
    console.log("Page Loaded")


  }

}
