import {Configuration, OpenAIApi} from "openai";
import {createReadStream} from "fs";

export class OpenAI {
  constructor(token) {

    const configuration = new Configuration({
      apiKey: token,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(messages) {
    console.log(`:: messages `, messages);
    const response = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    })
    console.log(`:: response `, response.data);
    return response.data.choices[0].message;
  }

  async transcription(mp3Pah) {
    console.log(`:: mp3Pah `, mp3Pah);
    const response = await this.openai.createTranscription(createReadStream(mp3Pah),
      "whisper-1"
    );
    console.log(`:: response.data `, response.data);
    return response.data.text;
  }
}
