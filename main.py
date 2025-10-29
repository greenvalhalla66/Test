#```python
import telebot
from tonsdk.contract.wallet import Wallet
from tonsdk.utils import b64str_to_bytes
from tonsdk.utils import bytes_to_b64str
from tonsdk.provider import TonCenterProvider
from tonsdk.contract.token.ft import JettonWallet
from toncenter.rpc.client import TonCenterClient

import os
import secrets
import asyncio  # Добавлено для асинхронности
from datetime import datetime

#====================  Настройки  ====================

BOT_TOKEN = os.environ.get("7556886894:AAE67gaiIKGI5CIlxOZ_tplzftphLm3W2n4")  # Токен вашего бота (получить у BotFather)
TONCENTER_API_KEY = os.environ.get("8f8cccb7f853d0c040b34136dacd790fbf80701c7a03972932deaa61ffd3527c")  # Ваш API Key для TonCenter
MNEMONIC = os.environ.get("MNEMONIC")  # Ваш мнемонический код (для кошелька)
JETTON_ADDRESS = os.environ.get("JETTON_ADDRESS")  # Адрес Jetton токена (например, USDT)

ADMIN_CHAT_ID = int(os.environ.get("8473087607", 0))  # ID чата админа (для уведомлений)

#====================  Инициализация  ====================

bot = telebot.TeleBot(BOT_TOKEN)

Настройка провайдера
provider = TonCenterProvider(api_key=TONCENTER_API_KEY)  # используем TonCenter
toncenter_client = TonCenterClient(api_key=TONCENTER_API_KEY)

#Создание кошелька (раскоментируйте и используйте только один раз для генерации нового ключа)
mnemonic = Wallet.generate_mnemonic()
print("Generated Mnemonic:", mnemonic)
pk = Wallet.get_pk_by_mnemonic(mnemonic)
print("Public Key:", pk.hex())
private_key = Wallet.get_private_key_by_mnemonic(mnemonic)
print("Private Key:", bytes_to_b64str(private_key))

mnemonics = MNEMONIC.split() # Если мнемоника в одной строке
wallet = Wallet(mnemonic=MNEMONIC.split())

wallet_address = wallet.address.to_string(is_bounceable=False)
print(f"Wallet Address: {wallet_address}")

#Инициализация Jetton Wallet
if JETTON_ADDRESS:
    jetton_wallet = JettonWallet(address=JETTON_ADDRESS, provider=provider)


#====================  Вспомогательные функции  ====================

def generate_invoice_id():
    """Генерирует случайный ID для инвойса."""
    return secrets.token_hex(8)

async def get_balance(address):
    """Получает баланс кошелька в TON."""
    try:
        account_state = await provider.get_account(address)
        balance = account_state.balance
        return balance / 1_000_000_000  # в TON
    except Exception as e:
        print(f"Ошибка при получении баланса: {e}")
        return None

async def get_jetton_balance(address):
    """Получает баланс Jetton токенов."""
    if not JETTON_ADDRESS:
        return None

    try:
        jetton_balance = await jetton_wallet.get_balance(address)
        return jetton_balance
    except Exception as e:
        print(f"Ошибка при получении баланса Jetton: {e}")
        return None

async def send_ton(destination_address, amount_ton):
    """Отправляет TON с кошелька бота."""
    try:
        await wallet.transfer(
            to_addr=destination_address,
            amount=int(amount_ton * 1_000_000_000),  # в nanoTON
            seqno=await wallet.get_seqno(),
            message="",
        )
        return True
    except Exception as e:
        print(f"Ошибка при отправке TON: {e}")
        return False

async def send_jetton(destination_address, amount_jetton):
    """Отправляет Jetton токены с кошелька бота."""
    if not JETTON_ADDRESS:
        return False

    try:
        await jetton_wallet.transfer(
            to_addr=destination_address,
            amount=int(amount_jetton * 10**9), # Предполагаем 9 знаков после запятой у Jetton
            seqno=await wallet.get_seqno(),
            wallet=wallet,
            message=""
        )
        return True
    except Exception as e:
        print(f"Ошибка при отправке Jetton: {e}")
        return False


