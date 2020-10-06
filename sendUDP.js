var dgram = require("dgram");
var message = "hellow";
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
