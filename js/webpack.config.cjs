const legacy = require('flarum-webpack-config-v1')();
const modern = require('flarum-webpack-config')();

// Each Flarum major has its own module loader. Build both from the same source.
legacy.name = 'flarum-1';
legacy.output.filename = '[name]-1.x.js';
modern.name = 'flarum-2';

// Both compilers share dist; neither should remove the other's output.
legacy.output.clean = false;
modern.output.clean = false;

module.exports = [legacy, modern];
