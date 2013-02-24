var D3Time = require("./time"),
    d3_time = D3Time._time,
    d3_time_utc = D3Time._utc,
    D3TimeFormat = require("./format");

var D3TimeFormatUtc = function(template) {
  var local = D3TimeFormat(template);

  function format(date) {
    try {
      d3_time = d3_time_utc;
      var utc = new d3_time();
      utc._ = date;
      return local(utc);
    } finally {
      d3_time = Date;
    }
  }

  format.parse = function(string) {
    try {
      d3_time = d3_time_utc;
      var date = local.parse(string);
      return date && date._;
    } finally {
      d3_time = Date;
    }
  };

  format.toString = local.toString;

  return format;
};

module.exports = D3TimeFormatUtc;
