var d3_selectionPrototype = require("./selection")._selectionPrototype,
    D3NS = require("./ns");

// TODO append(node)?
// TODO append(function)?
d3_selectionPrototype.append = function(name) {
  name = D3NS.qualify(name);

  function append() {
    return this.appendChild(document.createElementNS(this.namespaceURI, name));
  }

  function appendNS() {
    return this.appendChild(document.createElementNS(name.space, name.local));
  }

  return this.select(name.local ? appendNS : append);
};
