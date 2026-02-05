const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Server = require('../models/Server');
const pakasir = require('../utils/pakasir');
const ptero = require('../utils/ptero');
const mailer = require('../utils/mailer');
const crypto = require('crypto');

const createOrder = async (req, res) => {
  const { email, username, plan, type } = req.body;
  const prices = {
    '9GB': 10000,
    '10GB': 11000,
    'unlimited': 13000,
    'reseller': 15000
  };

  const amount = prices[plan];
  if (!amount) return res.status(400).json({ message: 'Invalid plan' });

  const orderId = 'INV' + crypto.randomBytes(4).toString('hex').toUpperCase();

  try {
    const payment = await pakasir.createTransaction({ orderId, amount });

    const transaction = new Transaction({
      orderId,
      amount,
      type,
      plan,
      email,
      username,
      paymentNumber: payment.payment_number,
      project: payment.project
    });

    await transaction.save();

    res.json({
      orderId,
      amount: payment.total_payment,
      paymentNumber: payment.payment_number,
      expiredAt: payment.expired_at
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkStatus = async (req, res) => {
  const { orderId } = req.params;
  try {
    const transaction = await Transaction.findOne({ orderId });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.status === 'completed') {
        return res.json({ status: 'completed', data: transaction.pteroData });
    }

    const detail = await pakasir.getTransactionDetail({
        orderId: transaction.orderId,
        amount: transaction.amount
    });

    if (detail.status === 'completed' && transaction.status !== 'completed') {
      transaction.status = 'completed';
      transaction.completedAt = detail.completed_at;

      let pteroResult = null;
      if (transaction.type === 'direct_purchase') {
        // Create server for direct buyer
        pteroResult = await ptero.createServer({
          username: transaction.username,
          email: transaction.email,
          ram: transaction.plan === 'unlimited' ? 'unlimited' : (parseInt(transaction.plan) * 1024).toString(),
          nestId: process.env.PTERO_NEST_ID,
          eggId: process.env.PTERO_EGG_ID,
          locationId: process.env.PTERO_LOCATION_ID
        });

        const newServer = new Server({
          serverId: pteroResult.serverId,
          name: `${transaction.username} Server`,
          directBuyerEmail: transaction.email,
          memory: parseInt(transaction.plan) || 0,
          panelUrl: pteroResult.panel
        });
        await newServer.save();

        // Send Email
        await mailer.sendCredentials(transaction.email, pteroResult);
        transaction.pteroData = pteroResult; // Save for popup retrieval
      } else if (transaction.type === 'reseller_registration') {
        // Create Reseller Account
        const password = crypto.randomBytes(4).toString('hex');
        const newUser = new User({
          username: transaction.username,
          email: transaction.email,
          password: password,
          role: 'reseller'
        });
        await newUser.save();

        // Send Email
        await mailer.sendResellerCredentials(transaction.email, { username: transaction.username, password });
        transaction.pteroData = { username: transaction.username, password, type: 'reseller' };
      }

      await transaction.save();
      return res.json({ status: 'completed', data: transaction.pteroData });
    }

    res.json({ status: detail.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, checkStatus };
