var Telegraf = require('../lib/telegraf')

var telegraf = new Telegraf(process.env.BOT_TOKEN)

telegraf.on('text', function * () {
  yield this.reply('Coke or Pepsi?', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Coke', callback_data: 'Coke' },
        { text: 'Pepsi', callback_data: 'Pepsi' }
      ]]
    }
  })
   yield this.replyWithPhoto({
    source: '/Users/dotcypress/projects/github/telegraf/test.jpeg'
  })
})

telegraf.on('callback_query', function * () {
  yield this.answerCallbackQuery()
  yield this.reply(`Oh, ${this.callbackQuery.data}! Great choise`)
})

telegraf.startPolling()
