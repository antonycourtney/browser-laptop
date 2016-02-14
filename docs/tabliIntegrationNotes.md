# Overview

Notes on integrating [Tabli](http://www.gettabli.com/) window and tab manager (originall developed as a Chrome extension).

These are mainly for my own use while developing the integration, but may prove useful to understand a potential Pull Request or for subsequent maintainers.

# UI Components, Creation and Actions

The entry point for the UI is an additional `Button` added to the `TabsToolbar`. The callback for this button is clicked is `Main.onTabManagerPopup` (in `components/main.js`), passed as the `onTabManager` prop to `TabsToolbar`.

The popup window itself is `TabManagerPopup` (`components/TabManagerPopup.js`). Following the model of the `FindBar` component, this is realized as a fixed `div` with absolute size and positioning created
by the `Frame` component (`components/frame.js`).  Modal effect achieved by nesting the popup div in a invisible (alpha of 0.0) `div` that covers the entire window.

Visbility of the `TabManagerPopup` controlled by `tabManagerShown` property of frame state (see [state.md](state.md) ).  [**TODO**: `FindBar` component now non-existent when not shown instead of using `active` property controlling visibility. Follow same approach for `TabManagerPopup`? ]

Top-level callbacks / actions:
  - Show popup: `Main.onTabManagerPopup` (in `components/main.js`)
  - Hide popup: `Frame.onTabManagerHide` (in `components/frame.js`)
  - Action: `WindowActions.setTabManagerShown` 
  - Handler: `stores/WindowStore.js` (WINDOW_SET_TAB_MANAGER_SHOWN)
    (just sets the tabManagerShown prop of the frame state)

# Gathering Window State

The Tabli popup needs to gather the tab state of *all* windows, not just the current frame.
This is slightly challenging in Brave because each window is a seperate process, managed by the main process.
The closest thing to what Tabli needs is in `app/index.js`, which does:

```javascript
   BrowserWindow.getAllWindows().forEach(win => win.webContents.send(messages.REQUEST_WINDOW_STATE))
 ```


 On receiving side, handled in `js/entry.js`:

 ```javascript
 ipc.on(messages.REQUEST_WINDOW_STATE, () => {
  ipc.send(messages.RESPONSE_WINDOW_STATE, WindowStore.getState().toJS())
})
```

This is done to gather the window state of all windows to persist session state immediately before the process quits.  Unfortunately this is (currently) hard-wired just for persisting session-quit.
We should probably try and embed some target into the message so that the handling can be a bit more general, and the caller can specify a callback to invoke when the response comes back -- a minimalist async RPC system.

Essentially, we want an ipcMessageHandler to manage requests / response for a particular message:

On app side (`index.js`), we should do something like (for a single window win):

```javascript
const IpcMux = require('./ipcMuxMain')

const requestWindowState = IpcMux.Requester(REQUEST_WINDOW_STATE,RESPONSE_WINDOW_STATE);
...
requestWindowState(win, onQuitWindowState);
```

where `onQuitWindowState` is what's currently in the message handler for `RESPONSE_WINDOW_STATE`:

```javascript
const onQuitWindowState = (data) => {
    if (data) {
      perWindowState.push(data)
    }
    saveIfAllCollected()
  }
```

In the renderer process (`js/entry.js`):


```javascript
const IpcMux = require('./ipcMuxRenderer')

IpcMux.Responder(REQUEST_WINDOW_STATE,
    RESPONSE_WINDOW_STATE, 
    () => WindowStore.getState().toJS())
```

It looks like many app actions handled in `stores/appStore.js` which runs in the main process.
