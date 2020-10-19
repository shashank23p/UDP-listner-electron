//imports
window.$ = window.jQuery = require("./js/jquery");
const { writeFile, appendFile } = require("fs");
const dgram = require("dgram");
const ip = require("ip");
const remote = require("electron").remote;
const { dialog } = remote;
var detectSSid = require("detect-ssid");

//dom elements
var startBtn = document.getElementById("startBtn");
var closeBtn = document.getElementById("closeBtn");
var msgBorad = document.getElementById("msgBorad");
var bigNumber = document.getElementById("bigNumber");
var packet = document.getElementById("packet");
var loaderText = document.getElementById("loader-text");
var divBeforeConnect = document.getElementById("before-connect");

//defaults
var socket;
var data = [];
let saveFilePath = "data.csv";
let writeMin = 100;
let packetAnimation=false;
let noOfPackets=0;
let port="8081";
let messagePort="8083";
let bordcastToConnectTimeout;
let ssidStart = "Asi";


window.onload = function () {
  listenForMessages();
};

function listenForMessages(){
  try {
    let messageListenSocket = dgram.createSocket("udp4", {
      exclusive: false,
    });
    messageListenSocket.bind(messagePort,()=>bordcastToConnect());
    messageListenSocket.on("listening", () => {
      console.log(`Listing for UDP messages`);
    });
    //on data recived
    messageListenSocket.on("message", (bytes, req) => {
      const msg = bytes.toString();//converting to string
      let msgObj={};
      try{
        msgObj=JSON.parse(msg);
      }catch{}
      switch(msgObj.title) {
        case "connected":
          clearTimeout(bordcastToConnectTimeout);
          connected();
          break;
        case undefined:
          break;
        default:
          console.log("Can not process this message:"+msg);
      }
      
    });
    messageListenSocket.on("close", () => {
      showMsg(`message socket stoped`, "red");
    });
  } catch (error) {
    showMsg(error.message, "red");
  }
}
function bordcastToConnect(){
  let messageSendSocket = dgram.createSocket("udp4");
  var privateIP = ip.address();
  let message=privateIP;

  messageSendSocket.bind(() => {
    messageSendSocket.setBroadcast(true);
    messageSendSocket.send(message, 0, message.length, 8083, "255.255.255.255", function (
      err,
      bytes
    ) {
      bordcastToConnectTimeout=setTimeout(bordcastToConnect,1000);
    });
  });
}
function getSSID() {
  detectSSid(function (error, ssidname) {
    if (ssidStart == ssidname.substr(0, ssidStart.length)) {
      setTimeout(connected, 1000);
    } else {
      setTimeout(getSSID, 1000);
    }
  });
}
function connected() {
  $("#ripple").fadeOut("fast", function () {
    $("#iotImg").fadeIn("slow");
    loaderText.innerHTML =
      "<span class='primary'>Connected to IOT device</span>";
    setTimeout(openMain, 2000);
  });
}
function openMain() {
  $("#before-connect").slideUp();
}
//close data socket
function closeUDP() {
  try {
    socket.close();
  } catch (error) {
    console.log(error);
  }
}

//show msg of message board
function showMsg(msg, type = "") {
  msgBorad.innerHTML = `<span class="${type}">${msg}</span>`;
}


//write entry to file
async function writeToFile(data) {
  csvString = "";
  data.forEach((row) => {
    csvString += row + "\n";
  });
  appendFile(saveFilePath, csvString, () =>
    showMsg(`Writen ${noOfPackets} datapoint to ${saveFilePath}`, "")
  );
}

//staring UDP listner for data
async function startUDP() {
  noOfPackets=0;
  bigNumber.innerText=noOfPackets;
  data = [];
  var { filePath } = await dialog.showSaveDialog({
    buttonLabel: "Create File to Save Data",
    defaultPath: `data.csv`,
  });
  if (filePath) {
    saveFilePath = filePath;
    writeFile(filePath, "", () => startSocket());
  }
}

//stat socket to listen data
function startSocket() {
  try {
    socket = dgram.createSocket("udp4", {
      exclusive: false,
    });
    socket.bind(port);
    socket.on("listening", () => {
      const address = socket.address();
      var privateIP = ip.address();
      closeBtn.style.display = "block";
      startBtn.style.display = "none";
      showMsg(`Listing for UDP packets at ${privateIP}:${address.port}`, "green");
      console.log(`Listing for UDP packets at ${privateIP}:${address.port}`);
    });
    //on data recived
    socket.on("message", (bytes, req) => {
      if(!packetAnimation){
        packet.classList.add("packet");
        packetAnimation=true;
      }
      const msg = bytes.toString();//converting to string
      data.push(msg);
      noOfPackets++;
      showMsg(`Packet recived [${msg}]`);
      bigNumber.innerText=noOfPackets;
      if (data.length >= writeMin) {
        writeToFile(data);
        data = [];
      }
    });
    socket.on("close", () => {
      closeBtn.style.display = "none";
      startBtn.style.display = "block";
      packet.classList.remove("packet");
      showMsg(`Stoped`, "red");
      writeToFile(data);
    });
  } catch (error) {
    showMsg(error.message, "red");
  }
}
