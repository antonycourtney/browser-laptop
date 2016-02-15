/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const React = require('react')
const ImmutableComponent = require('./immutableComponent')
const Immutable = require('immutable')

const Tabli = require('tabli')

const TabWindow = Tabli.TabWindow
const TabManagerState = Tabli.TabManagerState
const Popup = Tabli.components.Popup

/**
 * construct a Tabli TabItem from a Brave frameState
 */
function makeOpenTabItem (ws, fs) {
  const fsUrl = fs.get('location')
  const fsTitle = fs.get('title')
  const tabItem = new TabWindow.TabItem({
    url: fsUrl,
    audible: fs.get('audioPlaybackActive'),
    favIconUrl: fs.get('icon'),
    open: true,
    tabTitle: (fsTitle && fsTitle.length > 0) ? fsTitle : fsUrl,
    openTabId: fs.get('key'),  // probably also need window id
    active: ws.get('activeFrameKey') === fs.get('key'),
    openTabIndex: fs.get('key')
  })
  return tabItem
}

/**
 * Initialize a TabWindow from a Brave window state
 */
export function makeBraveTabWindow (windowState) {
  const tabItems = windowState.get('frames').map(fs => makeOpenTabItem(windowState, fs))
  const tabWindow = new TabWindow.TabWindow({
    open: true,
    openWindowId: windowState.get('id'),
    focused: windowState.get('focused'),
    tabItems: Immutable.Seq(tabItems)
  })
  return tabWindow
}

class TabManagerPopup extends ImmutableComponent {
  constructor () {
    super()
  }

  handleClick (e) {
    e.stopPropagation()
  }

  render () {
    if (!this.props.active) {
      return null
    }

    const tabWindows = this.props.windowStates.map(makeBraveTabWindow).toArray()

    const winStore = new TabManagerState().registerTabWindows(tabWindows)

    return (
      <div className='tabManagerOverlay' onClick={this.props.onHide}>
        <div className='tabManagerPopup' onClick={this.handleClick}>
          <Popup storeRef={null} initialWinStore={winStore} noListener />
        </div>
      </div>
      )
  }
}

module.exports = TabManagerPopup
