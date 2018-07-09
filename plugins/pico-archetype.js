'use strict';

/*:
 * @plugindesc An plugin example for πco
 *
 * @author your-nickname <your-email>
 *
 * Describes the plugin
 * Describes the licenses
 */

// Check dependencies betweens plugins
if (typeof π === 'undefined') throw 'Core is not installed';
π.core.require([[π.core.version, '>= 1.0.2-dev']]);

// The core of the script
console.log('This script is valid!');
