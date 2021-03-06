var D3 = require("../core/core"),
    d3_document = D3._document,
    d3_window = D3._window;

try {
  d3_document.createElement("div").style.setProperty("opacity", 0, "");
} catch (error) {
  var d3_style_prototype = d3_window.CSSStyleDeclaration.prototype,
      d3_style_setProperty = d3_style_prototype.setProperty;
  d3_style_prototype.setProperty = function(name, value, priority) {
    d3_style_setProperty.call(this, name, value + "", priority);
  };
}
