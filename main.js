const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu } = electron;
let mainWindow;
app.on("ready", function () {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  const mainMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(mainMenu);
});

const template = [
  {
    label: "Filter",
    submenu: [
      {
        label: "dev-tools",
        accelerator: "CmdOrCtrl+D",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
    ],
  },
];
