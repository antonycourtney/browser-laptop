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

const remote = global.require('electron').remote
const fs = remote.require('fs')

var mockWinStore = null

const testStatePath = '/Users/antony/home/src/chrome-extensions/tabli/build/testData/winSnap.json'

// make a TabWindow from its JSON
// Only needed for static test!
function makeTabWindow (jsWin) {
  const decItems = jsWin.tabItems.map((tiFields) => new TabWindow.TabItem(tiFields))

  const itemWin = Object.assign({}, jsWin, { tabItems: Immutable.Seq(decItems) })

  const decWin = new TabWindow.TabWindow(itemWin)
  return decWin
}

export default class TabManagerPopup extends ImmutableComponent {
  constructor () {
    super()
  }

  handleClick (e) {
    console.log('clicky!')
    e.stopPropagation()
  }

  componentWillMount () {
    console.log('componentWillMount: fs: ', fs)
    const testDataStr = fs.readFileSync(testStatePath)
    const testData = JSON.parse(testDataStr)
    console.log('read test data: ', testData)

    console.log('Tabli: ', Tabli)

    const allWindows = testData.allWindows
    const tabWindows = allWindows.map(makeTabWindow)

    var emptyWinStore = new TabManagerState()

    mockWinStore = emptyWinStore.registerTabWindows(tabWindows)
    console.log('Created mockWinStore and registered test windows')
    console.log('mock winStore: ', mockWinStore.toJS())
  }

  render () {
    if (!this.props.active) {
      return null
    }
    return (
      <div className='tabManagerOverlay' onClick={this.props.onHide}>
        <div className='tabManagerPopup' onClick={this.handleClick}>
          <Popup storeRef={null} initialWinStore={mockWinStore} noListener />
        </div>
      </div>
      )
  }
}
