/**
 * @typedef {Object} LayoutFile
 * @property {string|undefined} name - The name of the layout
 * @property {boolean} selected - Whether the layout is selected or not
 */

/**
 * @typedef {Object} SettingsFile
 * @property {string} gamePath - The full path to the game file
 */

/**
 * @typedef {Object} LayoutJson
 * @property {number} b
 * @property {boolean} disableInputWhenNotFocused
 * @property {string} mangledName
 * @property {string} name
 * @property {number} r
 * @property {boolean} standardSortMethod
 * @property {boolean} stopSoundsOnStartup
 * @property {string} title
 * @property {number} v
 * @property {Object} uiSettings
 * @property {boolean} uiSettings.grid
 * @property {string} uiSettings.gridType
 * @property {number} uiSettings.gridWidth
 * @property {number} uiSettings.gridHeight
 * @property {number} uiSettings.gridOffsetX
 * @property {number} uiSettings.gridOffsetY
 * @property {number} uiSettings.gridColor
 * @property {number} uiSettings.gridAlpha
 * @property {boolean} uiSettings.snap
 * @property {number} uiSettings.zoomFactor
 * @property {boolean} uiSettings.windowMask
 * @property {Array} objectsGroups
 * @property {Array<{folded: boolean, name: string, type: string, value: boolean|number}>} variables
 * @property {Array<Object>} instances
 * @property {Array<Object>} objects
 * @property {Object} objectsFolderStructure
 * @property {Array} events
 * @property {Array<Object>} layers
 * @property {Array<Object>} behaviorsSharedData
 */

export const Types = {};