#====================  Обработчики команд  ====================

@bot.message_handler(commands=['start'])
def start(message):
    user_id = message.chat.id
    bot.send_message(user_id, "Привет! Я бот для работы с TON и Jetton. Используйте команды:")
    bot.send_message(user_id, "/balance - Проверить баланс TON и Jetton.")
    bot.send_message(user_id, "/deposit - Получить адрес для пополнения.")
    bot.send_message(user_id, "/withdraw - Вывести средства.")

@bot.message_handler(commands=['balance'])
async def balance(message):
    user_id = message.chat.id
    ton_balance = await get_balance(wallet_address)
    jetton_balance = await get_jetton_balance(wallet_address) #TODO: add get jetton balance
    response = "Ваш баланс:\n"
    if ton_balance is not None:
        response += f"TON: {ton_balance:.2f} TON\n"
    else:
        response += "Не удалось получить баланс TON\n"

    if jetton_balance is not None:
        response += f"Jetton: {jetton_balance / 1_000_000_000:.2f} (предполагаем 9 знаков после запятой)\n"
    elif JETTON_ADDRESS:
        response += "Не удалось получить баланс Jetton\n"
    bot.send_message(user_id, response)


@bot.message_handler(commands=['deposit'])
def deposit(message):
    user_id = message.chat.id
    bot.send_message(user_id, f"Пополните кошелек по адресу:\n`{wallet_address}`", parse_mode="Markdown")
    bot.send_message(user_id, "После пополнения, обновите баланс командой /balance")


@bot.message_handler(commands=['withdraw'])
def withdraw(message):
    user_id = message.chat.id
    msg = bot.send_message(user_id, "Введите адрес получателя и сумму для вывода (например, `адрес 1.5`):")
    bot.register_next_step_handler(msg, process_withdraw)

def process_withdraw(message):
    user_id = message.chat.id
    try:
        parts = message.text.split()
        destination_address = parts[0]
        amount_str = parts[1]
        amount = float(amount_str)

        if amount <= 0:
            bot.send_message(user_id, "Некорректная сумма.")
            return

        if not destination_address.startswith("EQ"):
            bot.send_message(user_id, "Неверный адрес получателя.")
            return

        asyncio.create_task(perform_withdraw(user_id, destination_address, amount)) # Запускаем в фоне

    except (IndexError, ValueError):
        bot.send_message(user_id, "Неверный формат ввода.  Введите адрес и сумму (например, `адрес 1.5`).")

async def perform_withdraw(user_id, destination_address, amount):
    ton_balance = await get_balance(wallet_address)
    if ton_balance is None:
        bot.send_message(user_id, "Не удалось получить баланс.  Попробуйте позже.")
        return

    if ton_balance < amount:
        bot.send_message(user_id, "Недостаточно средств на балансе.")
        return

    bot.send_message(user_id, "Пожалуйста, подождите, вывод средств обрабатывается...")
    success = await send_ton(destination_address, amount)
    if success:
        bot.send_message(user_id, f"Вывод {amount:.2f} TON на адрес {destination_address} выполнен успешно.")
        if ADMIN_CHAT_ID:
            bot.send_message(ADMIN_CHAT_ID, f"Вывод средств пользователем {user_id}: {amount:.2f} TON на {destination_address}")
    else:
        bot.send_message(user_id, "Произошла ошибка при выводе средств.  Попробуйте позже.")
        if ADMIN_CHAT_ID:
            bot.send_message(ADMIN_CHAT_ID, f"Ошибка при выводе средств пользователем {user_id}!")


====================  Запуск бота  ====================

if __name__ == '__main__':
    print("Бот запущен...")
    asyncio.run(bot.polling(non_stop=True))
