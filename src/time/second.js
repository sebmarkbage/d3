var d3_time_interval = require("./interval")._interval,
    d3_time = require("./time")._time;

var D3TimeSecond = d3_time_interval(function(date) {
  return new d3_time(Math.floor(date / 1e3) * 1e3);
}, function(date, offset) {
  date.setTime(date.getTime() + Math.floor(offset) * 1e3); // DST breaks setSeconds
}, function(date) {
  return date.getSeconds();
});

D3TimeSecond.s = D3TimeSecond.range;
D3TimeSecond.s.utc = D3TimeSecond.utc.range;

module.exports = D3TimeSecond;
