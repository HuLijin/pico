'use strict';

/*:
 * @plugindesc Plugin Pictures for πco
 *
 * @author grm <grimfw@gmail.com>
 *
 * License MIT
 */

// Check dependencies betweens plugins
if (typeof π === 'undefined') throw 'Core is not installed';
π.core.require([[π.core.version, '>= 1.0.0-dev']]);

// The core of the script
π.picture = {};

/**
 * Show a picture
 * @param {int} id the id of the picture
 * @param {string} name the name of the picture
 * @param {int} x the x-coord of the picture
 * @param {int} y the y-coord of the picture
 */
π.picture.show = function(id, name, x, y) {
  $gameScreen.showPicture(id, name, 0, x, y, 100, 100, 255, 0);
};
