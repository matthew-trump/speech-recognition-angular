import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular Speech Recognition Demo';
  routes: any[] = [
    {
      route: [''],
      label: "Home"
    },
    {
      route: ['google-speech'],
      label: "Google Speech"
    }
  ]
}
