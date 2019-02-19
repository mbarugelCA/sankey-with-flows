var titanicData = JSON.parse('{"Data source":"[Robert J. MacG. Dawson](http://www.amstat.org/publications/jse/v3n3/datasets.dawson.html)","nodes":[{"disp":"Third Class","name":"third class"},{"disp":"Survived","name":"survived"},{"disp":"Second Class","name":"second class"},{"disp":"Crew","name":"crew"},{"disp":"Perished","name":"perished"},{"disp":"Adult","name":"adult"},{"disp":"Female","name":"female"},{"disp":"Child","name":"child"},{"disp":"Male","name":"male"},{"disp":"First Class","name":"first class"}],"flows":[{"thru":["perished","male","adult","first class"],"value":118},{"thru":["perished","female","adult","third class"],"value":89},{"thru":["survived","male","child","second class"],"value":11},{"thru":["survived","female","child","third class"],"value":14},{"thru":["perished","female","child","third class"],"value":17},{"thru":["survived","female","child","first class"],"value":1},{"thru":["perished","female","adult","second class"],"value":13},{"thru":["survived","female","adult","first class"],"value":140},{"thru":["survived","male","adult","crew"],"value":192},{"thru":["perished","male","adult","crew"],"value":670},{"thru":["survived","female","child","second class"],"value":13},{"thru":["perished","female","adult","crew"],"value":3},{"thru":["perished","male","adult","third class"],"value":387},{"thru":["survived","female","adult","crew"],"value":20},{"thru":["perished","female","adult","first class"],"value":4},{"thru":["survived","female","adult","third class"],"value":76},{"thru":["perished","male","child","third class"],"value":35},{"thru":["survived","male","child","first class"],"value":5},{"thru":["perished","male","adult","second class"],"value":154},{"thru":["survived","male","child","third class"],"value":13},{"thru":["survived","male","adult","first class"],"value":57},{"thru":["survived","female","adult","second class"],"value":80},{"thru":["survived","male","adult","third class"],"value":75},{"thru":["survived","male","adult","second class"],"value":14}]}');
var theData, theQuery, theConfig

var lookerVisualizationOptions = {
  skip_intermediate_nulls: {
    section: "Main",
    type: "boolean",
    label: "Skip intermediate nulls",
    order: 1,
    default: false,
  },
  // color_range: {
  //   order: 4,
  //   section: "Colors",
  //   type: "array",
  //   label: "Color Range",
  //   display: "colors",
  //   display_size: "third",
  // },
  // top_label: {
  //   order: 3,
  //   section: "Colors",
  //   type: "string",
  //   label: "Label (for top)",
  //   placeholder: "My Great Chart",
  //   display_size: "third",
  // },
  // test_1: {
  //   order: 2,
  //   section: "Colors",
  //   type: "number",
  //   display: "range",
  //   label: "Slide!!",
  //   display_size: "third",
  //   min: 0,
  //   max: 10,
  //   step: 2,
  // },
  // boolean_option: {
  //   section: "Colors",
  //   type: "boolean",
  //   label: "Boolean option",
  //   order: 1
  // },
  // transport_mode: {
  //   section: "Modes",
  //   type: "string",
  //   label: "Mode of Transport",
  //   display: "select",
  //   values: [
  //      {"Airplane": "airplane"},
  //      {"Car": "car"},
  //      {"Unicycle": "unicycle"}
  //   ],
  //   default: "unicycle"
  // }
}

