import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition, SpeechRecognitionListeningOptionsAndroid, SpeechRecognitionListeningOptionsIOS } from '@ionic-native/speech-recognition';

declare var ApiAIPlugin: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  text: string;
  speechList : Array<string> = [];
  messages : Array<object> = [];
  androidOptions: SpeechRecognitionListeningOptionsAndroid;
  iosOptions: SpeechRecognitionListeningOptionsIOS;
  textBody: string;
  alternate: boolean;
  hideTime: boolean;
  newMessage: {};
  responseMessage: {};

  constructor(private ref: ChangeDetectorRef, private speech: SpeechRecognition, private tts: TextToSpeech, public navCtrl: NavController, public platform: Platform) {
      this.initializeApp()
      this.hideTime = true;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if(!this.hasPermission()){
        this.getPermission()
      }
    });
  }

  async SpeakText():Promise<any> {
    try{
      await this.tts.speak(this.text);
      console.log("Successfully spoke " + this.text)
    }
    catch(e){
      console.log(e)
    }
  };

  async SpeakResult(data):Promise<any> {
    try{
      const a = await this.SendTextFromVoice(data)
      // await this.tts.speak(a);
      // console.log("Successfully spoke " + a)
      alert(a);
    }
    catch(e){
      alert(e)
    }
  };

  listenForSpeech():void {
    this.androidOptions = {
        prompt: 'Speak into your phone!',
        matches: 1
    };

    this.iosOptions = {
        matches: 1
    };

    if(this.platform.is('android')){
      this.speech.startListening(this.androidOptions).subscribe(data => this.SendText(data), error => console.log(error));
    }
    else if(this.platform.is('ios')){
      this.speech.startListening(this.iosOptions).subscribe(data => this.speechList = data, error => console.log(error));
      console.log(this.speechList);
    }
  };

  async SendText(query):Promise<any> {
    try {
        await ApiAIPlugin.requestText(
          {
            query
          },
           (response) => {
                // place your result processing here
                console.log('3', response.result.fulfillment.speech)
                this.messages.push({
                  isHuman: false,
                  text: response.result.fulfillment.speech,
                  time: new Date().toLocaleTimeString().replace(/:\d+ /, ' ')
                });
                this.ref.detectChanges();
            },
            (error) => {
                // place your error processing here
                console.error(error);
            });
    } catch (e) {
        alert(e);
    }
  }

  async SendTextFromVoice(query):Promise<any> {
    try {
        console.log(query);
        await ApiAIPlugin.requestText(
            {
                query: query
            },
            function (response) {
                // place your result processing here
                let voiceBody = response;
                if(voiceBody){
                  return voiceBody.result.fulfillment.speech
                }
            },
            function (error) {
                // place your error processing here
                alert(error);
            });
    } catch (e) {
        alert(e);
    }
  }

  async getSupportedLanguages():Promise<Array<string>> {
    try{
      const languages = await this.speech.getSupportedLanguages();
      console.log(languages);
      return languages;
    }
    catch(e){
      console.error(e)
    }
  };

  async hasPermission():Promise<boolean> {
    try{
      const permission = await this.speech.hasPermission();
      console.log(permission)
      return permission;
    }
    catch(e){
      console.log(e)
    }
  };

  async getPermission():Promise<void> {
    try{
      const permission = await this.speech.requestPermission();
      console.log(permission)
      return permission;
    }
    catch(e){
      console.log(e)
    }
  };

  async isSpeechSupported():Promise<boolean> {
    const isAvailable = await this.speech.isRecognitionAvailable();
    console.log(isAvailable)
    return isAvailable;
  };

  async sendMessage():Promise<any> {

    this.messages.push({
      isHuman: true,
      text: this.newMessage,
      time: new Date().toLocaleTimeString().replace(/:\d+ /, ' ')
    });

    this.SendText(this.newMessage)

    delete this.newMessage;
  };
}
