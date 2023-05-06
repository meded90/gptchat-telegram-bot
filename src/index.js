import {Telegraf, session} from "telegraf"
import config from "config"
import {message} from "telegraf/filters";
import ogg from "./OggConvertor.js";
import {OpenAI} from "./OpenAI.js";
import {code, pre} from "telegraf/format";

const INIT_SESSION = {
  messages: []
}
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))
const openAI = new OpenAI(config.get('OPENAI_TOKEN'))

bot.use(session())
bot.command("new", async (ctx) => {
  ctx.session = INIT_SESSION
  await ctx.reply('Welcome to the voice chat bot')
})

bot.command('start', async (ctx) => {
  ctx.session = INIT_SESSION
  await ctx.reply('Welcome to the voice chat bot')
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


bot.on(message('voice'), async (ctx) => {
  try {
    ctx.session ??= INIT_SESSION
    await ctx.sendChatAction('record_voice');
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = String(ctx.message.from.id)
    const mp3File = await ogg.create(link, userId)
    const text = await openAI.transcription(mp3File)
    await ctx.reply(code(text))
    await ctx.sendChatAction('typing');
    ctx.session.messages.push({
      "content": text,
      "role": "user"
    } )
    const response = await openAI.chat(ctx.session.messages)
    await ctx.reply(response.content)
    ctx.session.messages.push({
      "content": response.content,
      "role": "assistant",
      "name":ctx.message.from.first_name
    })
  } catch (e) {
    console.log(`:: e `, e);
    await ctx.reply(pre('Error: ' + e.message))
  }
})

bot.on(message('text'), async (ctx) => {
  try {
    ctx.session ??= INIT_SESSION
    await ctx.sendChatAction('typing');
    const text = ctx.message.text
    console.log(`:: text `, text);
    ctx.session.messages.push({
      "content": text,
      "role": "user",
      "name":ctx.message.from.first_name
    } )
    const response = await openAI.chat(ctx.session.messages)
    await ctx.reply(response.content)
    ctx.session.messages.push({
      "content": response.content,
      "role": "assistant"
    })
  } catch (e) {
    console.log(`:: e `, e);
    await ctx.reply(pre('Error: ' + e.message))
  }
})
