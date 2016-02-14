
const ipc = global.require('electron').ipcRenderer

/**
 * register a handler for the specified request and response channel identifiers
 *
 * @param {string} reqChannel - request name to distinguish from other request types
 * @param {string} responseChannel - response name to identify  corresponding response type
 * @return {function} requestHandler - function to process the request, arguments from calling process
 */
module.exports.Responder = (reqChannel, responseChannel, requestHandler) => {
  ipc.on(reqChannel, (e, requestId, ...args) => {
    const result = requestHandler(...args)
    ipc.send(responseChannel, requestId, result)
  })
}
