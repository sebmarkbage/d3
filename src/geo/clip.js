var D3 = require("../core/core"),
    _u03b5 = D3._u03b5,
    _u03c0 = D3._u03c0,
    d3_noop = require("../core/noop")._noop,
    D3Merge = require("../core/merge");

function d3_geo_clip(pointVisible, clipLine, interpolate) {
  return function(listener) {
    var line = clipLine(listener);

    var clip = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() {
        clip.point = pointRing;
        clip.lineStart = ringStart;
        clip.lineEnd = ringEnd;
        invisible = false;
        invisibleArea = visibleArea = 0;
        segments = [];
        listener.polygonStart();
      },
      polygonEnd: function() {
        clip.point = point;
        clip.lineStart = lineStart;
        clip.lineEnd = lineEnd;

        segments = D3Merge(segments);
        if (segments.length) {
          d3_geo_clipPolygon(segments, interpolate, listener);
        } else if (visibleArea < -_u03b5 || invisible && invisibleArea < -_u03b5) {
          listener.lineStart();
          interpolate(null, null, 1, listener);
          listener.lineEnd();
        }
        listener.polygonEnd();
        segments = null;
      },
      sphere: function() {
        listener.polygonStart();
        listener.lineStart();
        interpolate(null, null, 1, listener);
        listener.lineEnd();
        listener.polygonEnd();
      }
    };

    function point(_u03bb, _u03c6) { if (pointVisible(_u03bb, _u03c6)) listener.point(_u03bb, _u03c6); }
    function pointLine(_u03bb, _u03c6) { line.point(_u03bb, _u03c6); }
    function lineStart() { clip.point = pointLine; line.lineStart(); }
    function lineEnd() { clip.point = point; line.lineEnd(); }

    var segments,
        visibleArea,
        invisibleArea,
        invisible;

    var buffer = d3_geo_clipBufferListener(),
        ringListener = clipLine(buffer),
        ring;

    function pointRing(_u03bb, _u03c6) {
      ringListener.point(_u03bb, _u03c6);
      ring.push([_u03bb, _u03c6]);
    }

    function ringStart() {
      ringListener.lineStart();
      ring = [];
    }

    function ringEnd() {
      pointRing(ring[0][0], ring[0][1]);
      ringListener.lineEnd();

      var clean = ringListener.clean(),
          ringSegments = buffer.buffer(),
          segment,
          n = ringSegments.length;

      // TODO compute on-the-fly?
      if (!n) {
        invisible = true;
        invisibleArea += d3_geo_clipAreaRing(ring, -1);
        ring = null;
        return;
      }
      ring = null;

      // No intersections.
      // TODO compute on-the-fly?
      if (clean & 1) {
        segment = ringSegments[0];
        visibleArea += d3_geo_clipAreaRing(segment, 1);
        var n = segment.length - 1,
            i = -1,
            point;
        listener.lineStart();
        while (++i < n) listener.point((point = segment[i])[0], point[1]);
        listener.lineEnd();
        return;
      }

      // Rejoin connected segments.
      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

      segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
    }

    return clip;
  };
}

// General spherical polygon clipping algorithm: takes a polygon, cuts it into
// visible line segments and rejoins the segments by interpolating along the
// clip edge.  If there are no intersections with the clip edge, the whole clip
// edge is inserted if appropriate.
function d3_geo_clipPolygon(segments, interpolate, listener) {
  var subject = [],
      clip = [];

  segments.forEach(function(segment) {
    var n = segment.length;
    if (n <= 1) return;
    var p0 = segment[0],
        p1 = segment[n - 1],
        a = {point: p0, points: segment, other: null, visited: false, entry: true, subject: true},
        b = {point: p0, points: [p0], other: a, visited: false, entry: false, subject: false};
    a.other = b;
    subject.push(a);
    clip.push(b);
    a = {point: p1, points: [p1], other: null, visited: false, entry: false, subject: true};
    b = {point: p1, points: [p1], other: a, visited: false, entry: true, subject: false};
    a.other = b;
    subject.push(a);
    clip.push(b);
  });
  clip.sort(d3_geo_clipSort);
  d3_geo_clipLinkCircular(subject);
  d3_geo_clipLinkCircular(clip);
  if (!subject.length) return;
  var start = subject[0],
      current,
      points,
      point;
  while (1) {
    // Find first unvisited intersection.
    current = start;
    while (current.visited) if ((current = current.next) === start) return;
    points = current.points;
    listener.lineStart();
    do {
      current.visited = current.other.visited = true;
      if (current.entry) {
        if (current.subject) {
          for (var i = 0; i < points.length; i++) listener.point((point = points[i])[0], point[1]);
        } else {
          interpolate(current.point, current.next.point, 1, listener);
        }
        current = current.next;
      } else {
        if (current.subject) {
          points = current.prev.points;
          for (var i = points.length; --i >= 0;) listener.point((point = points[i])[0], point[1]);
        } else {
          interpolate(current.point, current.prev.point, -1, listener);
        }
        current = current.prev;
      }
      current = current.other;
      points = current.points;
    } while (!current.visited);
    listener.lineEnd();
  }
}

