import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GoogleSpeechComponent } from './google-speech/google-speech.component';

const routes: Routes = [
  { path: 'google-speech', pathMatch: 'full', component: GoogleSpeechComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
