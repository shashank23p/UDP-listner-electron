//imports
const { writeFile, appendFile } = require("fs");
const dgram = require("dgram");
const ip = require("ip");
const remote = require("electron").remote;
const { dialog } = remote;

//dom elements
var startBtn = document.getElementById("startBtn");
var closeBtn = document.getElementById("closeBtn");
var msgBorad = document.getElementById("msgBorad");
var bigNumber = document.getElementById("bigNumber");
var packet = document.getElementById("packet");

//defaults
var socket;
var data = [];
const saveLocation = "";
let saveFilePath = "data.csv";
let writeMin = 100;
let packetAnimation=false;
let noOfPackets=0;
let port="8081";


function closeUDP() {
  try {
    socket.close();
  } catch (error) {
    console.log(error);
  }
}

function showMsg(msg, type = "") {
  msgBorad.innerHTML = `<span class="${type}">${msg}</span>`;
}

async function writeToFile(data) {
  csvString = "";
  data.forEach((row) => {
    csvString += row + "\n";
  });
  appendFile(saveFilePath, csvString, () =>
    showMsg(`Writen ${noOfPackets} datapoint to ${saveFilePath}`, "")
  );
}

//staring UDP listner
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
function startSocket() {
  try {
    socket = dgram.createSocket("udp4", {
      exclusive: false,
    });
    socket.on("message", (bytes, req) => {
      if(!packetAnimation){
        packet.classList.add("packet");
        packetAnimation=true;
      }
      const msg = bytes.toString();
      data.push(msg);
      noOfPackets++;
      showMsg(`Packet recived [${msg}]`);
      bigNumber.innerText=noOfPackets;
      if (data.length >= writeMin) {
        writeToFile(data);
        data = [];
      }
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
