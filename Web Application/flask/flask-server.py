#!/usr/bin/env python
# -*- coding: utf-8 -*-

#flask imports
from flask import Flask, render_template, Response, request
from flask import make_response, redirect

#sqlalchemy
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Table, Column, Integer, Text, CheckConstraint, Binary


#other
import os, sys, md5
from base64 import b64encode, b64decode

debug=True

############### Directory Wrangling ######################################################
# Python using relative paths is difficult. 
# For now I am using absolute paths because relative path working directory consistency is
# so terrible I gave up. Flask automatically works from script location, SQLAlchemy has no
# idea where to form relative paths from when the script is run as an executable.

forceRunFromScriptDirectory=False
if not forceRunFromScriptDirectory:
	scriptDir = os.path.dirname(os.path.realpath(__file__))
	#os.system("cd " + scriptDir) # This does nothing??
	working_directory=scriptDir
else:
	working_directory=str(os.environ['PWD'])
	print 'Working Directory:' + working_directory
	exec_path=str(os.environ['_'])
	print 'Executable Path:' + exec_path
	scriptDir = os.path.dirname(os.path.realpath(__file__))
	print 'Script Directory: ' + scriptDir

	if not (working_directory == scriptDir):
		print 'working directory missmatch'
		sys.exit(0)


################ Banner Printing #########################################################
# Making the start of server execution easy to see helps make server output readable.
# Printing a fancy text banner makes it easier to find where output begins.
# We set our printing color using an ANSI Control Sequence Initiator + SGR code
# The ANSI Control Sequence Initiator is the escape character and left bracket.
# http://en.wikipedia.org/wiki/ANSI_escape_code
# Check the tables of SGR (Select Graphic Rendition) parameters
ESC_CHAR = '\x1b' or '\033'
CSI_OPEN = ESC_CHAR + '['
CSI_CLOSE = ESC_CHAR + ']'
SGR_NORMAL_PARAMETER =  '0m'
SET_FANCY_COMMAND = CSI_OPEN + '46;34;1m' + CSI_CLOSE + '0m' #5; for blink
SET_BLINKY_COMMAND = CSI_OPEN + '5m' + CSI_CLOSE + '0m' #5; for blink
SET_NORMAL_COMMAND = CSI_OPEN + SGR_NORMAL_PARAMETER + CSI_CLOSE + '0m'
banner = SET_FANCY_COMMAND + '''\
         
  ()()   
 (OxO)   
( m m )o 
#########\
''' + SET_NORMAL_COMMAND + SET_BLINKY_COMMAND + ' FLASK SERVER STARTING ...' + SET_NORMAL_COMMAND

# Flask likes to run and then immediately restart when the debug kwarg is true.
# It needs to run itself in a separate thread for debug features to work.
# It sets a 'WERKZEUG_RUN_MAIN' environment variable in the child python process.
if 'WERKZEUG_RUN_MAIN' in os.environ or debug == False: # running for reals
	print banner
	print 'Working from : ' + scriptDir
else: # about to restart
	print 'Hang on, Flask is restarting in a seperate thread for debug reasons...'

########################### SQL ALCHEMY ##################################################

sql=sqlalchemy
eng=sql.create_engine('sqlite:///' + working_directory + '/sqlite/sq_userdata.db')
#eng=sql.create_engine('sqlite:///./sqlite/sq_userdata.db')
#eng.echo=True
#eng.raw_connection().connection.text_factory = str
session=sessionmaker(bind=eng)()

Base = declarative_base()


class User(Base):
	__tablename__='users'
	#
	#TODO: have check constraints e.g. CheckConstraint('sqlite string')
	id = Column(Integer, primary_key=True)
	username = Column(Text, CheckConstraint('length(username) > 0'), unique=True)
	salt = Column(Text)
	password = Column(Text)
	authToken = Column(Text)

Base.metadata.create_all(eng)

for i in session.query(User).order_by(User.id): 
		print i.username, i.password, i.authToken




########################### FLASK PORTION ################################################

app = Flask(__name__)

@app.route("/login", methods=['GET', 'POST'])
def loginOut():
	#routeSession=sessionmaker(bind=eng)()
	#expr = sqlalchemy.update(User).values(username='Zeus')
	#expr2= '''UPDATE users SET authToken="nerp" WHERE username="Zeus"; '''
	#routeSession.execute(expr)
	#routeSession.commit()
	formUsername = request.form.get('username')
	formPassword = request.form.get('password')
	resp = make_response(str(authenticate(formUsername,formPassword)))#redirect('/show_authentication')
	#resp.set_cookie('username', formUsername)
	################## IF AUTHENTICATED (TODO!):
	auth=authenticate(formUsername, formPassword)
	if  auth != None:
		authToken=b64encode(os.urandom(20))
		routeSession=sessionmaker(bind=eng)()
		expr= '''UPDATE users SET authToken="{authToken}" WHERE username="{username}"; '''.format(authToken=authToken, username=formUsername)
		routeSession.execute(expr)
		routeSession.commit()
		resp.set_cookie('session', authToken)
	return resp
	
