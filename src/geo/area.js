var D3 = require("../core/core"),
    _u03c0 = D3._u03c0,
    d3_noop = require("../core/noop")._noop,
    d3_radians = D3._radians,
    _u03b5 = D3._u03b5,
    D3GeoStream = require("./stream");

var D3GeoArea = function(object) {
  d3_geo_areaSum = 0;
  D3GeoStream(object, d3_geo_area);
  return d3_geo_areaSum;
};

var d3_geo_areaSum,
    d3_geo_areaRing;

var d3_geo_area = {
  sphere: function() { d3_geo_areaSum += 4 * _u03c0; },
  point: d3_noop,
  lineStart: d3_noop,
  lineEnd: d3_noop,

  // Only count area for polygon rings.
  polygonStart: function() {
    d3_geo_areaRing = 0;
    d3_geo_area.lineStart = d3_geo_areaRingStart;
  },
  polygonEnd: function() {
    d3_geo_areaSum += d3_geo_areaRing < 0 ? 4 * _u03c0 + d3_geo_areaRing : d3_geo_areaRing;
    d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
  }
};

function d3_geo_areaRingStart() {
  var _u03bb00, _u03c600, _u03bb1, _u03bb0, _u03c60, cos_u03c60, sin_u03c60; // start point and two previous points

  // For the first point, _u2026
  d3_geo_area.point = function(_u03bb, _u03c6) {
    d3_geo_area.point = nextPoint;
    _u03bb1 = _u03bb0 = (_u03bb00 = _u03bb) * d3_radians, _u03c60 = (_u03c600 = _u03c6) * d3_radians, cos_u03c60 = Math.cos(_u03c60), sin_u03c60 = Math.sin(_u03c60);
  };

  // For subsequent points, _u2026
  function nextPoint(_u03bb, _u03c6) {
    _u03bb *= d3_radians, _u03c6 *= d3_radians;

    // If both the current point and the previous point are polar, skip this point.
    if (Math.abs(Math.abs(_u03c60) - _u03c0 / 2) < _u03b5 && Math.abs(Math.abs(_u03c6) - _u03c0 / 2) < _u03b5) return;
    var cos_u03c6 = Math.cos(_u03c6), sin_u03c6 = Math.sin(_u03c6);

    // If the previous point is at the north pole, then compute lune area.
    if (Math.abs(_u03c60 - _u03c0 / 2) < _u03b5) d3_geo_areaRing += (_u03bb - _u03bb1) * 2;

    // Area of spherical triangle with vertices at south pole, previous point
    // and current point = ER_u00b2, where E is the spherical excess, and in our
    // case, R = 1.
    else {
      var d_u03bb = _u03bb - _u03bb0,
          cosd_u03bb = Math.cos(d_u03bb),
          // Distance from previous point to current point, well-conditioned
          // for all angles.
          d = Math.atan2(Math.sqrt((d = cos_u03c6 * Math.sin(d_u03bb)) * d + (d = cos_u03c60 * sin_u03c6 - sin_u03c60 * cos_u03c6 * cosd_u03bb) * d), sin_u03c60 * sin_u03c6 + cos_u03c60 * cos_u03c6 * cosd_u03bb),
          // Half the semiperimeter (a + b + c) / 2, where a, b and c are the
          // lengths of the triangle sides.
          s = (d + _u03c0 + _u03c60 + _u03c6) / 4;
      // Compute the spherical excess E using l_u2019Huilier_u2019s theorem,
      // tan(E / 4) = _u221a[tan(s)tan(s - a / 2)tan(s - b / 2)tan(s - c / 2)].
      d3_geo_areaRing += (d_u03bb < 0 && d_u03bb > -_u03c0 || d_u03bb > _u03c0 ? -4 : 4) * Math.atan(Math.sqrt(Math.abs(Math.tan(s) * Math.tan(s - d / 2) * Math.tan(s - _u03c0 / 4 - _u03c60 / 2) * Math.tan(s - _u03c0 / 4 - _u03c6 / 2))));
    }

    // Advance the previous points.
    _u03bb1 = _u03bb0, _u03bb0 = _u03bb, _u03c60 = _u03c6, cos_u03c60 = cos_u03c6, sin_u03c60 = sin_u03c6;
  }

  // For the last point, return to the start.
  d3_geo_area.lineEnd = function() {
    nextPoint(_u03bb00, _u03c600);
  };
}

module.exports = D3GeoArea;
