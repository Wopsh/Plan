#!/usr/bin/env python
import json
from twisted.internet import reactor
from autobahn.twisted.websocket import WebSocketServerProtocol, WebSocketServerFactory


class Game():
	def __init__(self):
		self.name='Connect N'
		self.numPlayers=0
		self.player1=None
		self.player2=None
		self.winner=None
		self.began=False
		self.gridSize_x=7
		self.gridSize_y=7
		self.spaces=[]
		self.status='Waiting for connections'
	def action(self, player, actionString):
		if self.began == False:
			return
		action=json.loads(actionString)
		print 'parsed action {action}'.format(action=action)
		if (action['action']=='move' and player.turn):
			index=action['move']['index']
			if (self.spaces[index]['owner']==None):
				self.player1.turn = not self.player1.turn
				self.player2.turn = not self.player1.turn
				self.spaces[index]['owner']=player
				if self.testGameWon():
					print 'GAME WON #########################################'
					self.player1.serverProtocol.sendMessage('{"update":{' +
					' "spaces.{index}.owner":{owner}'.format(index=index,owner=player.playerNum) +
					', "turn": ' + 'false' +
					', "status" : ' + '"Game Over. ' + ('You win."' if self.winner==self.player1 else 'You lose."') +
					'}}')
					self.player2.serverProtocol.sendMessage('{"update":{' +
					' "spaces.{index}.owner":{owner}'.format(index=index,owner=player.playerNum) +
					', "turn": ' + 'false' +
					', "status" : ' + '"Game Over. ' + ('You win."' if self.winner==self.player2 else 'You lose."') +
					'}}')
				else:
					self.player1.serverProtocol.sendMessage('{"update":{' +
					' "spaces.{index}.owner":{owner}'.format(index=index,owner=player.playerNum) +
					', "turn": ' + ('true' if self.player1.turn else 'false') +
					', "status" : ' + (' "Your turn." ' if self.player1.turn else ' "Opponent\'s turn." ') +
					'}}')
					self.player2.serverProtocol.sendMessage('{"update":{' +
					' "spaces.{index}.owner":{owner}'.format(index=index,owner=player.playerNum) +
					', "turn": ' + ('true' if self.player2.turn else 'false') +
					', "status" : ' + (' "Your turn." ' if self.player2.turn else ' "Opponent\'s turn." ') +
					'}}')

	def testGameWon(self):
		#horizontal
		spaces=self.spaces
		for x in range(self.gridSize_x-3):
			for y in range(self.gridSize_y):
				idx=x+y*self.gridSize_x
				if(spaces[idx]['owner'] != None and spaces[idx]==spaces[idx+1]
				and spaces[idx+1]==spaces[idx+2] and spaces[idx+2]==spaces[idx+3]):
					self.winner=spaces[idx]['owner']
					print 'winner:'
					print self.winner
					return True
		#vertical
		for x in range(self.gridSize_x):
			for y in range(self.gridSize_y-3):
				idx=x+y*self.gridSize_x
				if(spaces[idx]['owner'] != None and spaces[idx]==spaces[idx+1*self.gridSize_y]
				and spaces[idx+1 * self.gridSize_y]==spaces[idx+2 * self.gridSize_y] and
				spaces[idx+2 * self.gridSize_y]==spaces[idx+3 * self.gridSize_y]):
					self.winner=spaces[idx]['owner']
					print 'winner:'
					print self.winner
					return True
		#diagonal 1
		for x in range(self.gridSize_x-3):
			for y in range(self.gridSize_y-3):
				idx=x+y*self.gridSize_x
				if(spaces[idx]['owner'] != None and spaces[idx]==spaces[idx + 1 + 1 * self.gridSize_y]
				and spaces[idx + 1 + 1 * self.gridSize_y]==spaces[idx + 2 + 2 * self.gridSize_y] and
				spaces[idx + 2 + 2 * self.gridSize_y]==spaces[idx + 3 + 3 * self.gridSize_y]):
					self.winner=spaces[idx]['owner']
					print 'winner:'
					print self.winner
					return True
		#diagonal 2
		for x in range(self.gridSize_x-3):
			for y in range(3, self.gridSize_y):
				idx=x+y*self.gridSize_x
				if(spaces[idx]['owner'] != None and spaces[idx]==spaces[idx + 1 - 1 * self.gridSize_y]
				and spaces[idx + 1 - 1 * self.gridSize_y]==spaces[idx + 2 - 2 * self.gridSize_y] and
				spaces[idx + 2 - 2 * self.gridSize_y]==spaces[idx + 3 - 3 * self.gridSize_y]):
					self.winner=spaces[idx]['owner']
					print 'winner:'
					print self.winner
					return True

		return False

	def beginGame(self):
			for i in range(0,self.gridSize_x*self.gridSize_y):
				self.spaces.append({'owner':None})
			self.player1.serverProtocol.sendMessage('{"update":{' +
			 ' "status" : "Your turn." ' +
			 ', "turn": ' + 'true' +
			 '}}')
			self.player2.serverProtocol.sendMessage('{"update":{' +
			 ' "status" : "Opponent\'s turn," ' +
			 '}}')
			self.began=True
	def respondToGameRequest(self, serverProtocol):
		if self.numPlayers==0:
			self.numPlayers+=1
			self.player1=Player(1, serverProtocol)
			serverProtocol.player=self.player1
			player=self.player1
			serverProtocol.sendMessage('{"update":{' +
			 ' "status" : "Connected as player 1, Waiting for player 2" ' +
			 ', "playerNum": ' + str(player.playerNum) +
			 ', "turn": ' + 'false' +
			 ', "playerColor": ' + str(player.playerColor) +
			 ', "opponentColor": ' + str(player.opponentColor) +
			 '}}')
		elif self.numPlayers==1:
			self.numPlayers+=1
			self.player2=Player(2, serverProtocol)
			serverProtocol.player=self.player2
			player=self.player2
			serverProtocol.sendMessage('{"update":{' +
			 ' "status" : "Connected as player 2, Waiting for server to begin game" ' +
			 ', "playerNum": ' + str(player.playerNum) +
			 ', "turn": ' + 'false' +
			 ', "playerColor": ' + str(player.playerColor) +
			 ', "opponentColor": ' + str(player.opponentColor) +
			 '}}')
			self.player1.serverProtocol.sendMessage('{"update":{' +
			 ' "status" : "All players connected, Waiting for server to begin game" ' +
			 '}}')
			self.beginGame()
		else:
			serverProtocol.sendMessage('{"update":{' +
			 ' "status" : "Tried to connect but game is already full" ' +
			 '}}')


class Player():
	def __init__(self, playerNum, serverProtocol):
		self.playerNum = playerNum
		if playerNum == 1:
			self.turn=True
			self.playerColor='"#FF8"'
			self.opponentColor='"#227"'
			self.serverProtocol=serverProtocol
		else:
			self.turn=False
			self.playerColor='"#227"'
			self.opponentColor='"#FF8"'
			self.serverProtocol=serverProtocol
		


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
		elif messageUTF8.find('action')==0:
			actionString=messageUTF8[6:]
			print 'action received: ' + actionString
			self.game.action(self.player, actionString)
	def onOpen(self):
		pass
	def onClose(self, wasClean, code, reason):
		if wasClean:
			print 'connction closed cleanly' 
		else:
			print 'connction closed uncleanly code: {code} reason: {reason}'.format(code=code, reason=reason)


print 'starting ' + 'Connect N' + ' server' 
#port=raw_input("Please enter the port to listen for connections on: ")
factory = WebSocketServerFactory("ws://localhost:44444", debug = True)
factory.protocol = GameServerProtocol
reactor.listenTCP(44444, factory) # args are: port, server factory instance, listening queue size, interface
print 'server is running'
reactor.run()