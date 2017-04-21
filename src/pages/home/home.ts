import { Component } from '@angular/core';
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
  androidOptions: SpeechRecognitionListeningOptionsAndroid;
  iosOptions: SpeechRecognitionListeningOptionsIOS;
  textBody: string;
  // voiceBody: {};

  constructor(private speech: SpeechRecognition, private tts: TextToSpeech, public navCtrl: NavController, public platform: Platform) {

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

  async SpeakResult(speech):Promise<any> {
    try{
      await this.tts.speak(speech);
      console.log("Successfully spoke " + speech)
    }
    catch(e){
      console.log(e)
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
      this.speech.startListening(this.androidOptions).subscribe(data => this.SendTextFromVoice(data), error => console.log(error));
    }
    else if(this.platform.is('ios')){
      this.speech.startListening(this.iosOptions).subscribe(data => this.speechList = data, error => console.log(error));
      console.log(this.speechList);
    }
  };

  async SendText():Promise<any> {
    try {
        console.log(this.textBody);
        await ApiAIPlugin.requestText(
            {
                query: this.textBody
            },
            function (response) {
                // place your result processing here
                alert(response.result.fulfillment.speech);
            },
            function (error) {
                // place your error processing here
                alert(error);
            });
    } catch (e) {
        alert(e);
    }
  }

  async SendTextFromVoice(query):Promise<any> {
    try {
        console.log(this.textBody);
        await ApiAIPlugin.requestText(
            {
                query: query
            },
            function (response) {
                // place your result processing here
                let voiceBody = response;
                if(voiceBody){
                  alert(voiceBody.result.fulfillment.speech)
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

}
