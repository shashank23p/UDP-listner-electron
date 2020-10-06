var dgram = require("dgram");

var client = dgram.createSocket("udp4");

client.send("Hello World!", 0, 12, 8081, "192.168.159.1");
client.send("Hello2World!", 0, 12, 8081, "192.168.159.1");
client.send("Hello3World!", 0, 12, 8081, "192.168.159.1", function (
  err,
  bytes
) {
  console.log(bytes);
  client.close();
});
