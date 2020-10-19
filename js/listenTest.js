const dgram = require("dgram");
let messageSocket = dgram.createSocket("udp4", {
  exclusive: false,
});
messageSocket.bind(8085);
messageSocket.on("listening", () => {
  console.log(`Listing for UDP messages`);
});
//on data recived
messageSocket.on("message", (bytes, req) => {
  const msg = bytes.toString();
  console.log(msg);
});