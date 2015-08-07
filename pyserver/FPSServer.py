#!/usr/bin/env python
import json
from twisted.internet import reactor
from autobahn.twisted.websocket import WebSocketServerProtocol, WebSocketServerFactory
from threading import Thread
import time
import sys


class IntervalThread(Thread):
	def __init__(self, game, time=1.0/60.0):
		Thread.__init__(self)
		self.time=time
		self.stopped=False
		self.game=game
	def run(self):
		while (not self.stopped):
			time.sleep(self.time)
			self.testOutput()
			self.sendPlayerLocations()
	def stop(self):
		self.stopped=true
	def sendPlayerLocations(self):
		for aPlayer in self.game.players:
			for bPlayer in self.game.players:
				if(aPlayer != bPlayer):
					oponentPosString='"x":{x},"y":{y},"z":{z}'.format(x=bPlayer.pos['x'], y=bPlayer.pos['y'], z=bPlayer.pos['z'])
					aPlayer.serverProtocol.sendMessage('{"update":{"opponent":{"pos":{' +oponentPosString+'}}}}')
			#player.serverProtocol.sendMessage('{"actions":{"spawn":null}}')
			#print 'spammed'
			pass
	def testOutput(self):
		#print 'thread running...'
		pass

class Game():
	def __init__(self):
		#self.member = so and so
		self.num_conected_players=0
		self.players=[]
		gameThread = IntervalThread(self)
		gameThread.daemon=True
		gameThread.start()
	def action(self, player, actionString):
		action=json.loads(actionString)
		print 'recieved action:'
		print action
		pass
	def respondToGameRequest(self, protocol):
		self.num_conected_players+=1
		newPlayer=Player(self.num_conected_players, protocol)
		self.players.append(newPlayer)
		protocol.player = newPlayer
		print "num conected players:"+str(self.num_conected_players)
		protocol.sendMessage('''{ "update":{"connected":true, "playerNum":''' +str(self.players[self.num_conected_players-1].playerNum) + '''},
								  "actions":{"spawn":null} 
							}''')
		#note playerNum message race condition. attach player to protocol?
	


class Player():
	def __init__(self, playerNum, serverProtocol):
		self.playerNum = playerNum
		if playerNum == 1:
			self.playerColor='"#4444FF"'
			self.opponentColor='"#FF4444"'
			self.serverProtocol=serverProtocol
			self.pos={'x':0.0, 'y':0.0, 'z':0.0}
			self.rot=0.0
		else:
			self.playerColor='"#F4444"'
			self.opponentColor='"#4444FF"'
			self.serverProtocol=serverProtocol
			self.pos={'x':0.0, 'y':0.0, 'z':0.0}
			self.rot=0.0
	def update(self, updateDict):
			if (updateDict['pos']!=None):
				#needs anti cheating validation later
				for key in updateDict['pos']:
					val=updateDict['pos'][key]
					self.pos[key]=val
			if (updateDict['rot']!=None):
				self.rot=updateDict['rot']
			print self.pos


		


class GameServerProtocol(WebSocketServerProtocol):
	player=None # set by game class in Game.respondToGameRequest()
	game=Game()
	def onConnect(self, request):
		print 'client connecting: {client}'.format(client=request.peer)
		print 'request path: {path}'.format(path=request.path)
		GameServerProtocol.status='Waiting for players'
	def onMessage(self, payload, isBinary):
		messageUTF8=payload.decode('utf8')
		message=payload
		print messageUTF8
		if messageUTF8=='request game':
			self.game.respondToGameRequest(self)
			pass
		elif messageUTF8=='ping':
			self.sendMessage('pong')
		elif messageUTF8.find('action')==0:
			actionString=messageUTF8[6:]# should probably extract using JSON->object, object.action->JSON not from string position
			#actionString=json.dumps(json.loads(messageUTF8)['action'])
			print 'action received: ' + actionString
			self.game.action(self.player, actionString)
		else:
			pm=None
			try:
				#pm for parsed message
				pm=json.loads(messageUTF8)
			except:
				print 'json parse error for ' + messageUTF8
				pass
			if 'player_update' in pm:
				print 'player update received!'
				self.player.update(pm['player_update'])
	def onOpen(self):
		pass
	def onClose(self, wasClean, code, reason):
		if wasClean:
			print 'connction closed cleanly' 
		else:
			print 'connction closed uncleanly code: {code} reason: {reason}'.format(code=code, reason=reason)


print 'starting ' + 'FPS' + ' server' 
factory = WebSocketServerFactory("ws://localhost:55555", debug = True)
factory.protocol = GameServerProtocol
reactor.listenTCP(55555, factory) # args are: port, server factory instance, listening queue size, interface
print 'server is running'
reactor.run()