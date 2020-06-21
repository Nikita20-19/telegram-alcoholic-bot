'use strict';

const {Telegraf} = require('telegraf');
const bot = new Telegraf(process.env.TOKEN);

const drinkResults = require('./functions.js');

const CHOOSE_DRINK_MESSAGE = `Выберите что пил`;

const SOBER_PHOTO = 'https://meme-arsenal.com/create/meme/363098';

const WINE_LIMITS = [100, 150];
const VODKA_LIMITS = [20, 40];
const BEER_LIMITS = [250, 500];

let drinkType;

const start = ctx => {
  try {
    ctx.deleteMessage();
  } catch (e) {
    console.log(e)
  }
  drinkResults.sendStartMessage(ctx, bot);
};

bot.action('success', ctx => {
  bot.telegram.sendPhoto(ctx.chat.id, SOBER_PHOTO);
  bot.telegram.sendMessage(ctx.chat.id, `Уверен?`, {
    'reply_markup': {
      'inline_keyboard': [
        [
          {text: 'Вернуться к выбору напитка', 'callback_data': 'chooseDrink'},
        ],
      ]
    }
  });
});

bot.action('chooseDrink', ctx => {
  bot.telegram.sendMessage(ctx.chat.id, CHOOSE_DRINK_MESSAGE, {
    'reply_markup': {
      'inline_keyboard': [
        [
          {text: 'Вино', 'callback_data': 'wine'},
        ],
        [
          {text: 'Водка', 'callback_data': 'vodka'},
        ],
        [
          {text: 'Пиво', 'callback_data': 'beer'},
        ]
      ]
    }
  });
});

bot.action('back', ctx => {
  ctx.deleteMessage();
  start(ctx)
});

bot.action('wine', ctx => {
  drinkType = 'wine';
  return analyzeDrinks(ctx, 'вина', WINE_LIMITS);
});

bot.action('vodka', ctx => {
  drinkType = 'vodka';
  return analyzeDrinks(ctx, 'водки', VODKA_LIMITS);
});

bot.action('beer', ctx => {
  drinkType = 'beer';
  return analyzeDrinks(ctx, 'пива', BEER_LIMITS);
});

bot.action('info', ctx => {
  return getDrinkInfo(ctx);
});

bot.command('reset', ctx => {
  start(ctx)
});

bot.launch();

