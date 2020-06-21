const axios = require('axios');

const SUCCESS_TEXT = 'Я сегодня не пил';
const CHOOSE_TEXT = 'Перейти к выбору напитка';
const HOW_MUCH_MESSAGE = `Запиши количество в милилитрах (рюмка водки - 50, коль что)`;

const NON_SOBER_PHOTO = `https://georgetowndrivingschool.com/promise/`;
const DRUNK_PHOTO = `https://en.dopl3r.com/memes/dank/son-do-you-dad-what-is-an-alcoholic-see-those-4-cars-an-alcoholic-would-see-8-but-dad-there-are-only2/218554`;

function sendStartMessage(ctx, bot) {
  let startMessage = `Приятно познакомиться ! \n Этот бот помогает больше узнать о том, что стоит пить, если собираешься за руль`;
  if (ctx.from.username === 'tshemsedinov') {
    startMessage += `\nРад Вам презентовать мою курсовую работу`;
  }
  if (ctx.from.username === 'Hik_kit_a') {
    startMessage += `\nПривет я, это твой бот а ты живи без забот`;
  }
  bot.telegram.sendMessage(ctx.chat.id, startMessage,
      {
        'reply_markup': {
          'inline_keyboard': [
            [
              {text: SUCCESS_TEXT, 'callback_data': 'success'}
            ],
            [
              {text: CHOOSE_TEXT, 'callback_data': 'chooseDrink'}
            ],
          ]
        }
      });
}

async function analyzeDrinks(ctx, drinkType, drinkLimits) {
  await bot.telegram.sendMessage(ctx.chat.id, HOW_MUCH_MESSAGE);
  bot.hears(/[0-20000]/, async ctx => {
    let numberOfMl = ctx.message.text;
    await bot.telegram.sendMessage(ctx.chat.id, `Ты выпил ${numberOfMl} ml ${drinkType}`);
    if (numberOfMl <= drinkLimits[0]) {
      await bot.telegram.sendMessage(ctx.chat.id, alcoholResponse(`30 - 60`));
      await bot.telegram.sendPhoto(ctx.chat.id, NON_SOBER_PHOTO);
    } else if (numberOfMl > drinkLimits[0] && numberOfMl <= drinkLimits[1]) {
      await bot.telegram.sendMessage(ctx.chat.id, alcoholResponse(`60 - 90`));
      await bot.telegram.sendPhoto(ctx.chat.id, NON_SOBER_PHOTO)
    } else {
      await bot.telegram.sendMessage(ctx.chat.id, `Лучше не садится сегодня за руль`);
      await bot.telegram.sendPhoto(ctx.chat.id, DRUNK_PHOTO);
    }
    await bot.telegram.sendMessage(ctx.chat.id, `Выпил снова?`,
        {
          'reply_markup': {
            'inline_keyboard': [
              [
                {text: `Вернуться к выбору напитка`, 'callback_data': 'back'}
              ],
              [
                {text: `Получить информацию о напитке`, 'callback_data': 'info'}
              ],
            ]
          }
        });
  });
}

function alcoholResponse(timeLimit) {
  return `Можешь садиться за руль через ${timeLimit} минут`
}

function getDrinkInfo(ctx) {
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

module.exports = {
  sendStartMessage,
  analyzeDrinks,
  getDrinkInfo
};
