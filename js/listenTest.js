try {
    messageSocket = dgram.createSocket("udp4", {
      exclusive: false,
    });
    messageSocket.bind(messagePort,()=>bordcastToConnect());
    messageSocket.on("listening", () => {
      console.log(`Listing for UDP messages`);
    });
    //on data recived
    messageSocket.on("message", (bytes, req) => {
      clearTimeout(bordcastToConnectTimeout);
      const msg = bytes.toString();//converting to string
      connected();
      console.log(msg);
    });
    messageSocket.on("close", () => {
      showMsg(`message socket stoped`, "red");
    });
  } catch (error) {
    showMsg(error.message, "red");
  }