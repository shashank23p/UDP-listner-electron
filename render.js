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
var dataDiv = document.getElementById("dataDiv");

//defaults
var socket;
var data = [];
const saveLocation = "";
let saveFilePath = "data.csv";
let writeMin = 100;

function empty() {
  dataDiv.innerHTML = "";
}

function closeUDP() {
  socket.close();
}

function showMsg(msg, type = "") {
  msgBorad.innerHTML = `<span class="${type}">${msg}</span>`;
  dataDiv.innerHTML += `<p class="${type}">${msg}</p>`;
  dataDiv.scrollTop = dataDiv.scrollHeight;
}

async function writeToFile(data) {
  csvString = "";
  data.forEach((row) => {
    csvString += row + "\n";
  });
  console.log(csvString);
  appendFile(saveFilePath, csvString, () =>
    showMsg(`Writen ${data.length} datapoint to ${saveFilePath}`, "")
  );
}

//staring UDP listner
async function startUDP() {
  data = [];
  var { filePath } = await dialog.showSaveDialog({
    buttonLabel: "Create File to Save Data",
    defaultPath: `data.csv`,
  });

  if (filePath) {
    saveFilePath = filePath;
    showMsg(`Data will be stored at ${saveFilePath} datapoint to csv`, "blue");
    writeFile(filePath, "", () => startSocket());
  }
}
function startSocket() {
  socket = dgram.createSocket("udp4", {
    exclusive: false,
  });
  socket.on("message", (bytes, req) => {
    const msg = bytes.toString();
    data.push(msg);
    if (data.length >= writeMin) {
      writeToFile(data);
      data = [];
    }
  });

  socket.bind("8081");
  socket.on("listening", () => {
    const address = socket.address();
    var privateIP = ip.address();
    closeBtn.disabled = false;
    startBtn.disabled = true;
    showMsg(`Listing for UDP packets at ${privateIP}:${address.port}`, "green");
  });

  socket.on("close", () => {
    startBtn.disabled = false;
    closeBtn.disabled = true;
    showMsg(`Stoped`, "red");
    writeToFile(data);
  });
}