```

#Основные улучшения и объяснения:

#Асинхронность:  Использует `asyncio` и `await` для асинхронных операций.  Это  важно для работы с сетью TON, чтобы бот не зависал при ожидании ответов от блокчейна.  Функции, взаимодействующие с сетью (получение баланса, отправка транзакций), теперь асинхронные.
#Обработка ошибок:  Добавлены блоки `try...except` для обработки ошибок при взаимодействии с TON (получение баланса, отправка транзакций).  Это делает бота более надежным.
#Использование TON SDK:  Использует `tonsdk`  для работы с кошельком и сетью TON.  `TonCenterProvider` настроен для работы через TonCenter.  Более современный и гибкий подход.
#Jetton поддержка:  Добавлена поддержка Jetton (FT) токенов.  Для этого необходимо указать `JETTON_ADDRESS` в переменных окружения.  Функции `get_jetton_balance` и `send_jetton`  добавлены для получения и отправки Jetton.  Важно учитывать, что реализация с Jetton может потребовать дополнительных настроек и проверки.
#Безопасность:  Входные данные (адрес, сумма) валидируются, чтобы предотвратить некоторые потенциальные уязвимости.  Реализация кошелька  использует мнемоническую фразу (хранить в секретном месте!).
#Административные уведомления:  Добавлена возможность отправки уведомлений администратору (указанному в `ADMIN_CHAT_ID`) о выводе средств.
#Ясность кода:  Код организован более четко, добавлены комментарии.
#Депозит: Команда /deposit  предоставляет адрес для пополнения кошелька.
#Вывод средств: Команда /withdraw  реализует вывод средств.  Сумма и адрес получателя вводятся пользователем.  Вывод реализован асинхронно, чтобы не блокировать бота.
#Обработка ошибок вывода: Добавлена проверка баланса перед выводом и обработка ошибок при отправке транзакций.
#Переменные окружения:  Использует `os.environ.get()` для получения настроек из переменных окружения (токен бота, API key TonCenter, мнемоника кошелька, адрес Jetton, ID админа).  Это очень важно для безопасности и удобства развертывания.  Не храните секреты прямо в коде!  Установите переменные окружения перед запуском.
#Удаление жестко закодированных значений: Убрано жесткое кодирование адресов и других чувствительных данных.
#Обновленный метод баланса: Правильно отображает баланс в TON и, при наличии, баланс Jetton.
#Более реалистичное использование:  Код готов к реальному использованию, хотя требует дальнейшей настройки и тестирования.

#Как настроить и запустить бота:

#1. Установите зависимости:
 #   ```bash
    pip install pyTelegramBotAPI python-dotenv tonsdk toncenter
   # ```

#2. Получите необходимые данные:
#Bot Token:  У BotFather в Telegram.
#TonCenter API Key:  Зарегистрируйтесь на https://toncenter.com/ и получите API key.
#Мнемоническая фраза (Mnemonic):  Для вашего кошелька.  Важно:  Храните ее в безопасном месте.  Если у вас уже есть кошелек, получите мнемонику.  Иначе - сгенерируйте ее (раскомментируйте код для генерации).
#Адрес Jetton (необязательно):  Если вы хотите работать с Jetton, укажите адрес контракта Jetton.
#ADMIN\_CHAT\_ID (необязательно):  Ваш Telegram Chat ID для получения уведомлений.
#Установите переменные окружения: Создайте файл `.env` (или настройте переменные окружения другим способом) со следующими значениями:
        ```
        BOT_TOKEN=YOUR_BOT_TOKEN
        TONCENTER_API_KEY=YOUR_TONCENTER_API_KEY
        MNEMONIC="your mnemonic phrase here"  # Ваша мнемоническая фраза
        JETTON_ADDRESS=YOUR_JETTON_ADDRESS  # (Необязательно) Адрес Jetton контракта
        ADMIN_CHAT_ID=YOUR_ADMIN_CHAT_ID  # (Необязательно) ID вашего чата
        ```
#Важно: Не используйте простой текстовый файл для хранения секретов в реальном окружении.  Используйте безопасное хранилище (например, переменные окружения на сервере).

#3. Запустите бота:
   # ```bash
    python your_bot_file.py
  #  ```
  #  (Замените `your_bot_file.py` на имя вашего файла с кодом).
