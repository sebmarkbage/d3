var D3Transition = require("./transition"),
    d3_transitionPrototype = D3Transition._transitionPrototype,
    d3_transitionInherit = D3Transition._transitionInherit,
    d3_transitionInheritId = D3Transition._transitionInheritId,
    d3_selection_each = require("./selection-each")._each;

d3_transitionPrototype.each = function(type, listener) {
  var id = this.id;
  if (arguments.length < 2) {
    var inherit = d3_transitionInherit,
        inheritId = d3_transitionInheritId;
    d3_transitionInheritId = id;
    d3_selection_each(this, function(node, i, j) {
      d3_transitionInherit = node.__transition__[id];
      type.call(node, node.__data__, i, j);
    });
    d3_transitionInherit = inherit;
    d3_transitionInheritId = inheritId;
  } else {
    d3_selection_each(this, function(node) {
      node.__transition__[id].event.on(type, listener);
    });
  }
  return this;
};
