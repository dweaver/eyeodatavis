EYEO.Visualization = function( resources, scene, camera, controls, picker, renderer, gui ){

  //  rotate scene so z is up
  //  when adding new meshes, add to container
  var container = new THREE.Object3D();
  scene.add( container );
  container.rotation.x = Math.PI / 2 * 3;

  this.setup = function(){

    //  get the svg data
    var svgResource = resources.get('minnesota_counties');
    var svg = svgResource.children[0];

    //  turn it into shapes
    var shape = EYEO.Util.svgToShape( svg );

    //  turn shapes into meshes
    var meshes = EYEO.Util.parseChildren( shape );
    container.add( meshes );

    //  center the view
    controls.center.set( 310, 0, 70 );


    var data = EYEO.Parse( 'Census2010RaceCounty', resources );
    console.log(data);

    var fishData = EYEO.Parse( 'FishData', resources );
    console.log('fishData');
    console.log(fishData);
  
    var counties = data.counties;
    
    var optsFish = {
      fishType: 'rock bass',
      scale: 20,
      proportionalToCounty: true,
    }

    function updateFish() {
      console.log('updating');
      visualizeFish(optsFish.fishType, fishData.counties, fishData.totalsByFishType, meshes, optsFish.scale);
    }
    // TODO: load from CSV
    fishSelections = ["spotted sucker", "bowfin (dogfish)", "sauger", "deepwater sculpin", "sand shiner", "black bullhead", "lake whitefish", "threespine stickleback", "ninespine stickleback", "channel catfish", "silver redhorse", "sunfish", "least darter", "smallmouth bass", "river shiner", "crappie", "river redhorse", "brown bullhead", "logperch", "bluegill", "blacknose dace", "alewife", "central stoneroller", "gizzard shad", "freshwater drum", "darters", "shorthead redhorse", "yellow bullhead", "pugnose shiner", "trout-perch", "shiners", "green sunfish", "creek chub", "crappie hybrid", "hornyhead chub", "northern sunfish", "carpsucker", "channel shiner", "round whitefish", "shortnose gar", "bullhead minnow", "bluntnose minnow", "walleye", "sea lamprey", "longnose sucker", "largemouth bass", "mooneye", "weed shiner", "brook silverside", "highfin carpsucker", "black buffalo", "bigmouth shiner", "rock bass", "finescale dace", "rosyface shiner", "minnow hybrid", "longnose gar", "rainbow darter", "golden redhorse", "river carpsucker", "spotfin shiner", "goldfish", "suckers", "brook trout", "lake trout", "lake sturgeon", "river ruffe", "northern pearl dace", "lamprey", "quillback", "orangespotted sunfish", "spoonhead sculpin", "white perch", "shovelnose sturgeon", "iowa darter", "tadpole madtom", "pygmy whitefish", "longnose dace", "sculpin", "tullibee (cisco)", "slimy sculpin", "white crappie", "chestnut lamprey", "common carp", "greater redhorse", "brown trout", "northern redbelly dace", "pumpkinseed", "freshwater tubenose goby", "northern pike", "minnows", "common shiner", "goldeye", "river darter", "carmine shiner", "flathead catfish", "smallmouth buffalo", "banded killifish", "emerald shiner", "blacknose shiner", "white sucker", "muskellunge", "splake", "bloater", "rainbow trout", "hybrid sunfish", "mottled sculpin", "round goby", "yellow perch", "silver lamprey", "blackside darter", "walleye/sauger", "northern hog sucker", "bullheads", "warmouth", "northern pike-silverphase", "golden shiner", "central mudminnow", "black crappie", "bigmouth buffalo", "burbot", "mirror carp", "lake chub", "brassy minnow", "johnny darter", "stonecat", "rainbow smelt", "shortjaw cisco", "blackchin shiner", "brook stickleback", "white bass", "tiger muskellunge", "cisco species", "slenderhead darter", "redhorse", "mimic shiner", "american eel", "fathead minnow", "buffalo", "spottail shiner"]

    gui.add( optsFish, 'fishType', fishSelections).onFinishChange( function(fishType) {
      visualizeFish(optsFish.fishType, fishData.counties, fishData.totalsByFishType, meshes, optsFish.scale);
    });
    updateFish();

    /*
    var opts = {
      ethnicity: 'Asian',
      scale: 50,
      proportionalToCounty: true,
    }

    function updateEthnicity(){
      console.log('updating');
      visualizeEthnicity( opts.ethnicity, counties, meshes, opts.scale, opts.proportionalToCounty );
    }

    var raceKey = [
      'One race total',
      'White',
      'Black or African American',
      'American Indian and Alaska Native',
      'Asian',
      'Native Hawaiian and Other Pacific Islander',
      'Some Other Race',
      'Two or More Races',
      'Hispanic or Latino (of any race)'
    ];

    gui.add( opts, 'ethnicity', raceKey ).onFinishChange( updateEthnicity );
    gui.add( opts, 'scale', 10, 1000 ).onFinishChange( updateEthnicity );
    updateEthnicity();
    */

    // EYEO.Util.addLabels( meshes, camera, renderer, counties, opts.ethnicity );
  }

  function visualizeFish( fishType, counties, totalsByFishType, meshes, height, local ){
    var counties = counties;
    var statePopulation = counties.statePopulation;

    meshes.traverse( function( mesh ){
      if( (mesh instanceof THREE.Mesh) === false){
        return;
      }
      //  look it up
      var county = counties[ mesh.id ];
      // console.log(county);
      console.log(county);
      if ( county ) {
        var fishPop = county[fishType];
        var totalPop = totalsByFishType[fishType]; //county[ 'total' ];
        //console.log(fishPop, totalPop);
        //var scale = fishPop / 10000;// / totalPop * height;
        var scale = fishPop * 1.0 / totalPop * height;
        scale = Math.pow( scale, 2 );

        if( scale === 0 ){
          scale = 0.000001;
        }
        console.log(fishPop, totalPop, scale);

        mesh.scale.z = scale;
      }
      else{
        mesh.scale.z = 0.000001;
      }
    });
  }

  /*
    This function takes an ethnicity name, the counties data, and extracts population from the data
    This value is then applied to the mesh scale z property

    ethnicityName - Any valid property found in the census2010 records, eg 'Asian', 'American Indian and Alaska Native', etc
    counties - The extracted county data
    meshes - The county meshes that belong to THREE.js
    height - How much to scale the height of the visualization
    local - True: Visualizes the race distribution of each county compared to the county itself
            False: Visualizes the race distribution of each county compared to the entire state
  */
  function visualizeEthnicity( ethnicityName, counties, meshes, height, local ){
    var counties = counties;
    var statePopulation = counties.statePopulation;

    meshes.traverse( function( mesh ){
      if( (mesh instanceof THREE.Mesh) === false){
        return;
      }

      //  look it up
      var county = counties[ mesh.id ];
      if( county ){
        var asianPop = county[ ethnicityName ];
        var totalPop = local ? county[ 'population' ] : statePopulation;

        var scale = asianPop / totalPop * height;
        scale = Math.pow( scale, 2 );

        if( scale === 0 ){
          scale = 0.000001;
        }

        mesh.scale.z = scale;
      }
      else{
        mesh.scale.z = 0.000001;
      }
    });
  }

  //  use this function to animate
  this.update = function(){

  }

  //  example of picking a mesh
  this.onClick = function( e ){
    var s = picker.pick( e.clientX, e.clientY, container );
    if( s ){
      console.log( s.id );
    }
  }

  var mouseX = 0;
  var mouseY = 0;

  this.onMouseMove = function( e ){
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

}
