const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 900,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.svg'),
    title: 'sunflower 图片压缩小工具',
    show: false
  });

  // 加载应用的 index.html
  mainWindow.loadFile('index.html');

  // 当窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 打开开发者工具
  // mainWindow.webContents.openDevTools();

  // 当窗口关闭时触发
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(createWindow);

// 当所有窗口关闭时退出应用
app.on('window-all-closed', function () {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (mainWindow === null) createWindow();
});

// 处理文件选择对话框
ipcMain.handle('select-files', async (event, options = {}) => {
  const dialogOptions = {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '图片', extensions: ['jpg', 'png', 'jpeg', 'webp'] }
    ]
  };
  
  // 如果提供了默认路径，添加到对话框选项中
  if (options.defaultPath) {
    dialogOptions.defaultPath = options.defaultPath;
  }
  
  const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
  if (canceled) {
    return [];
  }
  return filePaths;
});

// 处理保存目录选择对话框
ipcMain.handle('select-output-directory', async (event, options = {}) => {
  const dialogOptions = {
    properties: ['openDirectory']
  };
  
  // 如果提供了默认路径，添加到对话框选项中
  if (options.defaultPath) {
    dialogOptions.defaultPath = options.defaultPath;
  }
  
  const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
  if (canceled) {
    return '';
  }
  return filePaths[0];
});

// 处理打开文件夹请求
ipcMain.handle('open-directory', async (event, dirPath) => {
  if (dirPath) {
    await shell.openPath(dirPath);
    return true;
  }
  return false;
});

ipcMain.handle('open-external-link', async (event, url) => {
  if (url) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});