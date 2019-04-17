import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { WindowRefService } from '../window-ref.service';

import * as Hark from 'hark';
import * as RecordRTC from 'recordrtc';

const AUDIO_SAMPLE_RATE_HERTZ = 44100;
const AUDIO_SAMPLE_ENCODING = "LINEAR16";
const AUDIO_SAMPLE_MEME_TYPE = "audio/wav";
const AUDIO_FILE_EXTENSIONS: any = {
  'audio/wav': 'wav'
}

const BACKEND_URL: string = environment.backendUrl;
const GOOGLE_SPEECH_PATH: string = environment.googleSpeechPath;

@Component({
  selector: 'app-google-speech',
  templateUrl: './google-speech.component.html',
  styleUrls: ['./google-speech.component.scss']
})
export class GoogleSpeechComponent implements OnInit {

  recording: boolean;
  waiting: boolean;

  mediaRecorder: any;

  audioStream: MediaStream;
  recordRTC: RecordRTC;

  recognizedSpeech: string;

  constructor(private windowRefService: WindowRefService, private httpClient: HttpClient) { }

  ngOnInit() {
  }
  record() {
    this.reset();
    const window = this.windowRefService.nativeWindow;
    const navigator = window.navigator;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(this.userMediaSuccess.bind(this), this.userMediaError.bind(this));
  }
  stop() {
    this.stoppedSpeaking();
  }
  reset() {
    this.recording = false;
    this.waiting = false;
    this.recognizedSpeech = null;
  }
  userMediaSuccess(stream: MediaStream) {
    this.recording = true;
    this.audioStream = stream;

    const speechEvents = Hark(stream, {});
    speechEvents.on('speaking', this.speaking.bind(this));
    speechEvents.on('stopped_speaking', this.stoppedSpeaking.bind(this));

    this.recordRTC = RecordRTC(stream,
      {
        type: 'audio',
        numberOfAudioChannels: 1, //very important line!! Cannot send audio wav to Google Speech
        recorderType: RecordRTC.StereoAudioRecorder,
        sampleRate: AUDIO_SAMPLE_RATE_HERTZ
      });

    this.recordRTC.startRecording();

  }
  userMediaError(error) {
    this.recording = false;
    console.log("ERROR", error);
  }
  speaking() {
    console.log('speaking');
  }
  stoppedSpeaking() {
    console.log('stopped_speaking');
    if (this.recording) {
      this.recordRTC.stopRecording(this.stoppedRecording.bind(this));
    }
  }

  stoppedRecording(audioVideoWebMUR) {
    this.recording = false;
    const blob = this.recordRTC.getBlob();
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const date = now.getUTCDay();
    const random = (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');

    const filename = 'RecordRTC-' + year + (month + 1) + date + '-' + random + '.' + AUDIO_FILE_EXTENSIONS[AUDIO_SAMPLE_MEME_TYPE];
    this.uploadSample(blob, {
      filename: filename,
      encoding: AUDIO_SAMPLE_ENCODING,
      memeType: AUDIO_SAMPLE_MEME_TYPE,
      sampleRateHertz: AUDIO_SAMPLE_RATE_HERTZ
    })
    this.recordRTC.getDataURL(this.stopTracks.bind(this))
  }
  stopTracks(dataURL) {
    this.audioStream.getTracks().map(track => {
      track.stop();
      console.log("STOPPED");
    })
  }

  uploadSample(blob, options) {
    const file = new File([blob], options.filename, { type: options.memeType });
    const formData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders({ 'enctype': 'multipart/form-data' });
    this.waiting = true;
    this.httpClient.post(BACKEND_URL + GOOGLE_SPEECH_PATH + "?sampleRateHertz=" + options.sampleRateHertz + "&encoding=" + options.encoding + "&languageCode=en-US",
      formData,
      { headers: headers })
      .toPromise()
      .then((audioSpeechResult: any) => {
        console.log(audioSpeechResult);
        this.waiting = false;

        const foundTranscription =
          audioSpeechResult.results
          && audioSpeechResult.results[0]
          && audioSpeechResult.results[0].alternatives
          && audioSpeechResult.results[0].alternatives[0];

        this.recognizedSpeech = foundTranscription ? audioSpeechResult.results[0].alternatives[0] : null;
        console.log("RETURNED", foundTranscription, this.recognizedSpeech);

      },
        (err: any) => {
          console.log(err);
          this.waiting = false;
        });

  }
}
