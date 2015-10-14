/* jshint node: true */
'use strict';

var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');
var uglify = require('broccoli-uglify-js');

module.exports = {
  name: 'ember-keyboard',

  treeForPublic: function() {
    var workers = pickFiles('workers', {
      srcDir: '/',
      files: ['*.js'],
      destDir: '/assets/workers'
    });

    workers = uglify(workers, {
      mangle: true,
      compress: true
    });

    return mergeTrees(workers);
  }
};
