import { ChatCompletionRequestMessage } from 'openai/api'
import { Telegraf, session, Context } from 'telegraf'
import { message } from 'telegraf/filters'
import ogg from './OggConvertor'
import { OpenAI } from './OpenAI'
import { code } from 'telegraf/format'
import { config } from 'dotenv'

config()

if (!process.env.TELEGRAM_TOKEN) {
  throw new Error('TELEGRAM_TOKEN must be provided!')
}
if (!process.env.OPENAI_TOKEN) {
  throw new Error('OPENAI_TOKEN must be provided!')
}
const bot = new Telegraf(process.env.TELEGRAM_TOKEN)
const openAI = new OpenAI(process.env.OPENAI_TOKEN)

bot.use(session())
declare module 'telegraf' {
  interface Context {
    session: {
      messages: Array<ChatCompletionRequestMessage>
    }
  }
}
const INIT_SESSION: Context['session'] = {
  messages: []
}
bot.command('new', async (ctx) => {
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
    await ctx.sendChatAction('record_voice')
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = String(ctx.message.from.id)
    const mp3File = await ogg.create(link, userId)
    const text = await openAI.transcription(mp3File)
    await ctx.reply(code(text))
    await ctx.sendChatAction('typing')
    ctx.session.messages.push({
      'content': text,
      'role': 'user'
    })
    const response = await openAI.chat(ctx.session.messages)
    if (!response) {
      throw new Error('No response from OpenAI')
    }
    await ctx.reply(response.content)
    ctx.session.messages.push({
      'content': response.content,
      'role': 'assistant',
    })
  } catch (e ) {
    console.log(`:: e `, e)
    await ctx.reply(code('Error: ' + (e as Error).message))
  }
})

bot.on(message('text'), async (ctx) => {
  try {
    ctx.session ??= INIT_SESSION
    await ctx.sendChatAction('typing')
    const text = ctx.message.text
    console.log(`:: text `, text)
    ctx.session.messages.push({
      'content': text,
      'role': 'user',
    })
    console.log(`:: ctx.session.messages `, ctx.session.messages)
    const response = await openAI.chat(ctx.session.messages)
    if (!response) {
      throw new Error('No response from OpenAI')
    }
    await ctx.reply(response.content)
    ctx.session.messages.push({
      'content': response.content,
      'role': 'assistant'
    })
  } catch (e) {
    console.log(`:: e `, e)
    await ctx.reply(code('Error: ' + (e as Error).message))
  }
})
