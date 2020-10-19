var dgram = require("dgram");
const { send } = require("process");
var message = "hellow";

sendUDPPack();
function sendUDPPack(){
  var client = dgram.createSocket("udp4");
  client.bind(() => {
    client.setBroadcast(true);
    client.send("normalcast", 0, 100, 8081, "192.168.1.106");
    client.send(message, 0, message.length, 8081, "255.255.255.255", function (
      err,
      bytes
    ) {
      client.close();
    });
  });
  setTimeout(sendUDPPack, 1);
}

