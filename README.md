# eleventy-plugin-yamldata

A plugin that allows yaml file as a local data file for template.

## Installation

From github,

```
yarn add https://github.com/gwangyi/eleventy-plugin-yamldata
```

Open up your Eleventy config file (probably `eleventy.js`) and use `addPlugin`:

```js
const pluginYamldata = require("eleventy-plugin-yamldata");
module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(pluginYamldata);
};
```

## Usage

Make a yaml file like `filename.11tydata.yaml` same as json/js data file.

## Note

This plugin implemented by monkeypatching an internal class of eleventy. If internal classes of eleventy is changed so far, this plugin may not works.