function d3_geo_clipLinkCircular(array) {
  if (!(n = array.length)) return;
  var n,
      i = 0,
      a = array[0],
      b;
  while (++i < n) {
    a.next = b = array[i];
    b.prev = a;
    a = b;
  }
  a.next = b = array[0];
  b.prev = a;
}

// Intersection points are sorted along the clip edge. For both antimeridian
// cutting and circle clipping, the same comparison is used.
function d3_geo_clipSort(a, b) {
  return ((a = a.point)[0] < 0 ? a[1] - _u03c0 / 2 - _u03b5 : _u03c0 / 2 - a[1])
       - ((b = b.point)[0] < 0 ? b[1] - _u03c0 / 2 - _u03b5 : _u03c0 / 2 - b[1]);
}

function d3_geo_clipSegmentLength1(segment) {
  return segment.length > 1;
}

function d3_geo_clipBufferListener() {
  var lines = [],
      line;
  return {
    lineStart: function() { lines.push(line = []); },
    point: function(_u03bb, _u03c6) { line.push([_u03bb, _u03c6]); },
    lineEnd: d3_noop,
    buffer: function() {
      var buffer = lines;
      lines = [];
      line = null;
      return buffer;
    }
  };
}

// Approximate polygon ring area (_u00d72, since we only need the sign).
// For an invisible polygon ring, we rotate longitudinally by 180_u00b0.
// The invisible parameter should be 1, or -1 to rotate longitudinally.
// Based on Robert. G. Chamberlain and William H. Duquette,
// _u201cSome Algorithms for Polygons on a Sphere_u201d,
// http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
function d3_geo_clipAreaRing(ring, invisible) {
  if (!(n = ring.length)) return 0;
  var n,
      i = 0,
      area = 0,
      p = ring[0],
      _u03bb = p[0],
      _u03c6 = p[1],
      cos_u03c6 = Math.cos(_u03c6),
      x0 = Math.atan2(invisible * Math.sin(_u03bb) * cos_u03c6, Math.sin(_u03c6)),
      y0 = 1 - invisible * Math.cos(_u03bb) * cos_u03c6,
      x1 = x0,
      x, // _u03bb'; _u03bb rotated to south pole.
      y; // _u03c6' = 1 + sin(_u03c6); _u03c6 rotated to south pole.
  while (++i < n) {
    p = ring[i];
    cos_u03c6 = Math.cos(_u03c6 = p[1]);
    x = Math.atan2(invisible * Math.sin(_u03bb = p[0]) * cos_u03c6, Math.sin(_u03c6));
    y = 1 - invisible * Math.cos(_u03bb) * cos_u03c6;

    // If both the current point and the previous point are at the north pole,
    // skip this point.
    if (Math.abs(y0 - 2) < _u03b5 && Math.abs(y - 2) < _u03b5) continue;

    // If this or the previous point is at the south pole, or if this segment
    // goes through the south pole, the area is 0.
    if (Math.abs(y) < _u03b5 || Math.abs(y0) < _u03b5) {}

    // If this segment goes through either pole_u2026
    else if (Math.abs(Math.abs(x - x0) - _u03c0) < _u03b5) {
      // For the north pole, compute lune area.
      if (y + y0 > 2) area += 4 * (x - x0);
      // For the south pole, the area is zero.
    }

    // If the previous point is at the north pole, then compute lune area.
    else if (Math.abs(y0 - 2) < _u03b5) area += 4 * (x - x1);

    // Otherwise, the spherical triangle area is approximately
    // _u03b4_u03bb * (1 + sin_u03c60 + 1 + sin_u03c6) / 2.
    else area += ((3 * _u03c0 + x - x0) % (2 * _u03c0) - _u03c0) * (y0 + y);

    x1 = x0, x0 = x, y0 = y;
  }
  return area;
}

exports._clip = d3_geo_clip;
