import { BrowserWindow, Rectangle, screen, desktopCapturer } from 'electron';
import { ICON, WEB_URL, WIN_CONFIG, preload, url } from '../main/constant';
import {
  closeClipScreenWin,
  getBoundsClipScreenWin,
  showClipScreenWin,
  minimizeClipScreenWin,
} from './clipScreenWin';

let recorderScreenWin: BrowserWindow | null = null;

function createRecorderScreenWin(search?: any): BrowserWindow {
  const { x, y, width, height } = getBoundsClipScreenWin() as Rectangle;
  // let recorderScreenWinX = x + (width - WIN_CONFIG.recorderScreen.width) / 2;
  let recorderScreenWinX = x + width + 4 - WIN_CONFIG.recorderScreen.width;
  let recorderScreenWinY = y + height;

  recorderScreenWin = new BrowserWindow({
    title: 'pear-rec 录屏',
    icon: ICON,
    x: recorderScreenWinX,
    y: recorderScreenWinY,
    width: WIN_CONFIG.recorderScreen.width,
    height: WIN_CONFIG.recorderScreen.height,
    autoHideMenuBar: WIN_CONFIG.recorderScreen.autoHideMenuBar, // 自动隐藏菜单栏
    maximizable: WIN_CONFIG.recorderScreen.maximizable,
    hasShadow: WIN_CONFIG.recorderScreen.hasShadow, // 窗口是否有阴影
    fullscreenable: WIN_CONFIG.recorderScreen.fullscreenable, // 窗口是否可以进入全屏状态
    alwaysOnTop: WIN_CONFIG.recorderScreen.alwaysOnTop, // 窗口是否永远在别的窗口的上面
    // skipTaskbar: WIN_CONFIG.recorderScreen.skipTaskbar,
    resizable: WIN_CONFIG.recorderScreen.resizable,
    webPreferences: {
      preload,
    },
  });

  // recorderScreenWin.webContents.openDevTools();

  if (url) {
    recorderScreenWin.loadURL(WEB_URL + `recorderScreen.html?type=${search?.type || ''}`);
  } else {
    recorderScreenWin.loadFile(WIN_CONFIG.recorderScreen.html, {
      search: `?type=${search?.type || ''}`,
    });
  }

  recorderScreenWin.on('restore', () => {
    showClipScreenWin();
  });

  recorderScreenWin.on('minimize', () => {
    minimizeClipScreenWin();
  });

  recorderScreenWin.on('close', () => {
    closeClipScreenWin();
  });

  recorderScreenWin.webContents.on('did-finish-load', () => {
    setSource();
  });

  return recorderScreenWin;
}

async function setSource() {
  const { id } = screen.getPrimaryDisplay();
  let sources = [...(await desktopCapturer.getSources({ types: ['screen'] }))];
  let source = sources.filter((e: any) => parseInt(e.display_id, 10) == id)[0];
  source || (source = sources[0]);
  recorderScreenWin.webContents.send('rs:set-source', source.id);
}

// 打开关闭录屏窗口
function closeRecorderScreenWin() {
  recorderScreenWin?.isDestroyed() || recorderScreenWin?.close();
  recorderScreenWin = null;
}

function openRecorderScreenWin(search?: any) {
  if (!recorderScreenWin || recorderScreenWin?.isDestroyed()) {
    recorderScreenWin = createRecorderScreenWin(search);
  }
  recorderScreenWin?.show();
}

function hideRecorderScreenWin() {
  recorderScreenWin?.hide();
}

function showRecorderScreenWin() {
  recorderScreenWin?.show();
}

function minimizeRecorderScreenWin() {
  recorderScreenWin?.minimize();
}

function setSizeRecorderScreenWin(width: number, height: number) {
  // recorderScreenWin?.setResizable(true);
  // recorderScreenWin?.setSize(width, height);
  // recorderScreenWin?.setResizable(false);
}

function getBoundsRecorderScreenWin() {
  return recorderScreenWin?.getBounds();
}

function setMovableRecorderScreenWin(movable: boolean) {
  recorderScreenWin?.setMovable(movable);
}

function setResizableRecorderScreenWin(resizable: boolean) {
  recorderScreenWin?.setResizable(resizable);
}

function setAlwaysOnTopRecorderScreenWin(isAlwaysOnTop: boolean) {
  recorderScreenWin?.setAlwaysOnTop(isAlwaysOnTop);
}

function isFocusedRecorderScreenWin() {
  return recorderScreenWin?.isFocused();
}

function focusRecorderScreenWin() {
  recorderScreenWin?.focus();
}

function getCursorScreenPointRecorderScreenWin() {
  return screen.getCursorScreenPoint();
}

function setBoundsRecorderScreenWin(clipScreenWinBounds: any) {
  let { x, y, width, height } = clipScreenWinBounds;
  let recorderScreenWinX = x;
  let recorderScreenWinY = y + height;
  recorderScreenWin?.setBounds({
    x: recorderScreenWinX,
    y: recorderScreenWinY,
    width: width,
  });
  recorderScreenWin?.webContents.send('rs:get-size-clip-win', clipScreenWinBounds);
}

function setIgnoreMouseEventsRecorderScreenWin(event: any, ignore: boolean, options: any) {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.setIgnoreMouseEvents(ignore, options);
}

function downloadVideo(file) {
  recorderScreenWin.webContents.downloadURL(file.url);
  recorderScreenWin.webContents.session.once('will-download', async (event, item, webContents) => {
    item.setSaveDialogOptions({
      defaultPath: file.fileName,
    });
    item.once('done', (event, state) => {
      if (state === 'completed') {
        const savePath = item.getSavePath();
        const fileName = item.getFilename();
        recorderScreenWin.webContents.send('rs:send-file', {
          fileName: fileName,
          filePath: savePath,
        });
        console.log(`${savePath}:录像保存成功`);
      }
    });
  });
}

export {
  closeRecorderScreenWin,
  createRecorderScreenWin,
  focusRecorderScreenWin,
  getBoundsRecorderScreenWin,
  getCursorScreenPointRecorderScreenWin,
  hideRecorderScreenWin,
  isFocusedRecorderScreenWin,
  minimizeRecorderScreenWin,
  openRecorderScreenWin,
  setAlwaysOnTopRecorderScreenWin,
  setBoundsRecorderScreenWin,
  setIgnoreMouseEventsRecorderScreenWin,
  setMovableRecorderScreenWin,
  setResizableRecorderScreenWin,
  setSizeRecorderScreenWin,
  showRecorderScreenWin,
  downloadVideo,
};
