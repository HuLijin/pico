'use strict';

/*:
 * @plugindesc Tool for Event Making.
 *
 * @author grm <grimfw@gmail.com>
 * @author xvw <xaviervdw@gmail.com>
 * @author joke <joke@biloucorp.com>
 *
 * This plugin add SelfVariables and some small operands !
 * This code is released under MIT license.
 */

const π = {
  core: {},
  _artifacts: {
    version: '1.0.1-dev'
  }
};

/**
 * Global scoped variables
 */
let $gameSelfVariables;

/**
 * Describe a version (using semantic versionning)
 * (This implementation is cheap and should be improved...)
 */
class Version {
  constructor(major, minor, patch, label) {
    this.major = major || 0;
    this.minor = minor || 0;
    this.patch = patch || 0;
    if (label) {
      this.label = label.toLowerCase();
      this.checkLabel();
    }
  }

  labels() {
    return {
      dev: 0,
      alpha: 1,
      beta: 2,
      prebuilt: 3,
      stable: 4
    };
  }

  checkLabel() {
    const label = this.labels()[this.label];
    if (!label && label !== 0) {
      throw `Invalid Version Label : ${this.label}`;
    }
  }

  compareTo(otherVersion) {
    if (this.major > otherVersion.major) return 1;
    if (this.major < otherVersion.major) return -1;
    if (this.minor > otherVersion.minor) return 1;
    if (this.minor < otherVersion.minor) return -1;
    if (this.path > otherVersion.patch) return 1;
    if (this.path < otherVersion.patch) return -1;
    const label1 = this.labels()[this.label || 'stable'];
    const label2 = this.labels()[otherVersion.label || 'stable'];
    if (label1 > label2) return 1;
    if (label1 < label2) return -1;
    return 0;
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
 * Parse version constraint
 */
Version.parseConstraint = function(constraint) {
  const checker = function(operator, version) {
    return function(base) {
      const result = base.compareTo(version);
      if (operator === '!=' && result !== 0) return;
      if (operator === '>' && result === 1) return;
      if (operator === '<' && result === -1) return;
      if (operator === '==' && result === 0) return;
      if (operator === '>=' && result >= 0) return;
      if (operator === '<=' && result <= 0) return;
      throw `Version contract violated : ${base} ${operator} ${version}`;
    };
  };
  return constraint
    .split(/and/)
    .map(function(elt) {
      return elt
        .trim()
        .match(/\s*(>=|<=|==|\!=|>|<)\s*(.+)/)
        .slice(1);
    })
    .map(function(recipe) {
      const operator = recipe[0];
      const version = Version.parse(recipe[1]);
      if (!version) {
        throw `Invalid version ${recipe[1]}`;
      }
      return checker(operator, version);
    });
};

/**
 * Check a constraint
 */
Version.check = function(base, constraint) {
  const baseVersion = typeof base === 'string' ? Version.parse(base) : base;
  Version.parseConstraint(constraint).forEach(function(callback) {
    callback(baseVersion);
  });
  return true;
};

/**
 * Get the current version of Pico
 */
Version.current = Version.parse(π._artifacts.version);
π.core.version = Version.current;
π.core.require = function(deps) {
  if (Utils.isOptionValid('test')) {
    deps.forEach(function(elt) {
      Version.check(elt[0], elt[1]);
    });
  }
};

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
    if (typeof value !== 'undefined') {
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
π.player = {};
π.map = {};
π.party = {};

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
π.actor.max_hp = function(id) {
  const actor = $gameActors.actor(id);
  if (actor) return actor.mhp;
};

/**
 * Get the max mp of an actor
 * @param {int} id the id of the actor
 */
π.actor.max_mp = function(id) {
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

/**
 * Get the x-coord of an event/player
 * @param {int} id the id of the character (0 for the hero)
 */
π.event.x = function(id) {
  const character = id > 0 ? $gameMap.event(id) : $gamePlayer;
  if (character) return character.x;
};

/**
 * Get the x-coord of the player
 */
π.player.x = function() {
  return π.event.x(0);
};

/**
 * Get the y-coord of an event/player
 * @param {int} id the id of the character (0 for the hero)
 */
π.event.y = function(id) {
  const character = id > 0 ? $gameMap.event(id) : $gamePlayer;
  if (character) return character.y;
};

/**
 * Get the y-coord of the player
 */
π.player.y = function() {
  return π.event.y(0);
};

/**
 * Get the x-coord of an event/player
 * @param {int} id the id of the character (0 for the hero)
 */
π.event.screen_x = function(id) {
  const character = id > 0 ? $gameMap.event(id) : $gamePlayer;
  if (character) return character.screenX();
};

/**
 * Get the x-coord of the player
 */
π.player.screen_x = function() {
  return π.event.screen_x(0);
};

/**
 * Get the y-coord of an event/player
 * @param {int} id the id of the character (0 for the hero)
 */
π.event.screen_y = function(id) {
  const character = id > 0 ? $gameMap.event(id) : $gamePlayer;
  if (character) return character.screenY();
};

/**
 * Get the y-coord of the player
 */
π.player.screen_y = function() {
  return π.event.screen_y(0);
};

/**
 * Get the direction of an event/player (2, 4, 6, 8)
 * @param {int} id the id of the character (0 for the hero)
 */
π.event.direction = function(id) {
  const character = id > 0 ? $gameMap.event(id) : $gamePlayer;
  if (character) return character.direction;
};

/**
 * Get the direction of the player (2, 4, 6, 8)
 */
π.player.direction = function() {
  return π.event.direction(0);
};

/**
 * Get the map ID
 */
π.map.id = function() {
  return $gameMap.mapId();
};

/**
 * Get the width of the map
 */
π.map.width = function() {
  return $gameMap.width();
};

/**
 * Get the height of the map
 */
π.map.height = function() {
  return $gameMap.height();
};

/**
 * Get the display name of the current map
 */
π.map.display_name = function() {
  return $gameMap.displayName();
};

/**
 * Get the team size
 */
π.party.team_size = function() {
  return $gameParty.size();
};

/**
 * Get the gold
 */
π.party.gold = function() {
  return $gameParty.gold();
};

/**
 * Get the steps
 */
π.party.steps = function() {
  return $gameParty.steps();
};

/**
 * Get the playtime
 */
π.party.playtime = function() {
  return $gameSystem.playtime();
};

/**
 * Get the timer's value (in second)
 */
π.party.timer = function() {
  return $gameTimer.seconds();
};

/**
 * Get the number of save
 */
π.party.save_count = function() {
  return $gameSystem.saveCount();
};

/**
 * Get the number of battle
 */
π.party.battle_count = function() {
  return $gameSystem.battleCount();
};

/**
 * Get the number of victory
 */
π.party.victory_count = function() {
  return $gameSystem.winCount();
};

/**
 * Get the number of escape
 */
π.party.escape_count = function() {
  return $gameSystem.escapeCount();
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
