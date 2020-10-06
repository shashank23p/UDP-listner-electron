//imports
const { writeFile } = require("fs");
const dgram = require("dgram");
const ip = require("ip");
const remote = require("electron").remote;
const { dialog } = remote;

//dom elements
var startBtn = document.getElementById("startBtn");
var closeBtn = document.getElementById("closeBtn");
var saveBtn = document.getElementById("saveBtn");
var msgBorad = document.getElementById("msgBorad");
var dataDiv = document.getElementById("dataDiv");

//defaults
var dataColor = "red";
var socket;

//switching colors to disply data changes
function dataColorToggel() {
  if (dataColor == "red") dataColor = "blue";
  else dataColor = "red";
  return dataColor;
}

function empty() {
  dataDiv.innerHTML = "";
}

async function save() {
  const data = dataDiv.innerText;
  if (data != "") {
    var { filePath } = await dialog.showSaveDialog({
      buttonLabel: "Save Data",
      defaultPath: `sensorData.csv`,
    });

    if (filePath) {
      writeFile(
        filePath,
        data,
        () => (msgBorad.innerHTML = `<span class="green">Data saved!</span>`)
      );
    }
  } else {
    msgBorad.innerHTML = `<span class="red">No data found, Start listing to get data<span>`;
  }
}
function closeUDP() {
  socket.close();
}

//staring UDP listner
function startUDP() {
  socket = dgram.createSocket("udp4", {
    exclusive: false,
  });

  socket.on("message", (msg, req) => {
    dataDiv.innerHTML += `<span class="${dataColorToggel()}">${msg}</span>`;
    dataDiv.scrollTop = dataDiv.scrollHeight;
  });

  socket.bind("8081");
  socket.on("listening", () => {
    const address = socket.address();
    var privateIP = ip.address();
    closeBtn.disabled = false;
    saveBtn.disabled = true;
    startBtn.disabled = true;
    msgBorad.innerHTML = `<span class="blue">Listing for UDP packets at ${privateIP}:${address.port}</span>`;
  });

  socket.on("close", () => {
    startBtn.disabled = false;
    closeBtn.disabled = true;
    saveBtn.disabled = false;
    msgBorad.innerHTML = `<span class="red">Socket Disconnected</span>`;
  });
}
