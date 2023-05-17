import instaler from '@ffmpeg-installer/ffmpeg'
import axios from 'axios'
import ffmpg from 'fluent-ffmpeg'
import { createWriteStream } from 'fs'
import { resolve } from 'node:path'
import { removeFile } from './utils'


class OggConvertor {
  constructor() {
    ffmpg.setFfmpegPath(instaler.path)
  }
  
  toMp3(oggFile: string): Promise<string> {
    const mp3File = oggFile.replace('.ogg', '.mp3')
    return new Promise((resolve, reject) => {
      ffmpg(oggFile)
        .inputOptions('-t 30')
        .output(mp3File)
        .on('error', (err) => {
          removeFile(oggFile)
          reject(err)
        })
        .on('end', () => {
          removeFile(oggFile)
          resolve(mp3File)
        })
        .run()
    })
  }
  
  async create(url: URL, filename: string) {
    const oggFile = await this.download(url, filename)
    const mp3File = await this.toMp3(oggFile)
    return mp3File
    
  }
  
  async download(url: URL, filename: string) {
    const oggPath = resolve(`${__dirname}/../ogg/${filename}.ogg`)
    const response = await axios({
      method: 'GET',
      url: url.toString(),
      responseType: 'stream'
    })
    
    await new Promise((resolve, reject) => {
      const stream = createWriteStream(oggPath)
      response.data.pipe(stream)
      stream.on('finish', () => resolve(oggPath))
      stream.on('error', e => reject(e))
    })
    return oggPath
  }
  
}

export default new OggConvertor()
