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
      const fs = require('fs').promises;
      const lodashUniq = require('lodash.uniq');
      const jsyaml = require('js-yaml');

      async function yamlFilePathToObject(yamlFilePath) {
        try {
          const yamlFileContent = await fs.readFile(yamlFilePath, 'utf-8');
          return jsyaml.load(yamlFileContent);
        } catch (err) {
          return {};
        }
      }

      async function getLocalData(original, tmplPath) {
        const [data, localDataPaths] = await Promise.all([
          original.apply(this, [tmplPath]),
          this.getLocalDataPaths(tmplPath)
        ]);

        const dataPaths = lodashUniq(
          localDataPaths.map(
            p => p.substr(0, p.length - path.extname(p).length) + '.yaml'
          )
        );

        const dataFromYamlFiles = await Promise.all(
          dataPaths.map(yamlFilePathToObject)
        );

        return Object.assign.apply(null, [data].concat(dataFromYamlFiles));
      }

      async function getTemplateDataFileGlob(original) {
        const suffix = this.config.jsDataFileSuffix;
        const glob = await original.apply(this, arguments);
        return glob.concat([
          path.join(path.dirname(glob[0]), `*${suffix}.yaml`)
        ]);
      }

      monkeypatch(TemplateData, getLocalData);
      monkeypatch(TemplateData, getTemplateDataFileGlob);
    });
  }
};

// vim: sw=2 ts=2 et
