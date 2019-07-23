const { app, BrowserWindow, nativeImage, Menu, Tray } = require('electron')
const { join } = require('path')

const createWindow = () => {
  const appIcon = new Tray(join(__dirname, 'assets/icon.png'))

  const backwardBtn = {
    icon: new nativeImage.createFromPath(join(__dirname, 'assets/backward.png')),
    tooltip: 'Backward'
  }
  const playBtn = {
    icon: new nativeImage.createFromPath(join(__dirname, 'assets/play.png')),
    tooltip: 'Play/Pause'
  }
  const forwardBtn = {
    icon: new nativeImage.createFromPath(join(__dirname, 'assets/forward.png')),
    tooltip: 'Forward',
  }

  // Crea la ventana del navegador.
  const win = new BrowserWindow({
    show: false,
    icon: new nativeImage.createFromPath(join(__dirname, 'assets/icon.png')),
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true
    },
    // thickFrame: 'WS_THICKFRAME',
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  win.on('minimize', (event) => {
    event.preventDefault();
    win.hide();
  });

  win.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }
    return false;
  });

  const changePlayBtnIcon = (playing) => {
    playBtn.icon = new nativeImage.createFromPath(join(__dirname, `assets/${playing ? 'pause' : 'play'}.png`))
    win.setThumbarButtons([backwardBtn, playBtn, forwardBtn])
  }

  win.once('show', () => {
    appIcon.setHighlightMode('always')
    const { webContents } = win;
    let playing = false;
    backwardBtn.click = () => {
      webContents.executeJavaScript(
        `
        document.querySelector('paper-icon-button.previous-button').click();
        `
      ).then(() => {
        changePlayBtnIcon(true)
      }, (reason) => {
        console.log(reason)
      })
    }
    playBtn.click = () => {
      webContents.executeJavaScript(
        `
        document.querySelector('paper-icon-button#play-pause-button').click();
        `
      ).then(() => {
        playing = !playing;
        changePlayBtnIcon(playing)
      }, (reason) => {
        console.log(reason)
      })
    }
    forwardBtn.click = () => {
      webContents.executeJavaScript(
        `
        document.querySelector('paper-icon-button.next-button').click();
        `
      ).then(() => {
        changePlayBtnIcon(true)
      }, (reason) => {
        console.log(reason)
      })
    }
    win.setThumbarButtons([backwardBtn, playBtn, forwardBtn])
  })

  // and load the index.html of the app.
  win.loadURL('https://music.youtube.com')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open', click: () => {
        win.show();
      }
    },
    {
      label: 'Exit', click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ])
  
  appIcon.setContextMenu(contextMenu)
}

app.on('ready', createWindow)