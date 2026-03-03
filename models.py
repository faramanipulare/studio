
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy_serializer import SerializerMixin

metadata = MetaData(naming_convention={
    "ix": "ix_%(column_0_label)s",
    "fc": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
})

db = SQLAlchemy(metadata=metadata)

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    serialize_rules = ('-trades.user',)

    def __repr__(self):
        return f'<User {self.username}>'

class Trade(db.Model, SerializerMixin):
    __tablename__ = 'trades'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String, nullable=False)
    asset = db.Column(db.String, nullable=False)
    type = db.Column(db.String, nullable=False) # 'Buy' or 'Sell'
    entry_price = db.Column(db.Float, nullable=False)
    exit_price = db.Column(db.Float, nullable=True)
    status = db.Column(db.String, default='Open') # 'Open' or 'Closed'
    pnl = db.Column(db.Float, default=0.0)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    impact_percentage = db.Column(db.Float, nullable=True) # New field
    sentiment = db.Column(db.String, nullable=True) # New field: 'Trade' or 'Avoid'

    user = db.relationship('User', backref=db.backref('trades', lazy=True))

    serialize_rules = ('-user.trades',)

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date,
            "asset": self.asset,
            "type": self.type,
            "entry_price": self.entry_price,
            "exit_price": self.exit_price,
            "status": self.status,
            "pnl": self.pnl,
            "user_id": self.user_id,
            "impact_percentage": self.impact_percentage,
            "sentiment": self.sentiment
        }

    def __repr__(self):
        return f'<Trade {self.asset} {self.type}>'
