
from app import app
from models import db, User, Trade
import random

def seed_data():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()

        # Create a test user
        user = User(username="trader1", password="password123")
        db.session.add(user)
        db.session.commit()

        # Create some sample trades
        assets = ["BTC/USD", "ETH/USD", "EUR/USD", "GBP/USD", "AAPL", "TSLA"]
        types = ["Buy", "Sell"]
        statuses = ["Open", "Closed"]
        sentiments = ["Trade", "Avoid"]

        for i in range(10):
            entry = round(random.uniform(100, 50000), 2)
            exit_p = round(entry * random.uniform(0.95, 1.05), 2)
            status = random.choice(statuses)
            pnl = round(exit_p - entry, 2) if status == "Closed" else 0.0
            impact = round(random.uniform(0, 100), 2)
            sentiment = random.choice(sentiments)

            trade = Trade(
                date=f"2023-10-{10+i}",
                asset=random.choice(assets),
                type=random.choice(types),
                entry_price=entry,
                exit_price=exit_p if status == "Closed" else None,
                status=status,
                pnl=pnl,
                user_id=user.id,
                impact_percentage=impact,
                sentiment=sentiment
            )
            db.session.add(trade)

        db.session.commit()
        print("Database seeded!")

if __name__ == "__main__":
    seed_data()
