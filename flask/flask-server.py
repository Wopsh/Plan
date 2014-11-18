#!/usr/bin/env python
# -*- coding: utf-8 -*-

#flask imports
from flask import Flask, render_template, Response, request
from flask import make_response

#sqlalchemy
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, CheckConstraint


#other
import os,sys

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
session=sessionmaker(bind=eng)()


Base = declarative_base()


class User(Base):
	__tablename__='users'
	#
	#TODO: have check constraints e.g. CheckConstraint('sqlite string')
	id = Column(Integer, primary_key=True)
	username = Column(String, CheckConstraint('length(username) > 0'), unique=True) 
	password = Column(String, CheckConstraint('length(password) > 5'), unique=True) 

#Base.metadata.create_all(eng)

for i in session.query(User).order_by(User.id): 
		print i.username, i.password




########################### FLASK PORTION ################################################

app = Flask(__name__)

@app.route("/login", methods=['GET', 'POST'])
def loginOut():
	return "username: {username} password: {password}".format(username=request.form.get('username'),password=request.form.get('password'))

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
				session=sessionmaker(bind=eng)()
				newUser= User(username=username, password=password)
				session.add(newUser)
				session.commit()
				return "Username '{username}' registered.".format(username=username,password=password)
			except sqlalchemy.exc.IntegrityError:
				return "You gave an invalid username or password."
				
		else:
			return"the passwords didn't match"
		
	
@app.route("/")
def baseOut():
	css='css/aqua.css'
	return render_template('base.jj2',css=css, title='Flask Website')
	
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
	return Response(r,mimetype='image/x-icon')

app.run('127.0.0.1',55555,debug=debug) # not using option use_reloader=False

###################### END OF FLASK PORTION ##############################################
####
