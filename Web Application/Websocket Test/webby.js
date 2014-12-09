//Ryan Merrill
//Javascript  for WebSocket test client.
//Code styled using http://www.jspretty.com/

var socket;
//DOM vars
var custom_port;
var custom_ip;
var output;
var connection_div;
var send_message;

function load() {
	//Set up DOM element vars.
    custom_port = document.getElementById("custom_port");
    custom_ip = document.getElementById("custom_ip");
    output = document.getElementById("output");
    connection_div = document.getElementById("connection_div");
    send_message = document.getElementById("send_message");
}

function connectPress() {
	//Connect button was pressed. Time to connect to a websocket
	//Set responses to events over connection. Unhide send message and log area.
    socket = new WebSocket("ws://" + custom_ip.value + ":" + custom_port.value);
    socket.onopen = function (event) {
        connection_div.hidden = false;
    };
    socket.onclose = function (event) {
    output.innerHTML = output.innerHTML + '<font color="red"><b>Connection Closed<br></b></font>';
    };
    socket.onmessage = function (event) {
        output.innerHTML = output.innerHTML + '<pre style="margin:0px;"><font color="yellow"><b>Server reply:<br></b>';
        output.innerHTML = output.innerHTML + escapeChars_break_char_into_tag(event.data);
        output.innerHTML = output.innerHTML + '</pre></font>';
    };
}

function sendPress() {
	//Send button was pressed. Time to send a message to the server.
    socket.send(unescape(send_message.value))
    output.innerHTML = output.innerHTML + '<pre style="margin:0px;"><font color="aqua"><b>Message Sent:<br></b>'
    output.innerHTML = output.innerHTML + escapeChars_break_char_into_tag(send_message.value);
    output.innerHTML = output.innerHTML + '</pre></font>';
    send_message.value = ''
}

function escapeChars(input_string) {
    var output_string = '';
    var code = 0
    for (i = 0; i < input_string.length; i++) {
        code = input_string.charCodeAt(i);
        output_string = output_string + '&#' + code;
        output_string = output_string + ';';
    }
    return output_string;
}

function escapeChars_break_char_into_tag(input_string) {
    //Fix for <pre> tags not accepting &#XX; encoded endline characters.
    var output_string = '';
    var code = 0
    for (i = 0; i < input_string.length; i++) {
        code = input_string.charCodeAt(i);
        if (code != 10 && code != 13) {
            output_string = output_string + '&#' + code;
            output_string = output_string + ';';
        } else {
            output_string = output_string + '<br>';
        }
    }
    return output_string;
}