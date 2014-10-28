#!/usr/bin/env python
# -*- coding: utf-8 -*-

#flask imports
from flask import Flask, render_template, Response, request
from flask import make_response

#sqlalchemy
import sqlalchemy

#other
import os,sys


working_directory=str(os.environ['PWD'])
print 'Working Directory:' + working_directory
exec_path=str(os.environ['_'])
print 'Executable Path:' + exec_path

app = Flask(__name__)

@app.route("/login", methods=['GET', 'POST'])
def loginOut():
	return "username: {username} password: {password}".format(username=request.form.get('username'),password=request.form.get('password'))

@app.route("/registration")
def registrationOut():
	return "stub"

@app.route("/register", methods=['GET', 'POST'])
def registerOut():
	return "username: {username} password: {password}".format(username=request.form.get('username'),password=request.form.get('password'))

@app.route("/")
def baseOut():
	css='css/aqua.css'
	return render_template('base.jj2',css=css, title='Flask Website')

'''\
<!DOCTYPE="HTML">
<html lang="en">
<head>
<meta charset="UTF-8" />
<link rel="shortcut icon" href="img/bread.ico" />
<link rel="stylesheet" type="text/css" href="css/aqua.css" />
<title>Flask Stub Output</title>
</head>
<body>
<div class="dropdown">
log in / register
<form class="menu" action="/login" method="POST">
Existing users sign in:<br>
username: <input type="text" name="username"><br/>
password: <input type="password" name="password">
<input type="submit" value="Submit"><br>
<a href="/"> Register new user</a>
</form>
</div>
Not much to see here.
<a href=127.0.0.1:55555/test2>test</a>
</body>
</html>
'''
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

app.run('127.0.0.1',55555,debug=True)

'''
CREATE TABLE user (id INTEGER NOT NULL PRIMARY KEY ASC, name TEXT UNIQUE NOT NULL CHECK(length(name) >=1 AND length(name) <=30), password TEXT NOT NULL CHECK(length(password) >=5 AND length(password) <=30) );
'''
