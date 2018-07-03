'use strict';

//=============================================================================
// pico-core.js
//=============================================================================

/*:
 * @plugindesc Tool for Event Making.
 * @author grm
 * @version 1.0.0
 *
 * This plugin add SelfVariables and some small operands !
 * This code is released under MIT license.
 */

/**
 * Global scoped variables
 */
let $gameSelfVariables;

/**
 * Describes SelfVariables logic
 */
class GameSelfVariables {
  constructor() {
    this.clear();
  }

  /**
   * Clear all selfVariables
   */
  clear() {
    this._data = {};
    return this;
  }

  /**
   * Get the value of a selfVariables with a key
   * @param {string} key the concatenation of the map_id, event_id, id
   */
  value(key) {
    return this._data[key];
  }

  /**
   * set the value of a selfVariables via a key
   * @param {string} key the concatenation of the map_id, event_id, id
   * @param {any} value the value of the variables
   */
  setValue(key, value) {
    if (value) {
      this._data[key] = value;
    } else {
      delete this._data[key];
    }
    this.onChange();
  }

  /**
   * Request map refresh (requested on every changes)
   */
  onChange() {
    $gameMap.requestRefresh();
  }
}

/**
 * Create a key for local switches or local variables
 * @param {int} map - the Map ID
 * @param {int} id - the Event ID
 * @param {char | int} data - the data
 */
GameSelfVariables.makeKey = function(map, id, data) {
  return [map, id, data].join(',');
};

/**
 * Self Variables : Public API
 */

/**
 * Shortcut for the switches
 * @param {int} id - The ID of the variable
 * @param {boolean} value - The value of the switch (could be undefined)
 */
function S(id, value) {
  if (typeof value !== 'undefined') {
    $gameSwitches.setValue(id, !!value);
  }
  return $gameSwitches.value(id);
}

/**
 * Shortcut for SelfSwitches
 * @param {int} map - the Map ID
 * @param {int} id - the Event ID
 * @param {char} data - the key
 * @param {boolean} value - The value of the selfswitch (could be undefined)
 */
function SS(mapId, eventId, id, value) {
  const key = GameSelfVariables.makeKey(mapId, eventId, id);
  if (typeof value !== 'undefined') {
    $gameSelfSwitches.setValue(key, !!value);
  }
  return $gameSelfSwitches.value(key);
}

/**
 * Shortcut for variables
 * @param {int} id - The ID of the variable
 * @param {Object} value - The value of the variables (could be undefined)
 */
function V(id, value) {
  if (typeof value !== 'undefined') {
    $gameVariables.setValue(id, value);
  }
  return $gameVariables.value(id);
}

/**
 * Shortcut for SelfVariables
 * @param {int} map - the Map ID
 * @param {int} id - the Event ID
 * @param {int} data - the key
 * @param {boolean} value - The value of the selfVariable (could be undefined)
 */
function SV(mapId, eventId, id, value) {
  const key = GameSelfVariables.makeKey(mapId, eventId, id);
  if (typeof value !== 'undefined') {
    $gameSelfVariables.setValue(key, value);
  }
  return $gameSelfVariables.value(key);
}

/*
 * Patch for Game Interpreter
 */

/**
 * Shortcut to access to self Switches in Event Command
 */
Game_Interpreter.prototype.S = function(key, value) {
  return SS(this._mapId, this._eventId, key, value);
};

/**
 * Shortcut to access to self Variables in Event Command
 */
Game_Interpreter.prototype.V = function(key, value) {
  return SV(this._mapId, this._eventId, key, value);
};

/*
 * Patch for Game Event
 */

/**
 * Shortcut to access to self Switches in Event Move
 */
Game_Event.prototype.S = function(key, value) {
  return SS(this._mapId, this._eventId, key, value);
};

/**
 * Shortcut to access to self Variables in Event Move
 */
Game_Event.prototype.V = function(key, value) {
  return SV(this._mapId, this._eventId, key, value);
};

/*
 * Patch for DataManager
 */
const PICO_DataManager_createGameObjects = DataManager.createGameObjects;
const PICO_DataManager_makeSaveContents = DataManager.makeSaveContents;
const PICO_DataManager_extractSaveContents = DataManager.extractSaveContents;

/**
 * Object's creation
 */
DataManager.createGameObjects = function() {
  PICO_DataManager_createGameObjects.call(this);
  $gameSelfVariables = new GameSelfVariables();
};

/**
 * Make selfVariables saveable
 */
DataManager.makeSaveContents = function() {
  let contents = PICO_DataManager_makeSaveContents.call(this);
  contents.selfVariables = $gameSelfVariables;
  return contents;
};

/**
 * Extract the save contents
 * @param {mixed} contents unserialized values
 */
DataManager.extractSaveContents = function(contents) {
  PICO_DataManager_extractSaveContents.call(this, contents);
  $gameSelfVariables = new GameSelfVariables();
  $gameSelfVariables._data = contents.selfVariables._data;
};
