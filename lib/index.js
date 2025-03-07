var debug = require('debug')('loopback-component-migrate');
var loopback = require('loopback');
var migrationDef = require('./models/migration.json');

// Remove proerties that will confuse LB
function getSettings(def) {
  var settings = {};
  for (var s in def) {
    if (s === 'name' || s === 'properties') {
      continue;
    } else {
      settings[s] = def[s];
    }
  }
  return settings;
}

/**
 * @param {Object} app The app instance
 * @param {Object} options The options object
 */
module.exports = function(app, options) {
  var loopback = app.loopback;
  options = options || {};

  var dataSource = options.dataSource || 'db';
  if (typeof dataSource === 'string') {
    dataSource = app.dataSources[dataSource];
  }

  var migrationModelSettings = getSettings(migrationDef);

  if (typeof options.acls !== 'object') {
    migrationModelSettings.acls = [];
  } else {
    migrationModelSettings.acls = options.acls;
  }

  // Support for loopback 2.x.
  if (app.loopback.version.startsWith(2)) {
    Object.keys(migrationModelSettings.methods).forEach(key => {
      migrationModelSettings.methods[key].isStatic = true;
    });
  }

  debug('Creating Migration model using settings: %o', migrationModelSettings);
  var MigrationModel = dataSource.createModel(
    migrationDef.name,
    migrationDef.properties,
    migrationModelSettings);

  var Migration = require('./models/migration')(MigrationModel, options);

  app.model(Migration, {
    public: !!options.enableRest,
    dataSource: dataSource
  });
};