looker.plugins.visualizations.add({
  // Id and Label are legacy properties that no longer have any function besides documenting
  // what the visualization used to have. The properties are now set via the manifest
  // form within the admin/visualizations page of Looker
  id: "hello_world",
  label: "Hello World",
  options: lookerVisualizationOptions,
  // Set up the initial state of the visualization
  create: function(element, config) {
    
    $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'https://cdn.jsdelivr.net/gh/mbarugelCA/sankey-with-flows@1.2/dependencies/global.css') );

    // Insert a <style> tag with some styles we'll use later.
    element.innerHTML = `
      <style>
        .hello-world-vis {
          /* Vertical centering */
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }
      </style>
    `;

    // Create a container element to let us center the text.
    var container = element.appendChild(document.createElement("div"));
    container.className = "hello-world-vis";

    // Create an element to contain the text.
    this._textElement = container.appendChild(document.createElement("div"));

  },
  // Render in response to the data or settings changing
  updateAsync: function(data, element, config, queryResponse, details, done) {

    theData = data
    theQuery = queryResponse
    self = this
    this._textElement.id = "canvas";
    
    // Check for errors
    var requirementsMet = HandleErrors(this, queryResponse, {
      min_measures: 1, 
      max_measures: 1, 
      min_pivots: 0, 
      max_pivots: 0, 
      min_dimensions:1, 
      max_dimensions: 99,
    })
    if (!requirementsMet) return


    // EXAMPLE: Register additional options
    // newOptions = lookerVisualizationOptions
    // queryResponse.fields.dimension_like.forEach(function(field) {
    //   id = "color_" + field.name
    //   newOptions[id] =
    //     {
    //       label: field.label_short + " Color",
    //       default: "#bbaabb", // use selected palette for defaults
    //       section: "Style",
    //       type: "string",
    //       display: "color"
    //     }
    // })
    //this.trigger('registerOptions', newOptions) // register options with parent page to update visConfig
    // END Example

    // BEGIN Prepare data for chart
    // BEGIN Prepare nodes
    dimNames = _(theQuery.fields.dimensions).map('name').value()
    nodeNames = []
    _.each(dimNames, function(dimName) {
      thidDimUnique = _(theData)
                        .map(dimName)
                        .map('value')
                        .map((x) => {return dimName + '____' + (x === '' ? '(blank)' : x) + ''})
                        .uniq()
                        .value()
      nodeNames = _.concat(nodeNames, thidDimUnique)
    })
    
    theNodes = _.map(nodeNames, function(name) {
      var dispName = _.split(name, '____')[1]
      var obj = {
        disp: dispName,
        name: name
      }
      return obj
    })
    // END Prepare nodes
    
    //BEGIN Prepare flows
    theFlows = _.map(theData, function(datum) {
      var measureName = theQuery.fields.measures[0].name
      var value = datum[measureName].value
      var thru = []
      _.each(dimNames, function(dimName, key) {
        // If we set the option to skip the non-final nodes with 'null' values, don't add them to the 'thru' element
        if (config.skip_intermediate_nulls === true && 
            datum[dimName].value === null &&
            key < dimNames.length - 1) {
              return
        }
        var x = (datum[dimName].value === '' ? '(blank)' : datum[dimName].value) + ''
        thru = _.concat(thru, dimName + '____' + x)
      })
      //console.log(value)
      var obj = {
        thru: thru,
        value: value
      }
      return obj
    })
    //END Prepare flows

    jsonData = {}
    jsonData.nodes = theNodes
    jsonData.flows = theFlows
    // END Prepare data for chart
    
    driver = new SankeyDriver();
    console.log('drawing')
    margin = {
      top: 0, bottom: 10, left: 0, right: 10,
    };
    //var size = {
    //  width: 960, height: 400,
    //}
    size = {
      width: $('#canvas').width(), height: $(window).height(),
    }
    driver.prepare(d3.select("#canvas"), size, margin);
    driver.draw(jsonData);
    
    // Grab the first cell of the data
    // var firstRow = data[0];
    // var firstCell = firstRow[queryResponse.fields.dimensions[0].name];
    
    // Insert the data into the page
    // this._textElement.innerHTML = LookerCharts.Utils.htmlForCell(firstCell);

    // Set the size to the user-selected size
    /*
    if (config.font_size == "small") {
      this._textElement.className = "hello-world-text-small";
    } else {
      this._textElement.className = "hello-world-text-large";
    }
    */

    // We are done rendering! Let Looker know.
    done()
  }
});



function HandleErrors(vis, res, options) {
  var fields = res.fields
  var pivots = fields.pivots
  var dimensions = fields.dimensions
  var measures = fields.measure_like
  
  return (checkErrors(vis, 'pivot-req', 'Pivot', pivots.length, options.min_pivots, options.max_pivots)
      && checkErrors(vis, 'dim-req', 'Dimension', dimensions.length, options.min_dimensions, options.max_dimensions)
      && checkErrors(vis, 'mes-req', 'Measure', measures.length, options.min_measures, options.max_measures))
}

function checkErrors(vis, group, noun, count, min, max) {
  if (!vis.addError || !vis.clearErrors) return false
  if (count < min) {
      vis.addError({
          title: `Not Enough ${noun}s`,
          message: `This visualization requires ${min === max ? 'exactly' : 'at least'} ${min} ${noun.toLowerCase()}${ min === 1 ? '' : 's' }.`,
          group
      })
      return false
  }
  if (count > max) {
      vis.addError({
          title: `Too Many ${noun}s`,
          message: `This visualization requires ${min === max ? 'exactly' : 'no more than'} ${max} ${noun.toLowerCase()}${ min === 1 ? '' : 's' }.`,
          group
      })
      return false
  }
  vis.clearErrors(group)
  return true
}

