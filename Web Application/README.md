Plan Project: An Online First Person Shooter
============================================

Components
----------

 * Matchmaking Server - written in Python using the Flask web framework and SQLAlchemy database toolkit
 *  Game Server - written in Python using the Autobahn framework running on the Twisted networking engine
 * Game Client - written in Javascript and HTML 

### Matchmaking Server

The matchmaking server provides a website which will allow people to find games with other players. It will keep track of online players and game servers and match them together. 

### Game Server

The game server is a computer process that is responsible for linking two or more game clients into a single online game. The server recieves player actions from individual game clients and sends the resulting effects to all game clients. 

### Game Client

The game client is a program for the part of the game that runs on a players computer. The game client is responsible for graphically representing the game and sending a players actions to the server.