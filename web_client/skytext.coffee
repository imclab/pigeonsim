
class this.SkyText
  piOver180:  Math.PI / 180
  latFactor:  0.00001
  fontHeight: 5

  constructor: (@lat, @lon, @alt, o = {}) ->
    o.lineWidth ?= 1
    o.colour    ?= 'ffffffff'
    @allCoordSets = []
    @lineOpts = []
    if o.lineWidth > 0
      @allCoordSets.push([[[@lon, @lat, 0], [@lon, @lat, @alt]]])
      @lineOpts.push(o)
    lonRatio = 1 / Math.cos(@lat * @piOver180)
    @lonFactor = @latFactor * lonRatio
    
  text: (text, o) -> @line(line, o) for line in text.split("\n")
    
  line: (text, o = {}) ->
    o.bearing    ?= 0  # text will be readable straight on when viewed facing this way
    o.size       ?= 2
    o.lineWidth  ?= 2
    o.colour     ?= 'ffffffff'
    o.lineSpace  ?= 1  # vertical space between lines 
    o.charSpace  ?= 1  # horizontal space between chars
    o.spaceWidth ?= 2
    o.tabSpaces  ?= 4  # tabs are this many spaces wide
    o.offset     ?= 5  # horizontal space at start of line (independent of o.size)
    o.font       ?= @font

    bRad = o.bearing * @piOver180
    sinB = Math.sin(bRad)
    cosB = Math.cos(bRad)
    latFactor = sinB * o.size * @latFactor
    lonFactor = cosB * o.size * @lonFactor
    latStart = @lat + sinB * o.offset * @latFactor
    lonStart = @lon + cosB * o.offset * @lonFactor
    
    xCursor = 0
    tabWidth = o.tabSpaces * o.spaceWidth
    lineCoordSets = []
    
    for char in text.split('')
      if char in [" ", "\n", "\r"]
        xCursor += o.spaceWidth
        continue
      if char is "\t"
        xCursor = Math.ceil((xCursor + 1) / tabWidth) * tabWidth
        continue
      paths = o.font[char] ? o.font['na']
      maxX = 0
      for path in paths
        coords = for x, i in path by 2
          y = path[i + 1]
          maxX = x if x > maxX
          absX = xCursor + x
          lat = latStart + absX * latFactor
          lon = lonStart + absX * lonFactor
          alt = @alt - (y * o.size)
          [lon, lat, alt]
        lineCoordSets.push(coords)
      xCursor += maxX + o.charSpace
        
    @alt -= (o.size * @fontHeight) + o.lineSpace
    
    @lineOpts.push(o)
    @allCoordSets.push(lineCoordSets)
    @
       
  kml: ->
    k = []
    k.push "<?xml version='1.0' encoding='UTF-8'?><kml xmlns='http://www.opengis.net/kml/2.2'><Document>"
    coordStrs = for lineCoordSets, i in @allCoordSets
      o = @lineOpts[i]
      k.push "<Style id='l#{i}'><LineStyle><color>#{o.colour}</color><width>#{o.lineWidth}</width></LineStyle></Style>"
      for lineCoords in lineCoordSets
        coordStr = ((coords.join(',') for coords in lineCoords).join(' '))
        k.push "<Placemark>
          <styleUrl>#l#{i}</styleUrl>
          <LineString><altitudeMode>absolute</altitudeMode><coordinates>#{coordStr}</coordinates></LineString>
        </Placemark>"
    k.push "</Document></kml>"
    k.join('')
    
  font: 
    "na": [[0,2,1,2,1,3,0,3,0,2]]  # small square for missing chars
    "0":  [[0,1,0,3,1,4,2,3,2,1,1,0,0,1],[0,3,2,1]]
    "1":  [[0,0,0,4]]
    "2":  [[0,1,1,0,2,1,0,4,2,4]]
    "3":  [[0,0,2,0,0,2,2,3,0,4]]
    "4":  [[0,0,0,3,2,3],[1,1,1,4]]
    "5":  [[2,0,0,0,0,1,2,3,0,4]]
    "6":  [[0,0,0,3,1,4,2,3,2,2,0,1]]
    "7":  [[0,0,2,0,0,4]]
    "8":  [[1,0,0,1,2,3,1,4,0,3,2,1,1,0]]
    "9":  [[2,4,2,1,1,0,0,1,0,2,2,3]]
    "a":  [[0,1,1,1,2,2,2,4,1,4,0,3,1,2,2,2]]
    "b":  [[0,0,0,4,1,4,2,3,2,2,1,1,0,1]]
    "c":  [[2,1,1,1,0,2,0,3,1,4,2,4]]
    "d":  [[2,0,2,4,1,4,0,3,0,2,1,1,2,1]]
    "e":  [[0,3,3,2,2,1,1,1,0,2,0,3,1,4,2,4]]
    "f":  [[0,5,0,2,1,1,2,1],[0,3,2,3]]
    "g":  [[2,3,2,1,1,1,0,2,0,3,2,3,2,4,1,5]]
    "h":  [[0,0,0,4],[2,4,2,2,1,1,0,1]]
    "i":  [[0,1,0,4]]
    "j":  [[1,1,1,4,0,5]]
    "k":  [[0,0,0,4],[2,1,0,2,2,4]]
    "l":  [[0,0,0,4]]
    "m":  [[0,4,0,1,1,3,2,1,3,4]]
    "n":  [[0,4,0,2,1,1,2,1,2,4]]
    "o":  [[0,2,0,3,1,4,2,3,2,2,1,1,0,2]]
    "p":  [[0,5,0,1,1,1,2,2,2,3,1,4,0,4]]
    "q":  [[2,5,2,1,1,1,0,2,0,3,1,4,2,4]]
    "r":  [[0,4,0,2,1,1,2,1]]
    "s":  [[2,1,1,1,0,2,2,3,1,4,0,4]]
    "t":  [[0,0,0,3,1,4,2,4],[0,1,2,1]]
    "u":  [[0,1,0,3,1,4,2,4,2,1]]
    "v":  [[0,1,1,4,2,1]]
    "w":  [[0,1,1,4,2,2,3,4,3,1]]
    "x":  [[0,4,2,1],[0,1,2,4]]
    "y":  [[2,1,2,4,1,5],[0,1,0,3,2,3]]
    "z":  [[0,1,2,1,0,4,2,4]]
    "#":  [[1,0,1,4],[2,0,2,4],[0,1,3,1],[0,3,3,3]]
    "@":  [[2,3,2,1,1,2,2,3,3,4,3,0,1,0,0,2,1,4]]
    "\"":  [[0,0,0,1],[1,0,1,1]]
    "/":  [[0,4,2,0]]
    ".":  [[0,3,0,4]]
    "'":  [[0,0,0,1]]
    "[":  [[1,0,0,0,0,4,1,4]]
    "]":  [[0,0,1,0,1,4,0,4]]
    ":":  [[0,0,0,1],[0,3,0,4]]
    ";":  [[1,0,1,1],[1,3,0,5]]
    "?":  [[0,0,2,0,2,1,1,2],[1,4,1,3]]
    "!":  [[0,0,0,2],[0,3,0,4]]
    "-":  [[0,2,2,2]]
    "–":  [[0,2,3,2]]
    "—":  [[0,2,4,2]]
    "+":  [[0,2,2,2],[1,1,1,3]]
    "*":  [[0,3,2,1],[0,1,2,3],[1,0,1,4]]
    "\\": [[0,0,2,4]]
    "=":  [[0,1,2,1],[0,3,2,3]]
    ">":  [[0,0,2,2,0,4]]
    "<":  [[2,0,0,2,2,4]]
    "^":  [[0,1,1,0,2,1]]
    "$":  [[2,1,1,1,0,2,2,3,1,4,0,4],[1,0,1,5]]
    "¢":  [[2,1,1,1,0,2,0,3,1,4,2,4],[1,0,1,5]]
    "%":  [[0,4,3,0],[0,1,1,1,1,0,0,1],[2,3,2,4,3,3,2,3]]
    "~":  [[0,2,1,1,2,3,3,2]]
    "`":  [[0,0,1,2]]
    "£":  [[2,0,1,0,0,4,2,4],[0,2,1,2]]
    "&":  [[3,4,0,1,1,0,2,1,0,3,1,4,3,2]]
    "“":  [[0,0,1,1],[1,0,2,1]]
    "‘":  [[0,0,1,1]]
    "”":  [[2,0,1,1],[1,0,0,1]]
    "’":  [[1,0,0,1]]
    "€":  [[0,2,2,2],[2,0,1,0,1,3,2,4],[0,1,2,1]]
    "{":  [[2,0,1,0,1,1,0,2,1,3,1,4,2,4]]
    "}":  [[0,0,1,0,1,1,2,2,1,3,1,4,0,4]]
    "(":  [[1,0,0,1,0,3,1,4]]
    ")":  [[0,0,1,1,1,3,0,4]]
    "§":  [[0,4,1,4,2,3,0,2,1,1],[2,0,1,0,0,1,2,2,1,3]]
    "A":  [[0,4,1,0,2,4],[0,3,2,3]]
    "B":  [[0,4,0,0,2,1,0,2,2,3,0,4]]
    "C":  [[2,0,1,0,0,2,1,4,2,4]]
    "D":  [[0,4,0,0,2,1,2,3,0,4]]
    "E":  [[2,0,0,0,0,4,2,4],[0,2,1,2]]
    "F":  [[0,4,0,0,2,0],[1,2,0,2]]
    "G":  [[2,0,1,0,0,2,1,4,2,4,2,2,1,2]]
    "H":  [[0,0,0,4],[0,2,2,2],[2,0,2,4]]
    "I":  [[0,0,0,4]]
    "J":  [[1,0,1,3,0,5]]
    "K":  [[0,0,0,4,0,2],[2,0,0,2,2,4]]
    "L":  [[0,0,0,4,2,4]]
    "M":  [[0,4,0,0,1,3,2,0,3,4]]
    "N":  [[0,4,0,0,2,4,2,0]]
    "O":  [[1,0,0,1,0,3,1,4,2,3,2,1,1,0]]
    "P":  [[0,4,0,0,1,0,2,1,2,2,1,3,0,3]]
    "Q":  [[1,0,0,1,0,3,1,4,2,3,2,1,1,0],[1,3,2,4]]
    "R":  [[0,4,0,0,1,0,2,1,1,2,0,2,2,4]]
    "S":  [[2,0,1,0,0,1,2,3,1,4,0,4]]
    "T":  [[0,0,2,0],[1,0,1,4]]
    "U":  [[0,0,0,3,1,4,2,4,2,0]]
    "V":  [[0,0,1,4,2,0]]
    "W":  [[0,0,1,4,2,1,3,4,3,0]]
    "X":  [[0,0,2,4],[0,4,2,0]]
    "Y":  [[0,0,1,2],[2,0,0,4]]
    "Z":  [[0,0,2,0,0,4,2,4]]
    "ø":  [[1,1,2,0,4,0,5,1,5,3,4,4,2,4,1,3,1,1],[0,2,6,2]]  # LU roundel
    "₦":  [[0,2,5,2],[0,3,5,3],[2,1,3,2,2,3,3,4]]            # Network Rail logo