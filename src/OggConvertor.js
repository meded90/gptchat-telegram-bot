import axios from "axios";
import {
  createWriteStream
} from "fs";
import {dirname, resolve} from "path";
import {fileURLToPath} from "url";
import ffmpg from "fluent-ffmpeg";
import instaler from "@ffmpeg-installer/ffmpeg";
import {removeFile} from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

class OggConvertor {
  constructor() {
    ffmpg.setFfmpegPath(instaler.path)
  }

  toMp3(oggFile) {
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

  async create(url, filename) {
    const oggFile = await this.download(url, filename)
    const mp3File = await this.toMp3(oggFile)
    return mp3File

  }

  async download(url, filename) {
    const oggPath = resolve(`${ __dirname }/../ogg/${ filename }.ogg`)
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    await new Promise((resolve, reject) => {
      const stream = createWriteStream(oggPath);
      response.data.pipe(stream);
      stream.on('finish', () => resolve(oggPath));
      stream.on('error', e => reject(e));
    });
    return oggPath
  }

}

export default new OggConvertor();
