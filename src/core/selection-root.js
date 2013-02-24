var d3_document = require("./core")._document,
    d3_array = require("./array")._array;

var d3_selectionRoot = require("./selection")._selection([[d3_document]]);

d3_selectionRoot[0].parentNode = require("./selection")._selectRoot;

// TODO fast singleton implementation!
// TODO select(function)
var D3Select = function(selector) {
  return typeof selector === "string"
      ? d3_selectionRoot.select(selector)
      : require("./selection")._selection([[selector]]); // assume node
};

// TODO selectAll(function)
D3Select.all = function(selector) {
  return typeof selector === "string"
      ? d3_selectionRoot.selectAll(selector)
      : require("./selection")._selection([d3_array(selector)]); // assume node[]
};

D3Select._selectionRoot = d3_selectionRoot;

module.exports = D3Select;
