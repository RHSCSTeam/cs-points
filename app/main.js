'use strict';
const electron = require('electron');
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const {Menu} = require('electron')
var template = [
  {
    label: 'RHS CS-Points',
    submenu: [
      {
        label: 'Made by some kids in Reedy High School',
      },
      {
        type: 'separator'
      },
    ]
  },
];
var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    var devMode = false;
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        titleBarStyle: "hidden",
        autoHideMenuBar: true,
        darkTheme: true,
        title: "RHS CS-Points",
        backgroundColor: '#f76800'
    });

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    // Open the DevTools.
    if(devMode)
      mainWindow.webContents.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});
