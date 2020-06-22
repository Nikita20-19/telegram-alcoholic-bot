'use strict';

const {Telegraf} = require('telegraf');
const axios = require('axios');
const bot = new Telegraf(process.env.TOKEN);

const functions = require('./functions.js');

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
  functions.sendStartMessage(ctx, bot);
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
  return functions.analyzeDrinks(ctx, bot, 'вина', WINE_LIMITS);
});

bot.action('vodka', ctx => {
  drinkType = 'vodka';
  return functions.analyzeDrinks(ctx, bot, 'водки', VODKA_LIMITS);
});

bot.action('beer', ctx => {
  drinkType = 'beer';
  return functions.analyzeDrinks(ctx, bot, 'пива', BEER_LIMITS);
});

bot.action('info', ctx => {
  return getDrinkInfo(ctx, bot);
});

bot.command('reset', ctx => {
  start(ctx)
});

bot.command('start', ctx => {
  start(ctx)
});

bot.launch();

function getDrinkInfo(ctx, bot) {
  return axios({
    "method": "GET",
    "url": "https://the-cocktail-db.p.rapidapi.com/search.php",
    "headers": {
      "content-type": "application/octet-stream",
      "x-rapidapi-host": "the-cocktail-db.p.rapidapi.com",
      "x-rapidapi-key": "ebcdc58796msh60b2717a05cec71p105cf0jsn8c1ef2eea50c",
      "useQueryString": true
    }, "params": {
      "i": drinkType
    }
  })
      .then((response) => {
        bot.telegram.sendMessage(ctx.chat.id, response.data.ingredients[0].strDescription);
        bot.telegram.sendMessage(ctx.chat.id, `Градус напитка ${response.data.ingredients[0].strABV}`);
      })
      .catch((error) => {
        console.log(error)
      })
}

