function monkeypatch(cls, fn) {
  const orig = cls.prototype[fn.name].__original || cls.prototype[fn.name];
  function wrapped() {
    return fn.bind(this, orig).apply(this, arguments);
  }
  wrapped.__original = orig;

  cls.prototype[fn.name] = wrapped;
}

module.exports = {
  initArguments: {},
  configFunction: function(eleventyConfig, options = {}) {
    setImmediate(function() {
      const TemplateData = require('@11ty/eleventy/src/TemplateData.js');
      if (!TemplateData || !TemplateData.prototype) {
        return;
      }

      const path = require('path');
      const fs = require('fs');
      const lodashUniq = require('lodash.uniq');
      const jsyaml = require('js-yaml');

      function getLocalData(original, tmplPath) {
        return Promise.all([
          original.apply(this, [tmplPath]),
          this.getLocalDataPaths(tmplPath)
        ]).then(function(args) {
          const data = args[0];
          const dataPaths = lodashUniq(
            args[1].map(function(p) {
              return p.substr(0, p.length - path.extname(p).length) + '.yaml';
            })
          );
          return Object.assign.apply(
            null,
            [data].concat(
              dataPaths.map(function(fn) {
                try {
                  return jsyaml.load(fs.readFileSync(fn));
                } catch (err) {
                  return {};
                }
              })
            )
          );
        }, Promise.reject);
      }
      function getTemplateDataFileGlob(original) {
        var suffix = this.config.jsDataFileSuffix;
        return original.apply(this, arguments).then(function(arr) {
          return arr.concat([
            path.join(path.dirname(arr[0]), `*${suffix}.yaml`)
          ]);
        }, Promise.reject);
      }
      monkeypatch(TemplateData, getLocalData);
      monkeypatch(TemplateData, getTemplateDataFileGlob);
    });
  }
};

// vim: sw=2 ts=2 et
