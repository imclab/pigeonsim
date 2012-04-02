(function() {

  this.SkyText = (function() {

    SkyText.prototype.piOver180 = Math.PI / 180;

    SkyText.prototype.latFactor = 0.00001;

    SkyText.prototype.fontHeight = 5;

    function SkyText(lat, lon, alt, o) {
      var lonRatio;
      this.lat = lat;
      this.lon = lon;
      this.alt = alt;
      if (o == null) o = {};
      if (o.lineWidth == null) o.lineWidth = 1;
      if (o.colour == null) o.colour = 'ffffffff';
      this.allCoordSets = [];
      this.lineOpts = [];
      if (o.lineWidth > 0) {
        this.allCoordSets.push([[[this.lon, this.lat, 0], [this.lon, this.lat, this.alt]]]);
        this.lineOpts.push(o);
      }
      lonRatio = 1 / Math.cos(this.lat * this.piOver180);
      this.lonFactor = this.latFactor * lonRatio;
    }

    SkyText.prototype.text = function(text, o) {
      var line, _i, _len, _ref, _results;
      _ref = text.split("\n");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        _results.push(this.line(line, o));
      }
      return _results;
    };

    SkyText.prototype.line = function(text, o) {
      var absX, alt, bRad, char, coords, cosB, i, lat, latFactor, latStart, lineCoordSets, lon, lonFactor, lonStart, maxX, path, paths, sinB, tabWidth, x, xCursor, y, _i, _j, _len, _len2, _ref, _ref2;
      if (o == null) o = {};
      if (o.bearing == null) o.bearing = 0;
      if (o.size == null) o.size = 2;
      if (o.lineWidth == null) o.lineWidth = 2;
      if (o.colour == null) o.colour = 'ffffffff';
      if (o.lineSpace == null) o.lineSpace = 1;
      if (o.charSpace == null) o.charSpace = 1;
      if (o.spaceWidth == null) o.spaceWidth = 2;
      if (o.tabSpaces == null) o.tabSpaces = 4;
      if (o.offset == null) o.offset = 5;
      if (o.font == null) o.font = this.font;
      bRad = o.bearing * this.piOver180;
      sinB = Math.sin(bRad);
      cosB = Math.cos(bRad);
      latFactor = sinB * o.size * this.latFactor;
      lonFactor = cosB * o.size * this.lonFactor;
      latStart = this.lat + sinB * o.offset * this.latFactor;
      lonStart = this.lon + cosB * o.offset * this.lonFactor;
      xCursor = 0;
      tabWidth = o.tabSpaces * o.spaceWidth;
      lineCoordSets = [];
      _ref = text.split('');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        char = _ref[_i];
        if (char === " " || char === "\n" || char === "\r") {
          xCursor += o.spaceWidth;
          continue;
        }
        if (char === "\t") {
          xCursor = Math.ceil((xCursor + 1) / tabWidth) * tabWidth;
          continue;
        }
        paths = (_ref2 = o.font[char]) != null ? _ref2 : o.font['na'];
        maxX = 0;
        for (_j = 0, _len2 = paths.length; _j < _len2; _j++) {
          path = paths[_j];
          coords = (function() {
            var _len3, _results, _step;
            _results = [];
            for (i = 0, _len3 = path.length, _step = 2; i < _len3; i += _step) {
              x = path[i];
              y = path[i + 1];
              if (x > maxX) maxX = x;
              absX = xCursor + x;
              lat = latStart + absX * latFactor;
              lon = lonStart + absX * lonFactor;
              alt = this.alt - (y * o.size);
              _results.push([lon, lat, alt]);
            }
            return _results;
          }).call(this);
          lineCoordSets.push(coords);
        }
        xCursor += maxX + o.charSpace;
      }
      this.alt -= (o.size * this.fontHeight) + o.lineSpace;
      this.lineOpts.push(o);
      this.allCoordSets.push(lineCoordSets);
      return this;
    };

    SkyText.prototype.kml = function() {
      var coordStr, coordStrs, coords, i, k, lineCoordSets, lineCoords, o;
      k = [];
      k.push('<Document>');
      coordStrs = (function() {
        var _len, _ref, _results;
        _ref = this.allCoordSets;
        _results = [];
        for (i = 0, _len = _ref.length; i < _len; i++) {
          lineCoordSets = _ref[i];
          o = this.lineOpts[i];
          k.push("<Style id='l" + i + "'><LineStyle><color>" + o.colour + "</color><width>" + o.lineWidth + "</width></LineStyle></Style>");
          _results.push((function() {
            var _i, _len2, _results2;
            _results2 = [];
            for (_i = 0, _len2 = lineCoordSets.length; _i < _len2; _i++) {
              lineCoords = lineCoordSets[_i];
              coordStr = ((function() {
                var _j, _len3, _results3;
                _results3 = [];
                for (_j = 0, _len3 = lineCoords.length; _j < _len3; _j++) {
                  coords = lineCoords[_j];
                  _results3.push(coords.join(','));
                }
                return _results3;
              })()).join(' ');
              _results2.push(k.push("<Placemark>          <styleUrl>#l" + i + "</styleUrl>          <LineString><altitudeMode>absolute</altitudeMode><coordinates>" + coordStr + "</coordinates></LineString>        </Placemark>"));
            }
            return _results2;
          })());
        }
        return _results;
      }).call(this);
      k.push('</Document>');
      return k.join('');
    };

    SkyText.prototype.kmlDoc = function() {
      return "<?xml version='1.0' encoding='UTF-8'?><kml xmlns='http://www.opengis.net/kml/2.2'>" + (this.kmlFragment()) + "</kml>";
    };

    SkyText.prototype.font = {
      "na": [[0, 2, 1, 2, 1, 3, 0, 3, 0, 2]],
      "0": [[0, 1, 0, 3, 1, 4, 2, 3, 2, 1, 1, 0, 0, 1], [0, 3, 2, 1]],
      "1": [[0, 0, 0, 4]],
      "2": [[0, 1, 1, 0, 2, 1, 0, 4, 2, 4]],
      "3": [[0, 0, 2, 0, 0, 2, 2, 3, 0, 4]],
      "4": [[0, 0, 0, 3, 2, 3], [1, 1, 1, 4]],
      "5": [[2, 0, 0, 0, 0, 1, 2, 3, 0, 4]],
      "6": [[0, 0, 0, 3, 1, 4, 2, 3, 2, 2, 0, 1]],
      "7": [[0, 0, 2, 0, 0, 4]],
      "8": [[1, 0, 0, 1, 2, 3, 1, 4, 0, 3, 2, 1, 1, 0]],
      "9": [[2, 4, 2, 1, 1, 0, 0, 1, 0, 2, 2, 3]],
      "a": [[0, 1, 1, 1, 2, 2, 2, 4, 1, 4, 0, 3, 1, 2, 2, 2]],
      "b": [[0, 0, 0, 4, 1, 4, 2, 3, 2, 2, 1, 1, 0, 1]],
      "c": [[2, 1, 1, 1, 0, 2, 0, 3, 1, 4, 2, 4]],
      "d": [[2, 0, 2, 4, 1, 4, 0, 3, 0, 2, 1, 1, 2, 1]],
      "e": [[0, 3, 3, 2, 2, 1, 1, 1, 0, 2, 0, 3, 1, 4, 2, 4]],
      "f": [[0, 5, 0, 2, 1, 1, 2, 1], [0, 3, 2, 3]],
      "g": [[2, 3, 2, 1, 1, 1, 0, 2, 0, 3, 2, 3, 2, 4, 1, 5]],
      "h": [[0, 0, 0, 4], [2, 4, 2, 2, 1, 1, 0, 1]],
      "i": [[0, 1, 0, 4]],
      "j": [[1, 1, 1, 4, 0, 5]],
      "k": [[0, 0, 0, 4], [2, 1, 0, 2, 2, 4]],
      "l": [[0, 0, 0, 4]],
      "m": [[0, 4, 0, 1, 1, 3, 2, 1, 3, 4]],
      "n": [[0, 4, 0, 2, 1, 1, 2, 1, 2, 4]],
      "o": [[0, 2, 0, 3, 1, 4, 2, 3, 2, 2, 1, 1, 0, 2]],
      "p": [[0, 5, 0, 1, 1, 1, 2, 2, 2, 3, 1, 4, 0, 4]],
      "q": [[2, 5, 2, 1, 1, 1, 0, 2, 0, 3, 1, 4, 2, 4]],
      "r": [[0, 4, 0, 2, 1, 1, 2, 1]],
      "s": [[2, 1, 1, 1, 0, 2, 2, 3, 1, 4, 0, 4]],
      "t": [[0, 0, 0, 3, 1, 4, 2, 4], [0, 1, 2, 1]],
      "u": [[0, 1, 0, 3, 1, 4, 2, 4, 2, 1]],
      "v": [[0, 1, 1, 4, 2, 1]],
      "w": [[0, 1, 1, 4, 2, 2, 3, 4, 3, 1]],
      "x": [[0, 4, 2, 1], [0, 1, 2, 4]],
      "y": [[2, 1, 2, 4, 1, 5], [0, 1, 0, 3, 2, 3]],
      "z": [[0, 1, 2, 1, 0, 4, 2, 4]],
      "#": [[1, 0, 1, 4], [2, 0, 2, 4], [0, 1, 3, 1], [0, 3, 3, 3]],
      "@": [[2, 3, 2, 1, 1, 2, 2, 3, 3, 4, 3, 0, 1, 0, 0, 2, 1, 4]],
      "\"": [[0, 0, 0, 1], [1, 0, 1, 1]],
      "/": [[0, 4, 2, 0]],
      ".": [[0, 3, 0, 4]],
      "'": [[0, 0, 0, 1]],
      "[": [[1, 0, 0, 0, 0, 4, 1, 4]],
      "]": [[0, 0, 1, 0, 1, 4, 0, 4]],
      ":": [[0, 0, 0, 1], [0, 3, 0, 4]],
      ";": [[1, 0, 1, 1], [1, 3, 0, 5]],
      "?": [[0, 0, 2, 0, 2, 1, 1, 2], [1, 4, 1, 3]],
      "!": [[0, 0, 0, 2], [0, 3, 0, 4]],
      "-": [[0, 2, 2, 2]],
      "–": [[0, 2, 3, 2]],
      "—": [[0, 2, 4, 2]],
      "+": [[0, 2, 2, 2], [1, 1, 1, 3]],
      "*": [[0, 3, 2, 1], [0, 1, 2, 3], [1, 0, 1, 4]],
      "\\": [[0, 0, 2, 4]],
      "=": [[0, 1, 2, 1], [0, 3, 2, 3]],
      ">": [[0, 0, 2, 2, 0, 4]],
      "<": [[2, 0, 0, 2, 2, 4]],
      "^": [[0, 1, 1, 0, 2, 1]],
      "$": [[2, 1, 1, 1, 0, 2, 2, 3, 1, 4, 0, 4], [1, 0, 1, 5]],
      "¢": [[2, 1, 1, 1, 0, 2, 0, 3, 1, 4, 2, 4], [1, 0, 1, 5]],
      "%": [[0, 4, 3, 0], [0, 1, 1, 1, 1, 0, 0, 1], [2, 3, 2, 4, 3, 3, 2, 3]],
      "~": [[0, 2, 1, 1, 2, 3, 3, 2]],
      "`": [[0, 0, 1, 2]],
      "£": [[2, 0, 1, 0, 0, 4, 2, 4], [0, 2, 1, 2]],
      "&": [[3, 4, 0, 1, 1, 0, 2, 1, 0, 3, 1, 4, 3, 2]],
      "“": [[0, 0, 1, 1], [1, 0, 2, 1]],
      "‘": [[0, 0, 1, 1]],
      "”": [[2, 0, 1, 1], [1, 0, 0, 1]],
      "’": [[1, 0, 0, 1]],
      "€": [[0, 2, 2, 2], [2, 0, 1, 0, 1, 3, 2, 4], [0, 1, 2, 1]],
      "{": [[2, 0, 1, 0, 1, 1, 0, 2, 1, 3, 1, 4, 2, 4]],
      "}": [[0, 0, 1, 0, 1, 1, 2, 2, 1, 3, 1, 4, 0, 4]],
      "(": [[1, 0, 0, 1, 0, 3, 1, 4]],
      ")": [[0, 0, 1, 1, 1, 3, 0, 4]],
      "§": [[0, 4, 1, 4, 2, 3, 0, 2, 1, 1], [2, 0, 1, 0, 0, 1, 2, 2, 1, 3]],
      "A": [[0, 4, 1, 0, 2, 4], [0, 3, 2, 3]],
      "B": [[0, 4, 0, 0, 2, 1, 0, 2, 2, 3, 0, 4]],
      "C": [[2, 0, 1, 0, 0, 2, 1, 4, 2, 4]],
      "D": [[0, 4, 0, 0, 2, 1, 2, 3, 0, 4]],
      "E": [[2, 0, 0, 0, 0, 4, 2, 4], [0, 2, 1, 2]],
      "F": [[0, 4, 0, 0, 2, 0], [1, 2, 0, 2]],
      "G": [[2, 0, 1, 0, 0, 2, 1, 4, 2, 4, 2, 2, 1, 2]],
      "H": [[0, 0, 0, 4], [0, 2, 2, 2], [2, 0, 2, 4]],
      "I": [[0, 0, 0, 4]],
      "J": [[1, 0, 1, 3, 0, 5]],
      "K": [[0, 0, 0, 4, 0, 2], [2, 0, 0, 2, 2, 4]],
      "L": [[0, 0, 0, 4, 2, 4]],
      "M": [[0, 4, 0, 0, 1, 3, 2, 0, 3, 4]],
      "N": [[0, 4, 0, 0, 2, 4, 2, 0]],
      "O": [[1, 0, 0, 1, 0, 3, 1, 4, 2, 3, 2, 1, 1, 0]],
      "P": [[0, 4, 0, 0, 1, 0, 2, 1, 2, 2, 1, 3, 0, 3]],
      "Q": [[1, 0, 0, 1, 0, 3, 1, 4, 2, 3, 2, 1, 1, 0], [1, 3, 2, 4]],
      "R": [[0, 4, 0, 0, 1, 0, 2, 1, 1, 2, 0, 2, 2, 4]],
      "S": [[2, 0, 1, 0, 0, 1, 2, 3, 1, 4, 0, 4]],
      "T": [[0, 0, 2, 0], [1, 0, 1, 4]],
      "U": [[0, 0, 0, 3, 1, 4, 2, 4, 2, 0]],
      "V": [[0, 0, 1, 4, 2, 0]],
      "W": [[0, 0, 1, 4, 2, 1, 3, 4, 3, 0]],
      "X": [[0, 0, 2, 4], [0, 4, 2, 0]],
      "Y": [[0, 0, 1, 2], [2, 0, 0, 4]],
      "Z": [[0, 0, 2, 0, 0, 4, 2, 4]]
    };

    return SkyText;

  })();

}).call(this);
