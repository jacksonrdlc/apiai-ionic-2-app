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
  voiceBody: string;
  alternate: boolean;
  hideTime: boolean;
  verbalResponse: boolean;
  newMessage: {};
  responseMessage: {};

  constructor(private ref: ChangeDetectorRef, private speech: SpeechRecognition, private tts: TextToSpeech, public navCtrl: NavController, public platform: Platform) {
      this.initializeApp()
      this.hideTime = true;
      this.verbalResponse = true;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if(!this.hasPermission()){
        this.getPermission()
      }
    });
  }

  async SpeakText(voice):Promise<any> {
    try{
      await this.tts.speak(voice);
      console.log("Successfully spoke")
    }
    catch(e){
      console.log(e)
    }
  }

  listenForSpeech():void {
    this.androidOptions = {
        prompt: 'Speak into your phone!',
        matches: 1
    };

    this.iosOptions = {
        matches: 1
    };

    if(this.platform.is('android')){
      this.speech.startListening(this.androidOptions).subscribe(
        (data) => {
          this.messages.push({
            isHuman: true,
            layout:'',
            text: data,
            time: new Date().toLocaleTimeString().replace(/:\d+ /, ' ')
          });
          this.SendTextFromVoice(data)
      }, (error) => {
          console.log(error)
      });
    }
    else if(this.platform.is('ios')){
      this.speech.startListening(this.iosOptions).subscribe(data => this.speechList = data, error => console.log(error));
      console.log(this.speechList);
    }
  }

  async SendText(query):Promise<any> {
    try {
        await ApiAIPlugin.requestText(
          {
            query,
            originalRequest: {
              source: 'WWT chat bot',
              data: 'messages'
            }
          },
           (response) => {
             console.log(JSON.stringify(response))
             console.log(JSON.stringify(response.result))
             let layout = response.result.fulfillment.data.layout;
             let speech = response.result.fulfillment;
               if(response.result.fulfillment.speech){
                 if(this.platform.is('ios')){
                    this.messages.push({
                      isHuman: false,
                      layout: layout,
                      text: speech,
                      time: new Date().toLocaleTimeString().replace(/:\d+ /, ' ')
                    });
                  this.ref.detectChanges();
                } else {
                  this.messages.push({
                      isHuman: false,
                      layout: '',
                      text: speech,
                      time: new Date().toLocaleTimeString().replace(/:\d+ /, ' ')
                    });
                  this.ref.detectChanges();
                }
               } else {
                 this.messages.push({
                  isHuman: false,
                  layout: '',
                  text: "I'm sorry. I could not find an answer to that request.",
                  time: new Date().toLocaleTimeString().replace(/:\d+ /, ' ')
                });
                this.ref.detectChanges();
               }
            },
            (error) => {
                console.error(error);
            });
    } catch (e) {
        alert(e);
    }
  }

  async SendTextFromVoice(query):Promise<any> {
    try {
        await ApiAIPlugin.requestText(
          {
            query
          },
           (response) => {
             if(response.result.fulfillment.speech){
                let voice = response.result.fulfillment.speech
                console.log('3', voice)
                this.messages.push({
                  isHuman: false,
                  layout: '',
                  text: voice,
                  time: new Date().toLocaleTimeString().replace(/:\d+ /, ' ')
                });
                this.ref.detectChanges();
                this.SpeakText(voice)
             } else {
               let voice = "I'm sorry. I could not find an answer to that request."
                console.log('3', voice)
                this.messages.push({
                  isHuman: false,
                  layout: response.result.fulfillment.data.layout,
                  text: voice,
                  time: new Date().toLocaleTimeString().replace(/:\d+ /, ' ')
                });
                this.ref.detectChanges();
                this.SpeakText(voice)
             }
            },
            (error) => {
                console.error(error);
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
  }

  async hasPermission():Promise<boolean> {
    try{
      const permission = await this.speech.hasPermission();
      console.log(permission)
      return permission;
    }
    catch(e){
      console.log(e)
    }
  }

  async getPermission():Promise<void> {
    try{
      const permission = await this.speech.requestPermission();
      console.log(permission)
      return permission;
    }
    catch(e){
      console.log(e)
    }
  }

  async isSpeechSupported():Promise<boolean> {
    const isAvailable = await this.speech.isRecognitionAvailable();
    console.log(isAvailable)
    return isAvailable;
  }

  async sendMessage():Promise<any> {

    this.messages.push({
      isHuman: true,
      layout: '',
      text: this.newMessage,
      time: new Date().toLocaleTimeString().replace(/:\d+ /, ' ')
    });

    this.SendText(this.newMessage)

    delete this.newMessage;
  }

  buildCardLayout(data) {
      
  }
}
