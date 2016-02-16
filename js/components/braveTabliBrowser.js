/**
 * Implementation of Tabli browser interface for Brave
 *
 */
import * as WindowActions from '../actions/windowActions'
import * as AppActions from '../actions/appActions'

const hideTabli = () => {
  WindowActions.setTabManagerShown(false)
}

const braveBrowser = {
  // make a tab (identified by tab id) the currently focused tab:
  activateTab: (tabId, callback) => {
    const [windowId, frameKey] = tabId
    AppActions.showWindowFrame(windowId, frameKey)
    hideTabli()
    if (callback) {
      callback()
    }
  },

  setFocusedWindow: (windowId, callback) => {
    AppActions.showWindow(windowId)
    if (callback) {
      callback()
    }
  }
}

window.tabliBrowser = braveBrowser

module.exports = braveBrowser
