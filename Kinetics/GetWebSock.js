/*
<script src="http://127.0.0.1:8081/socket.io/socket.io.js"></script>
<script src="JointWatcher.js"></script>
*/

WS = {};
WS.ws = null;
WS.numMsgs = 0;

function report(str)
{
    console.log(str);
}

if ('WebSocket' in window){
   report("have websockets");
   /* WebSocket is supported. You can proceed with your code*/
} else {
   report("no websockets api");
   /*WebSockets are not supported. Try a fallback method like long-polling etc*/
}

var ws = null;
var numMsgs = 0;


function GetWebsocket(handlers, url)
{
   if (!url) {
       	url = "ws://platonia:8100/";
       	url = "ws://192.168.21.153:8100/";
   }
   //url = "ws://localhost:8100/";
   console.log("GetWebsocket "+url);
   WS.ws = new WebSocket(url);
   //WS.ws = new WebSocket('ws://localhost:8000/');

   WS.ws.onopen = function(){
      /*Send a small message to the console once the connection is established */
      report('Ws open!');
   };

   WS.ws.onclose = function(){
      report('Connection closed');
      WS.ws = null;
   };

   WS.ws.onerror = function(){
      report('Had connection error');
      WS.ws = null;
   };

   WS.ws.onmessage = function(e){
      //report("onmessage "+e.data);
      //var smsg = e.data;
      //var smsg = eval(e.data);
       var smgs = null;
       try {
	   var smsg = JSON.parse(e.data);
       }
       catch (e) {
	   report("error: "+e);
	   report("ignoring non-JSON message");
	   return;
       }
      //var msg = smsg.data;
      var msg = smsg;
      WS.numMsgs += 1;
      //report("got msg "+WS.numMsgs);
      //report("server_message: "+JSON.stringify(smsg));
      var msgType = msg.msgType;
      if (handlers[msgType]) {
	  handlers[msgType](msg);
      }
      else {
	  report("unhandled msgType: "+msgType);
      }
   };

   WS.sendMessage = function(msg) {
       report("sendingMessage: "+JSON.stringify(msg));
       WS.ws.send(JSON.stringify(msg));
   };
}

function tryConnect(handlers)
{
    if (WS.ws == null) {
	console.log("*** tick - get web socket ***");
	GetWebsocket(handlers);
    }
    else {
        console.log("*** tick - nothing to do ***");
    }
}


function GetWebSock(handlers)
{
    tryConnect(handlers);
    setInterval(function() { tryConnect(handlers); }, 2000);
    return WS;
}

