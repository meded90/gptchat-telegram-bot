import { AxiosRequestConfig } from 'axios'
import { ReadStream } from 'fs'
import { Configuration, OpenAIApi } from 'openai'
import { createReadStream } from 'node:fs'
import { ChatCompletionRequestMessage } from 'openai/api'

declare module 'openai' {
  export interface OpenAIApi {
    createTranscription(file: File| ReadStream, model: string, prompt?: string, responseFormat?: string, temperature?: number, language?: string, options?: AxiosRequestConfig): Promise<any>
  }
}

export class OpenAI {
  private openai: OpenAIApi
  
  constructor(token: string) {
    
    const configuration = new Configuration({
      apiKey: token,
    })
    this.openai = new OpenAIApi(configuration)
  }
  
  async chat(messages: Array<ChatCompletionRequestMessage>) {
    console.log(`:: messages `, messages)
    
    const response = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
      
    })
    
    return response.data.choices[0].message
  }
  
  async transcription(mp3Pah: string) {
    console.log(`:: mp3Pah `, mp3Pah)
    const response = await this.openai.createTranscription(
      createReadStream(mp3Pah),
      'whisper-1',
      undefined,
      undefined,
      undefined,
      'ru',
    )
    return response.data.text
  }
}
