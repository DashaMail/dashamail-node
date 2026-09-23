'use strict';

const DashaMail = require('@dashamail/node');
const { ApiException, RateLimitException } = require('@dashamail/node');

const dashamail = new DashaMail(process.env.DASHAMAIL_API_KEY || 'YOUR_API_KEY');

async function main() {
  // Account balance.
  const balance = await dashamail.account.balance();
  console.log(`Balance: ${balance.data.balance} ${balance.data.currency}`);

  // Create a list and add a subscriber.
  const created = await dashamail.lists.create('Example list');
  const listId = created.data.list_id;

  await dashamail.lists.addMember(listId, 'subscriber@example.com', { merge_1: 'Иван' });

  // Iterate subscribers, page by page.
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

  // Send a transactional email.
  await dashamail.transactional.send(
    'subscriber@example.com',
    'sender@yourdomain.com',
    '<p>Спасибо за подписку!</p>',
    { subject: 'Добро пожаловать' }
  );
}

main().catch((err) => {
  if (err instanceof RateLimitException) {
    console.error(`Rate limited, retry after ${err.getRetryAfter()}s`);
  } else if (err instanceof ApiException) {
    console.error(`DashaMail API error ${err.apiCode}: ${err.message}`);
  } else {
    throw err;
  }
});
