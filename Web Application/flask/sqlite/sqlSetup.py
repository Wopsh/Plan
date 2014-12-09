import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, CheckConstraint


sql=sqlalchemy
eng=sql.create_engine('sqlite:///sq_userdata.db')
session=sessionmaker(bind=eng)()

#prototype using declarative base 'sqlalchemy.ext.declarative.declarative_base()' base class
# sqlalchemy.ext.declarative.declarative_base()

Base = declarative_base()

class User(Base):
	__tablename__='users'
	#
	#TODO: have check constraints e.g. CheckConstraint('sqlite string')
	id = Column(Integer, primary_key=True)
	username = Column(String, CheckConstraint('length(username) > 1'), unique=True) 
	password = Column(String, CheckConstraint('length(password) > 5'), unique=True) 

Base.metadata.create_all(eng)
newUser= User(username='brock', password='gravler')
session.add(newUser)
session.commit()

'''
example from http://docs.sqlalchemy.org/en/rel_0_9/orm/tutorial.html
Table('users', MetaData(bind=None),
            Column('id', Integer(), table=<users>, primary_key=True, nullable=False),
            Column('name', String(), table=<users>),
            Column('fullname', String(), table=<users>),
            Column('password', String(), table=<users>), schema=None)

'''