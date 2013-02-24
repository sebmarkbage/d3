var D3 = {version: "3.0.4"}; // semver

var _u03c0 = Math.PI,
    _u03b5 = 1e-6,
    d3_radians = _u03c0 / 180,
    d3_degrees = 180 / _u03c0;

function d3_target(d) {
  return d.target;
}

function d3_source(d) {
  return d.source;
}

D3._u03c0 = _u03c0;
D3._u03b5 = _u03b5;
D3._radians = d3_radians;
D3._degrees = d3_degrees;
D3._target = d3_target;
D3._source = d3_source;

module.exports = D3;
