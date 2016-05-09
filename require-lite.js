!function (root) {
  function define(name, factory) {
    var module = modules[name];
    if (module) {
      throw 'Module is already defined: ' + name;
    }
    module = modules[name] = {
      name: name,
      factory: factory,
      data: {
        exports: {},
      },
      initialized: false,
    };
  }

  function require(name) {
    var module = modules[name];
    if (!module) {
      throw 'Module not found: ' + name;
    }
    if (!module.initialized) {
      module.factory(require, module.data.exports, module.data);
    }
    return module.data.exports;
  }

  function use(name) {
    require(name);
  }

  var modules = {};
  root.define = define;
  define.use = use;
}(this);
