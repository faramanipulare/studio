import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { username: 'trader1' },
    update: {},
    create: {
      username: 'trader1',
      password: password,
    },
  });

  const assets = ["BTC/USD", "ETH/USD", "EUR/USD", "GBP/USD", "AAPL", "TSLA"];
  const types = ["Buy", "Sell"];
  const statuses = ["Open", "Closed"];
  const sentiments = ["Trade", "Avoid"];

  for (let i = 0; i < 10; i++) {
    const entry = parseFloat((Math.random() * (50000 - 100) + 100).toFixed(2));
    const exit_p = parseFloat((entry * (Math.random() * (1.05 - 0.95) + 0.95)).toFixed(2));
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const pnl = status === "Closed" ? parseFloat((exit_p - entry).toFixed(2)) : 0.0;
    
    await prisma.trade.create({
      data: {
        date: `2023-10-${10 + i}`,
        asset: assets[Math.floor(Math.random() * assets.length)],
        type: types[Math.floor(Math.random() * types.length)],
        entry_price: entry,
        exit_price: status === "Closed" ? exit_p : null,
        status: status,
        pnl: pnl,
        userId: user.id,
        impact_percentage: parseFloat((Math.random() * 100).toFixed(2)),
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      },
    });
  }

  console.log("Database seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
