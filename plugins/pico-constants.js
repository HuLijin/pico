'use strict';

/*:
 * @plugindesc Plugin Constants for πco
 *
 * @author grm <grimfw@gmail.com>
 *
 * License MIT
 */

// Check dependencies betweens plugins
if (typeof π === 'undefined') throw 'Core is not installed';
π.core.require([[π.core.version, '>= 1.0.2-dev']]);

// The core of the script
π.constants = {
  version: '1.0.0-dev'
};

/**
 * Describes a direction
 */
π.direction = {
  TOP: 8,
  LEFT: 4,
  RIGHT: 6,
  BOTTOM: 2
};

/**
 * Describes an origin
 */
π.origin = {
  TOP_LEFT: 0,
  CENTER: 1,
  TOP_CENTER: 2,
  TOP_RIGHT: 3,
  CENTER_LEFT: 4,
  CENTER_CENTER: 1,
  CENTER_RIGHT: 5,
  BOTTOM_LEFT: 6,
  BOTTOM_CENTER: 7,
  BOTTOM_RIGHT: 8,
  free: function(x, y) {
    return [x, y];
  }
};

/**
 * Describe a blend mode
 */
π.blend = {
  NORMAL: 0,
  ADD: 1,
  MULTIPLY: 2,
  SCREEN: 3,
  OVERLAY: 4
};
