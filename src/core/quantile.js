// R-7 per <http://en.wikipedia.org/wiki/Quantile>
var D3Quantile = function(values, p) {
  var H = (values.length - 1) * p + 1,
      h = Math.floor(H),
      v = +values[h - 1],
      e = H - h;
  return e ? v + e * (values[h] - v) : v;
};

module.exports = D3Quantile;
