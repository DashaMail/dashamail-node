'use strict';

const DashaMail = require('@dashamail/node');
const { ApiException, RateLimitException } = require('@dashamail/node');

const dashamail = new DashaMail(process.env.DASHAMAIL_API_KEY || 'YOUR_API_KEY');

async function main() {
  // Баланс аккаунта.
  const balance = await dashamail.account.balance();
  console.log(`Баланс: ${balance.data.balance} ${balance.data.currency}`);

  // Создаём базу и добавляем подписчика.
  const created = await dashamail.lists.create('Example list');
  const listId = created.data.list_id;

  await dashamail.lists.addMember(listId, 'subscriber@example.com', { merge_1: 'Иван' });

  // Перебираем подписчиков постранично.
  let start = 0;
  for (;;) {
    const page = await dashamail.lists.members(listId, { start, limit: 100 });
    for (const member of page) {
      console.log(member.email);
    }
    start += page.getLimit();
    if (!page.hasMore()) {
      break;
    }
  }

  // Отправляем транзакционное письмо.
  await dashamail.transactional.send(
    'subscriber@example.com',
    'sender@yourdomain.com',
    '<p>Спасибо за подписку!</p>',
    { subject: 'Добро пожаловать' }
  );
}

main().catch((err) => {
  if (err instanceof RateLimitException) {
    console.error(`Превышен лимит запросов, повтор через ${err.getRetryAfter()} с`);
  } else if (err instanceof ApiException) {
    console.error(`Ошибка DashaMail API ${err.apiCode}: ${err.message}`);
  } else {
    throw err;
  }
});
