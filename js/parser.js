EYEO.Parsers = {

  //  a csv
  Census2010RaceCounty: function( file ){
    var str = EYEO.Util.CSVToArray( file );

    //  key is on line 5
    //  remember to subtract 1 because indices start at 0
    var keyLine = 4;
    var dataStart = 8;
    var dataEnd = 93;

    var keys = str[keyLine];

    var counties = {};

    //  we'll be construction keyvalue pairs like this:
    //  {
    //    County FIPS Code: 001
    //    County: Aitkin County
    //    etc
    //  }

    var statePopulation = 0;
    for( var i=dataStart; i<dataEnd; i++ ){
      var county = {};
      var population = 0;

      var values = str[i];

      var keyIdx = 0;
      for( var s in keys ){
        var keyName = keys[s];
        if( keyName !== '' ){
          var value = values[ keyIdx ];

          //  do some cleanup
          value = value.replace(/,/g,'');

          if( isNaN( parseFloat( value ) ) === false ){
            value = parseFloat( value );
            population += value;
            statePopulation += value;
          }

          county[ keyName ] = value;
        }
        keyIdx ++;
      }

      //  the county names come in 'Carlton County' but our map name is just 'Carlton'
      //  here we remove ' County' to match the map names
      var countyName = county.County.split(' County')[0];

      county.population = population;

      counties[ countyName ] = county;
    }

    counties.statePopulation = statePopulation;

    return {
      keys: keys,
      counties: counties
    };
  },
  FishData: function( file ){
    var str = EYEO.Util.CSVToArray( file );

    //  key is on line 5
    //  remember to subtract 1 because indices start at 0
    var keyLine = 0;
    var dataStart = 1;
    var dataEnd = 80;

    var keys = str[keyLine];

    var counties = {};

    //  we'll be construction keyvalue pairs like this:
    //  {
    //    County FIPS Code: 001
    //    County: Aitkin County
    //    etc
    //  }

    var totalsByFishType = {};
    for( var i=dataStart; i<dataEnd; i++ ){
      var county = {};
      var values = str[i];

      var keyIdx = 0;
      var total = 0;
      for( var s in keys ){
        var keyName = keys[s];
        if( keyName !== '' ){
          var value = values[ keyIdx ];

          //  do some cleanup
          value = value.replace(/,/g,'');

          //console.log(value);
          // var pop = parseInt(value);
          //console.log(value);
          //console.log(value);
          
          /*
          console.log('keyName: ', keyName, ', value: ', value);
          county[ keyName ] = value;
          */

          if (keyName === 'fips' || keyName === 'County') {
            county[ keyName ] = value;
          } else {
            var num = parseInt(value);
            //console.log('num: ', num);
            county[ keyName ] = num;
            if (!totalsByFishType.hasOwnProperty(keyName)) {
              totalsByFishType[ keyName ] = 0;
            }
            totalsByFishType[ keyName ] += num;
            total += num;
          }
          //console.log("value: ", value);
        }
        keyIdx ++;
      }

      county.total = total;

      //  the county names come in 'Carlton County' but our map name is just 'Carlton'
      //  here we remove ' County' to match the map names
      var countyName = county.County;

      counties[ countyName ] = county;
    }

    console.log(totalsByFishType);
    return {
      keys: keys,
      counties: counties,
      totalsByFishType: totalsByFishType
    };
  }
}

EYEO.Parse = function( resourceName, resources ){
  var resource = resources.get( resourceName );
  if( resource === undefined ){
    console.warn('no resource', resourceName );
    return;
  }

  var parser = EYEO.Parsers[ resourceName ];
  if( parser === undefined ){
    console.warn('no parser for', resourceName);
    return;
  }

  return parser( resource );
}
