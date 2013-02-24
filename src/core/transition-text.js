var d3_transitionPrototype = require("./transition")._transitionPrototype,
    d3_transition_tween = require("./transition-tween")._tween;

d3_transitionPrototype.text = function(value) {
  return d3_transition_tween(this, "text", value, d3_transition_text);
};

function d3_transition_text(b) {
  if (b == null) b = "";
  return function() { this.textContent = b; };
}
