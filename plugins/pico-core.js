'use strict';

/*:
 * @plugindesc Tool for Event Making.
 *
 * @author grm <grimfw@gmail.com>
 * @author xvw <xaviervdw@gmail.com>
 *
 * This plugin add SelfVariables and some small operands !
 * This code is released under MIT license.
 */

const π = {
  version: '1.0.0-alpha'
};

/**
 * Global scoped variables
 */
let $gameSelfVariables;

/**
 * Describe a version (using semantic versionning)
 * (This implementation is cheap and should be improved...)
 *
 * @TODO
 * - add comparison version
 */
class Version {
  constructor(major, minor, patch, label) {
    this.major = major || 0;
    this.minor = minor || 0;
    this.patch = patch || 0;
    if (label) {
      this.label = label.toLowerCase();
    }
  }

  toString() {
    const v = [this.major, this.minor, this.patch].join('.');
    const l = this.label ? `-${this.label}` : '';
    return v + l;
  }
}

/**
 * Parse version
 */
Version.parse = function(versionStr) {
  const matched = versionStr.match(/(\d+\.\d+\.\d+)(?:\-(\w+))*/);
  if (matched) {
    const version = matched[1].split(/\./).map(function(x) {
      return parseInt(x, 10);
    });
    const label = matched[2];
    return new Version(version[0], version[1], version[2], label);
  }
};

/**
 * Get the current version of Pico
 */
Version.current = Version.parse(π.version);

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

/**
 * Public API
 */

π.math = {};
π.item = {};
π.weapon = {};
π.armor = {};
π.actor = {};
π.event = {};
π.map = {};

/**
 * Get a random value betweend a and b
 * @param {int} a min value
 * @param {int} b max value
 */
π.math.random = function(a, b) {
  const data = [a, b].sort();
  const min = data[0];
  const max = data[1];
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Get the percent of two values (`π.math.percent(10, 20) == 50`)
 * @param {int} value value
 * @param {int} value max
 */
π.math.percent = function(value, max) {
  return (value * 100.0) / max;
};

/**
 * Apply a percent to a value (`π.math.apply_percent(50, 200) == 100`)
 * @param {int} value percent
 * @param {int} value value
 */
π.math.apply_percent = function(percent, value) {
  return (percent * value) / 100.0;
};

/**
 * Get the number of items (by Id)
 * @param {int} id the id of the object
 */
π.item.count = function(id) {
  return $gameParty.numItems($dataItems[id]);
};

/**
 * Check if the party has an item (by Id)
 * @param {int} id the id of the object
 */
π.item.has = function(id) {
  return π.item.count(id) > 0;
};

/**
 * Get the number of weapons (by Id)
 * @param {int} id the id of the object
 */
π.weapon.count = function(id) {
  return $gameParty.numItems($dataWeapons[id]);
};

/**
 * Check if the party has an weapon (by Id)
 * @param {int} id the id of the object
 */
π.weapon.has = function(id) {
  return π.weapon.count(id) > 0;
};

/**
 * Get the number of armors (by Id)
 * @param {int} id the id of the object
 */
π.armor.count = function(id) {
  return $gameParty.numItems($dataArmors[id]);
};

/**
 * Check if the party has an armor (by Id)
 * @param {int} id the id of the object
 */
π.armor.has = function(id) {
  return π.armor.count(id) > 0;
};

/**
 * Get the level of an actor
 * @param {int} id the id of the actor
 */
π.actor.level = function(id) {
  const actor = $gameActors.actor(id);
  if (actor) return actor.level;
};

/**
 * Get the current exp of an actor
 * @param {int} id the id of the actor
 */
π.actor.exp = function(id) {
  const actor = $gameActors.actor(id);
  if (actor) return actor.currentExp();
};

/**
 * Get the hp of an actor
 * @param {int} id the id of the actor
 */
π.actor.hp = function(id) {
  const actor = $gameActors.actor(id);
  if (actor) return actor.hp;
};

/**
 * Get the mp of an actor
 * @param {int} id the id of the actor
 */
π.actor.mp = function(id) {
  const actor = $gameActors.actor(id);
  if (actor) return actor.hp;
};

/**
 * Get the max hp of an actor
 * @param {int} id the id of the actor
 */
π.actor.maxhp = function(id) {
  const actor = $gameActors.actor(id);
  if (actor) return actor.mhp;
};

/**
 * Get the max mp of an actor
 * @param {int} id the id of the actor
 */
π.actor.maxmp = function(id) {
  const actor = $gameActors.actor(id);
  if (actor) return actor.mmp;
};

/**
 * Get the atk point of an actor
 * @param {int} id the id of the actor
 */
π.actor.atk = function(id) {
  const actor = $gameActors.actor(id);
  if (actor) return actor.atk;
};

/**
 * Get the def point of an actor
 * @param {int} id the id of the actor
 */
π.actor.def = function(id) {
  const actor = $gameActors.actor(id);
  if (actor) return actor.def;
};

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

/**
 * To be easy
 */
const Pico = π;