@app.route("/register", methods=['GET', 'POST'])
def registerOut():
	css='css/aqua.css'
	if request.method == 'GET':
	    return render_template('register.jj2',css=css, title='Flask Website')
	elif  request.method == 'POST':
		username = request.form.get('username')
		password = request.form.get('password')
		passwordRepeat = request.form.get('password_repeat')
		match = password == passwordRepeat
		if match:
			try:
				routeSession=sessionmaker(bind=eng)()
				salt=os.urandom(16)
				saltedPass=salt+str(password)
				newUser= User(username=username, password=b64encode(md5.new(saltedPass).digest()), salt=b64encode(salt), )
				routeSession.add(newUser)
				routeSession.commit()
				return "Username '{username}' registered.".format(username=username,password=password)
			except sqlalchemy.exc.IntegrityError:
				return "You gave an invalid username or password."
				
		else:
			return"the passwords didn't match"
		
	
@app.route("/")
def baseOut():
	auth=getAuthentication(request)
	css='css/aqua.css'
	return render_template('base.jj2',css=css, auth=auth, escapedToAmpersand=escapedToAmpersand, title='Flask Website')

@app.route("/log-out")
def logOut():
	auth=getAuthentication(request)
	css='css/aqua.css'
	response = make_response(render_template('base.jj2',css=css, auth=None, escapedToAmpersand=escapedToAmpersand, title='Flask Website'))
	response.set_cookie('session', 'logged-out')
	return response

@app.route("/userdump")
def userDump():
	css='css/aqua.css'
	routeSession=sessionmaker(bind=eng)()
	dumptable='<table class="text_table"><tr><th>ID</th><th>USER</th><th>PASSWORD</th></th>'
	for i in routeSession.query(User).order_by(User.id): 
		dumptable += '<tr> <td>{id}</td> <td>{username}</td> <td>{password}</td></tr>'.format(id=i.id, username=i.username, password=i.password)
	dumptable += '</table>'
	return render_template('userdump.jj2',css=css, title='Flask Website', dumptable=dumptable)

@app.route("/img/<path:path>.ico")
def icoOut(path):
	path = working_directory+'/img/'+str(path)+'.ico'
	f = open(path)
	r= f.read()
	f.close()
	return Response(r,mimetype='image/x-icon')

@app.route("/css/<path:path>.css")
def cssOut(path):
	path = working_directory+'/css/'+str(path)+'.css'
	f = open(path)
	r= f.read()
	f.close()
	return Response(r,mimetype='text/css')

@app.route("/cookie")
def cookieAuthOut():
	auth=getAuthentication(request)
	sessionToken=request.cookies.get('session')
	strout='auth={auth} sessionToken={sessionToken}'.format(auth=str(auth), sessionToken=sessionToken.__repr__())
	return Response(strout,mimetype='text/css')


def getAuthentication(request):
	routeSession=sessionmaker(bind=eng)()
	table=User.__table__
	sessionToken=request.cookies.get('session')
	select=table.select(table.c.authToken==sessionToken)
	row=eng.execute(select)
	row = row.fetchone()
	if row != None:
		return {'username':row[1]}
	return None

def authenticate(username, password):
	# return the user that corresponds to the user's credentials
	routeSession=sessionmaker(bind=eng)()
	table=User.__table__
	#users = Table('users', eng, autoload=True)
	select=table.select(table.c.username==username)
	row=eng.execute(select)
	row = row.fetchone()
	if row != None:
		password=str(password)
		salt=b64decode(str(row[2]))
		saltedPassword=salt+password
		hashedsaltedPassword=md5.new(saltedPassword).digest()
		correctPassword=b64decode(str(row[3]))==hashedsaltedPassword
		if correctPassword:
			userDictionary = {'id':row[0], 'username':row[1]}
			return userDictionary
	return None


def escapedToAmpersand(string):
	newString=''
	for char in string :
		newString+='&#'+str(ord(char))+';'
	return newString

	
	
	

app.run('127.0.0.1',55555,debug=debug) # not using option use_reloader=False

###################### END OF FLASK PORTION ##############################################

'''
from flask import request

@app.route('/')
def index():
    username = request.cookies.get('username')
    # use cookies.get(key) instead of cookies[key] to not get a
    # KeyError if the cookie is missing.
Storing cookies:

from flask import make_response

@app.route('/')
def index():
    resp = make_response(render_template(...))
    resp.set_cookie('username', 'the username')
    return resp
'''
#example set cookie http header
#Set-Cookie: reg_fb_gate=deleted; Expires=Thu, 01-Jan-1970 00:00:01 GMT; Path=/; Domain=.example.com; HttpOnly

#example redirect
#return redirect(url_for('index'))

'''
>>> import md5
>>> m = md5.new()
>>> m.update("Nobody inspects")
>>> m.update(" the spammish repetition")
>>> m.digest()
'\xbbd\x9c\x83\xdd\x1e\xa5\xc9\xd9\xde\xc9\xa1\x8d\xf0\xff\xe9'
'''

'''
salt = os.urandom(16).encode('base_64')
'''

'''
To Validate a Password

Retrieve the user's salt and hash from the database.
Prepend the salt to the given password and hash it using the same hash function.
Compare the hash of the given password with the hash from the database. If they match, the password is correct. Otherwise, the password is incorrect.
'''
'''
forceascii=lambda x:chr(ord(x)%0xef+1)

randAscii=lambda x : chr(ord(os.urandom(1))%126+1)
sum=lambda x, y : x + y
randAsciiString = lambda len :reduce(sum, map(randAscii,'c'*len))
'''