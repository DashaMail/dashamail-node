# @dashamail/node

Официальный Node.js SDK для [DashaMail REST API v2](https://dashamail.ru/api/) — адресные
базы, рассылки, автоматизации, транзакционные письма, отчёты, диалоги, обработка входящей
почты и оптимизация изображений из одного клиента без единой зависимости, кроме встроенных
модулей Node `http`/`https`.

## Требования

- Node.js 12 или новее (только стандартная библиотека)

## Установка

```bash
npm install @dashamail/node
```

Пакет опубликован в scope `@dashamail` (голое имя `dashamail` на npm занято сторонним
неофициальным проектом).

## Где взять API-ключ

Личный кабинет → Аккаунт → API и интеграции. Обращайтесь с ним как с паролем: он действует
от имени всего аккаунта.

## Быстрый старт

```js
const DashaMail = require('@dashamail/node');

const dashamail = new DashaMail('YOUR_API_KEY');

const balance = await dashamail.account.balance();
console.log(balance.data.balance);

const created = await dashamail.lists.create('Newsletter');
await dashamail.lists.addMember(created.data.list_id, 'subscriber@example.com', { merge_1: 'Иван' });

await dashamail.transactional.send(
  'subscriber@example.com',
  'sender@yourdomain.com',
  '<p>Спасибо за подписку!</p>',
  { subject: 'Добро пожаловать' }
);
```

Типы TypeScript идут в комплекте (`index.d.ts`) — отдельный пакет `@types/` не нужен.

Более полный пример — в [`examples/quickstart.js`](examples/quickstart.js), а полный
справочник параметров каждого эндпоинта — на [dashamail.ru/api](https://dashamail.ru/api/):
SDK повторяет его метод в метод. Необязательные параметры передаются обычным объектом с
теми же именами полей, что и в API (snake_case, например `merge_1`, `from_email`).

## Ресурсы

`DashaMail` — это объект с одним свойством на каждый раздел API. Каждый метод возвращает
Promise, который разрешается в [`Response`](src/response.js) (оборачивает полезную нагрузку
`data`, перебирается через `for...of`, если это список) либо отклоняется с `ApiException`.

| Свойство           | Класс           | Что покрывает |
|---------------------|-----------------|--------|
| `.lists`          | `Lists`         | Адресные базы, подписчики, дополнительные поля, импорт |
| `.segments`       | `Segments`      | Сохранённые сегменты подписчиков |
| `.campaigns`      | `Campaigns`     | Рассылки: черновик, запуск, пауза, A/B-тесты, вложения, папки |
| `.automations`    | `Automations`   | Письма по событиям подписчика |
| `.workflows`      | `Workflows`     | Сценарии визуального конструктора |
| `.templates`      | `Templates`     | Сохранённые HTML-шаблоны и шаблонные рассылки |
| `.reports`        | `Reports`       | Статистика рассылок, лента событий, разбивки по кликам/возвратам/гео, результаты A/B |
| `.transactional`  | `Transactional` | Одиночные транзакционные письма: отправка, статус, журнал, статистика |
| `.account`        | `Account`       | Баланс, отправители, домены отправки, webhooks |
| `.dialogs`        | `Dialogs`       | Ответы подписчиков на рассылки |
| `.router`         | `Router`        | Обработка входящей почты: домены, правила маршрутизации, сохранённые письма |
| `.images`         | `Images`        | Уменьшение веса изображения перед вставкой в рассылку |

## Работа с ответом

```js
const members = await dashamail.lists.members(listId, { limit: 100 });

for (const member of members) {   // Response — итерируемый объект
  console.log(member.email);
}

members.length;                   // число записей на этой странице
members.data;                     // сырой массив/объект, если перебирать не нужно
members.hasMore();                // true, если есть следующая страница (см. «Пагинация» ниже)
```

## Пагинация

Списочные эндпоинты (`lists.members()`, `lists.unsubscribed()`, `transactional.log()` и
другие) не возвращают общее количество записей — вместо этого DashaMail сообщает, есть ли
ещё страница:

```js
let start = 0;
for (;;) {
  const page = await dashamail.lists.members(listId, { start, limit: 100 });
  for (const member of page) { /* ... */ }
  start += page.getLimit();
  if (!page.hasMore()) break;
}
```

## Обработка ошибок

Любой ответ не из диапазона 2xx бросает подкласс `ApiException`, выбранный по HTTP-статусу:

| Исключение                  | HTTP-статус |
|-------------------------------|------|
| `AuthenticationException`  | 401 |
| `PaymentRequiredException` | 402 |
| `AuthorizationException`   | 403 |
| `NotFoundException`        | 404 |
| `ConflictException`        | 409 |
| `PayloadTooLargeException` | 413 |
| `ValidationException`      | 422 |
| `RateLimitException`       | 429 |
| `ServerException`          | 5xx |

```js
const { ApiException, RateLimitException } = require('@dashamail/node');

try {
  await dashamail.campaigns.create({ list_id: 1, subject: 'Hi', from_email: 'a@b.com', from_name: 'A' });
} catch (err) {
  if (err instanceof RateLimitException) {
    await sleep((err.getRetryAfter() || 60) * 1000);
  } else if (err instanceof ApiException) {
    // err.apiCode     — собственный устойчивый код ошибки DashaMail (см. https://dashamail.ru/api/errors/)
    // err.httpStatus  — HTTP-статус ответа
    // err.details     — дополнительный структурированный контекст от API, если есть
    console.error(err.apiCode, err.message);
  } else {
    throw err;
  }
}
```

Если ответ вообще не пришёл (обрыв DNS, TLS, таймаут...), отклонение происходит с
`NetworkException`.

## Изображения

`POST /images/optimize` — единственный эндпоинт, у которого вход и выход не просто JSON:

```js
const fs = require('fs');

// Из Buffer, уже загруженного в память:
const result = await dashamail.images.optimize(fs.readFileSync('banner.png'), { max_width: 1600 });
fs.writeFileSync('banner-optimized.png', Buffer.from(result.data.image, 'base64'));

// Прямо с диска, без предварительной загрузки в Buffer:
const result2 = await dashamail.images.optimizeFile('/path/to/banner.png');

// То же самое, но без промежуточного base64 — сразу сырые байты:
const binary = await dashamail.images.optimizeFileBinary('/path/to/banner.png');
binary.saveTo('/path/to/banner-optimized.png');
```

## Расширенная настройка

```js
const dashamail = new DashaMail('YOUR_API_KEY', {
  timeout: 60000,                             // миллисекунды, по умолчанию 30000
  baseUrl: 'https://api.dashamail.com/v2',    // переопределить для тестов/прокси
  userAgent: 'my-app/1.0 (+dashamail-node)',
});

// Способ вызвать эндпоинт, для которого в SDK ещё нет отдельного метода:
await dashamail.client.request('GET', '/some/new/endpoint', { foo: 'bar' });
```

## Тесты

```bash
node --test test/
```

## Лицензия

MIT, см. [LICENSE](LICENSE).
