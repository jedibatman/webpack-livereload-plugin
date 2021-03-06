var test = require('tape');
var LiveReloadPlugin = require('./index');

test('default options', function(t) {
  var plugin = new LiveReloadPlugin();
  t.equal(plugin.port, 35729);
  t.equal(plugin.ignore, null);
  t.equal(plugin.isRunning, false);
  t.end();
});

test('not running', function(t) {
  var plugin = new LiveReloadPlugin();
  t.equal(plugin.isRunning, false);
  t.end();
});

test('running after start', function(t) {
  var plugin = new LiveReloadPlugin();
  plugin.start(null, function() {
    t.notLooseEqual(plugin.server, null);
    t.ok(plugin.isRunning);
    plugin.server.on('close', function() {
      t.end();
    });
    plugin.server.close();
  });
});

test('notifies when done', function(t) {
  var plugin = new LiveReloadPlugin();
  var stats = {
    compilation: {
      assets: {'b.js': '123', 'a.js': '456', 'c.css': '789'},
      hash: 'hash'
    }
  };
  plugin.server = {
    notifyClients: function(files) {
      t.deepEqual(files.sort(), ['a.js', 'b.js', 'c.css']);
      t.equal(plugin.lastHash, stats.compilation.hash);
      t.end();
    }
  };
  plugin.done(stats);
});

test('filters out ignored files', function(t) {
  var plugin = new LiveReloadPlugin({
    ignore: /\.css$/
  });
  var stats = {
    compilation: {
      assets: {'b.js': '123', 'a.js': '456', 'c.css': '789'}
    }
  };
  plugin.server = {
    notifyClients: function(files) {
      t.deepEqual(files.sort(), ['a.js', 'b.js']);
      t.end();
    }
  };
  plugin.done(stats);
});
