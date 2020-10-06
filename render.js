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
        () => (msgBorad.innerHTML = `<p class="green">Data saved!<p>`)
      );
    }
  } else {
    msgBorad.innerHTML = `<p class="red">No data found, Start listing to get data<p>`;
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
    dataDiv.innerHTML += `<p class="${dataColorToggel()}">${msg}</p>`;
    dataDiv.scrollTop = dataDiv.scrollHeight;
  });

  socket.bind("8081", ip.address());
  socket.on("listening", () => {
    const address = socket.address();
    closeBtn.disabled = false;
    saveBtn.disabled = true;
    startBtn.disabled = true;
    msgBorad.innerHTML = `<p class="blue">Listing for UDP packets at ${address.address}:${address.port}</p>`;
  });

  socket.on("close", () => {
    startBtn.disabled = false;
    closeBtn.disabled = true;
    saveBtn.disabled = false;
    msgBorad.innerHTML = `<p class="red">Socket Disconnected<p>`;
  });
}
