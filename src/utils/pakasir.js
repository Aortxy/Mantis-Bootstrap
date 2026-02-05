const fetch = require('node-fetch');

const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY;
const PAKASIR_PROJECT_SLUG = process.env.PAKASIR_PROJECT_SLUG;

const createTransaction = async ({ orderId, amount, method = 'qris' }) => {
  const url = `https://app.pakasir.com/api/transactioncreate/${method}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: PAKASIR_PROJECT_SLUG,
      order_id: orderId,
      amount: amount,
      api_key: PAKASIR_API_KEY
    })
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Failed to create transaction");
  return json.payment;
};

const getTransactionDetail = async ({ orderId, amount }) => {
  const url = `https://app.pakasir.com/api/transactiondetail?project=${PAKASIR_PROJECT_SLUG}&amount=${amount}&order_id=${orderId}&api_key=${PAKASIR_API_KEY}`;
  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Failed to get transaction detail");
  return json.transaction;
};

module.exports = { createTransaction, getTransactionDetail };
