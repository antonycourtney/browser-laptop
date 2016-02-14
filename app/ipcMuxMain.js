
'use strict'

const electron = require('electron')
const ipcMain = electron.ipcMain

// Registry of requester state, keyed by [requestChannel,responseChannel]
let requesterRegistry = {}

/**
 *
 * Construct an asynchronous requester function that sends a request (identified by reqChannel)
 * to the renderer process, invoking a callback when a response is received (identified by
 * responseChannel).
 *
 * @param {string} reqChannel - request name to distinguish from other request types
 * @param {string} responseChannel - response name to identify  corresponding response type
 * @return {function} requester - requester for function of the form (callback, win, arg1, arg2, ...)
 */
module.exports.Requester = (reqChannel, responseChannel) => {
  const regKey = [reqChannel, responseChannel]
  const regKeyStr = JSON.stringify(regKey)

  const prevEntry = requesterRegistry[regKeyStr]
  if (prevEntry) {
    return prevEntry.requester
  }

  ipcMain.on(responseChannel, (e, callbackId, ...resultArgs) => {
    const entry = requesterRegistry[regKeyStr]
    const cb = entry.callbackMap[callbackId]
    cb(null, e, ...resultArgs)
    delete entry.callbackMap[callbackId]
  })

  const requester = (win, callback, ...args) => {
    const entry = requesterRegistry[regKeyStr]
    const callbackId = entry.callbackIdCounter++
    entry.callbackMap[callbackId] = callback
    win.webContents.send(reqChannel, callbackId, ...args)
  }

  const entry = { requester, callbackIdCounter: 0, callbackMap: {} }
  requesterRegistry[regKeyStr] = entry

  return requester
}
