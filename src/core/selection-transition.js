var D3Transition = require("./transition"),
    d3_selectionPrototype = require("./selection")._selectionPrototype,
    d3_transitionInheritId = D3Transition._transitionInheritId,
    d3_transitionId = D3Transition._transitionId,
    d3_transitionInherit = D3Transition._transitionInherit,
    d3_transitionNode = D3Transition._transitionNode,
    d3_transition = D3Transition._transition;

d3_selectionPrototype.transition = function() {
  var id = d3_transitionInheritId || ++d3_transitionId,
      subgroups = [],
      subgroup,
      node,
      transition = Object.create(d3_transitionInherit);

  transition.time = Date.now();

  for (var j = -1, m = this.length; ++j < m;) {
    subgroups.push(subgroup = []);
    for (var group = this[j], i = -1, n = group.length; ++i < n;) {
      if (node = group[i]) d3_transitionNode(node, i, id, transition);
      subgroup.push(node);
    }
  }

  return d3_transition(subgroups, id);
};
