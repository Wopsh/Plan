//console.log('meep');
var socket = new WebSocket("ws://localhost:55555");

function ping(){
	//(game.connected != null)
	ping.pingSentTime=window.performance.now()
	socket.send('ping')
}

function pongHandler()
{
	if(ping.pingSentTime!=null)
	{
		time=window.performance.now()-ping.pingSentTime
		console.log('ping:'+time);
	}
	else
	{
		console.log('received a pong but never pinged');
	}
	
}


(function (){
	socket.onopen = function (event) {
			console.log('socket open')
			socket.send('request game');
	}
	socket.onmessage = function (event) {
			console.log('message came from server:' + event.data);
			var message=event.data;
			var consumed=false
			if(message=='pong'){pongHandler(); consumed=true;}
			if(! consumed && message.slice(0,5)=='JSON:')
			{
				try {
					JSONMessage=message.slice(5)//get everything after 'JSON:'
					console.log('parsing:'+message)
					parsedMessage=JSON.parse(JSONMessage);
					//console.log(message)
					if(parsedMessage.update != null){
						//console.log('recieved update');
						update(parsedMessage.update);
					}
					if(parsedMessage.actions != null){
						//console.log('action happening!?');
						do_actions(parsedMessage.actions);
					}
				}
				catch(error){
					if (error instanceof SyntaxError)console.log(error);
				}
			}
			

	}
		//socket.onerror=function (event)  {}// not used because event contains no information
	socket.onclose = function (event) {
		console.log('socket closed')
		if (event.wasClean==true) {
		console.log('socket closed, no server connection');
		}
		else {
			if(event.reason!=''){
			console.log('Connection error. No server connection. Error: '+ event.reason);
			}
			else{
				if(event.code!=null){
				console.log('Connection error. No server connection. WebSocket CloseEvent code: '+ event.code);
				}
				else{
					console.log('Connection error. No server connection. No error information could be obtained. ');
				}
			}
		}
	}

	function update(update){
	/*
	Gets called when server sends a JSON message containing property named "update".
	The update property describes an object with some of the same members as the client's
	game object. Every normal member of the update object overwrites a member of the game object.

	There are also special members that contain periods in their names. These update members overwrite
	members of game object members e.g the update member "spaces.2.owner" will update game['spaces']['2']['owner']
	instead of game['spaces.2.owner'] which doesn't exist.
	*/
		for(property in update){
			if(property.indexOf('.')==-1){//property name does not contain a period (normal update)
				game[property]=update[property];
			}
			else{
				var updatedObj=game;
				var sub_property=''+property;
				while(sub_property.indexOf('.')!=-1)
				{
					updatedObj=updatedObj[sub_property.substring(0,sub_property.indexOf('.'))]
					sub_property=sub_property.substring(sub_property.indexOf('.')+1,sub_property.length)
				}
				updatedObj[sub_property]=update[property]
			}
		}
	}
	
	//passing arguments seems like a problem
	//	//turns out not a problem, javascript functions are variadic
	//  // fexpr.length returns the 'correct' number of arguments
	//  // fexpr.apply(what_this_should_mean, [args_array]/null) calls function with an array as arguments
	actions=function(){}
	actions.applyServerSetSyncID=function(serverSetSyncID, clientSetSyncID)
	{
		game.syncedUp[clientSetSyncID].serverSetSyncID=serverSetSyncID
		console.log("action applyServerSetSyncID serverSeSyncID:"+serverSetSyncID +"applied to client Unit with clientSetSyncID:" + clientSetSyncID)
	}
	actions.spawnUnit=function(descriptionObject)
	{
		
	}
	actions.updateUnit=function(descriptionObject)
	{
		
	} 
	
	function do_actions(actions_obj_from_server){
		console.log('action happening?...')
		for(actionName in actions_obj_from_server){
				// actionName is an action (function name) which is also key to corresponding args
				// i.e. {"printToConsole":["I am an arg which should get passed to the printToConsole function"]}
				actionArgs=actions_obj_from_server[actionName];
				console.log('action:'+actionName)
				console.log('args:'+actions_obj_from_server[actionName])
				actionFunction=actions[actionName];
				
				actionFunction.apply(window, actionArgs);
		}

	}
	

})();

