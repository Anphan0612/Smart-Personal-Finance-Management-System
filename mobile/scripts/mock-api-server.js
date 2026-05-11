const http = require('http');
const { URL } = require('url');

const PORT = Number(process.env.MOCK_API_PORT || 8080);

const now = () => new Date().toISOString();

const defaultWallet = {
  id: 'bank-001',
  userId: 'user-demo-001',
  name: 'Demo Wallet',
  balance: 24000000,
  currencyCode: 'VND',
  currencySymbol: 'd',
  type: 'BANK',
  bankName: 'Mock Bank',
  accountNumber: '123456789',
  branch: 'Ho Chi Minh',
  createdAt: now(),
};

const categories = [
  { id: 'cat-exp-001', name: 'Food', iconName: 'RESTAURANT', type: 'EXPENSE' },
  { id: 'cat-exp-002', name: 'Transport', iconName: 'DIRECTIONS_CAR', type: 'EXPENSE' },
  { id: 'cat-inc-001', name: 'Salary', iconName: 'PAYMENTS', type: 'INCOME' },
];

const transactions = [];

function ok(data, message = 'OK', code = 200) {
  return JSON.stringify({
    success: true,
    code,
    message,
    data,
    timestamp: now(),
  });
}

function fail(message, code = 400) {
  return JSON.stringify({
    success: false,
    code,
    message,
    data: null,
    timestamp: now(),
  });
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function writeJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    writeJson(res, 404, fail('Not Found', 404));
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,Refresh-Token',
    });
    res.end();
    return;
  }

  if (method === 'GET' && path === '/api/v1/health') {
    writeJson(res, 200, ok({ status: 'up' }));
    return;
  }

  if (method === 'POST' && path === '/api/v1/auth/login') {
    const body = await parseBody(req);
    const username = String(body.username || '').trim();
    const password = String(body.password || '').trim();

    if (!username || !password) {
      writeJson(res, 400, fail('Missing username or password'));
      return;
    }

    writeJson(
      res,
      200,
      ok({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        tokenType: 'Bearer',
        userId: 'user-demo-001',
        email: username,
        name: 'Demo User',
      })
    );
    return;
  }

  if (method === 'POST' && path === '/api/v1/auth/refresh-token') {
    writeJson(
      res,
      200,
      ok({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      })
    );
    return;
  }

  if (method === 'GET' && path === '/api/v1/wallets') {
    writeJson(res, 200, ok([defaultWallet]));
    return;
  }

  if (method === 'GET' && path === '/api/v1/categories') {
    writeJson(res, 200, ok(categories));
    return;
  }

  if (method === 'GET' && path === '/api/v1/budgets') {
    writeJson(res, 200, ok([]));
    return;
  }

  if (method === 'GET' && path === '/api/v1/dashboard/summary') {
    writeJson(
      res,
      200,
      ok({
        summary: {
          income: 20000000,
          expenses: 3000000,
          balance: 17000000,
          netFlow: 17000000,
          savingsRate: 0.85,
        },
        monthlyTrend: [],
        categoryBreakdown: [],
        transactions: transactions.slice(-5),
      })
    );
    return;
  }

  if (method === 'GET' && path === '/api/v1/transactions/comparison') {
    const emptyPeriod = { totalIncome: 0, totalExpense: 0, expenseByCategory: {} };
    writeJson(
      res,
      200,
      ok({
        currentWeek: emptyPeriod,
        lastWeek: emptyPeriod,
        currentMonth: emptyPeriod,
        lastMonth: emptyPeriod,
      })
    );
    return;
  }

  if (method === 'GET' && path === '/api/v1/transactions') {
    writeJson(
      res,
      200,
      ok({
        content: transactions,
        page: 0,
        size: 50,
        totalElements: transactions.length,
        totalPages: 1,
        last: true,
        first: true,
      })
    );
    return;
  }

  if (method === 'POST' && path === '/api/v1/transactions') {
    const body = await parseBody(req);
    const id = `tx-${Date.now()}`;
    const category = categories.find((c) => c.id === body.categoryId);
    const created = {
      id,
      walletId: body.walletId || defaultWallet.id,
      categoryId: body.categoryId || categories[0].id,
      categoryName: category ? category.name : 'Other',
      iconName: category ? category.iconName : 'LIST',
      amount: Number(body.amount || 0),
      description: String(body.description || ''),
      type: body.type || 'EXPENSE',
      transactionDate: body.transactionDate || now(),
      createdAt: now(),
    };
    transactions.push(created);
    writeJson(res, 200, ok(created));
    return;
  }

  if (method === 'POST' && path === '/api/v1/ai/chat') {
    writeJson(
      res,
      200,
      ok({
        message: 'Tong chi tieu thang nay dang on dinh. Ban co the tiet kiem them 10%.',
        type: 'summary',
      })
    );
    return;
  }

  if (method === 'GET' && path === '/api/v1/ai/proactive-insights') {
    writeJson(
      res,
      200,
      ok({
        message: 'Day la goi y nhanh: theo doi chi tieu an uong va dat gioi han tuan.',
      })
    );
    return;
  }

  if (method === 'POST' && path === '/api/v1/ai/extract-transaction') {
    writeJson(
      res,
      200,
      ok({
        walletId: defaultWallet.id,
        categoryId: categories[0].id,
        amount: 120000,
        type: 'EXPENSE',
        description: 'Mock extracted transaction',
        transactionDate: now(),
      })
    );
    return;
  }

  writeJson(res, 404, fail(`Route not found: ${method} ${path}`, 404));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[mock-api] listening on http://0.0.0.0:${PORT}`);
});
