
//////////////////////////////////////////////////////////////////////////////
// Read data from json file, filter the information based on user selected sample id, then call all graphs creating functions
//////////////////////////////////////////////////////////////////////////////
function createGraphs(selected_id) {
    // Use d3.json to read samples.json data file 
    d3.json("data/samples.json").then(jsonData => { 
        const samples = jsonData.samples;
        const metadata = jsonData.metadata;
        
        // Get one sample information based on the selected id from the entire json data file
        const selectedSample = samples.filter(sampleName => sampleName.id == selected_id)[0];
        const selectedMetaData = metadata.filter(sampleName => sampleName.id == selected_id)[0];
        
        // Get a selected id's information
        const sample_values = selectedSample.sample_values;
        const otu_ids = selectedSample.otu_ids;
        const otu_labels = selectedSample.otu_labels;
        const wfreq = parseFloat(selectedMetaData.wfreq)
        
        // Display json data on console to ensure data had been captured appropriately
        console.log("CreateGraphs all Json Data: ", jsonData);
        console.log("CreateGraphs metadata: ", metadata);
        console.log("CreateGraphs filtered sample_values: ", sample_values);
        console.log("CreateGraphs filtered otu_labels: ", otu_labels);
        console.log("CreateGraphs filtered otu_ids: ", otu_ids);
        console.log("CreateGraphs filtered metadata wfred: ", wfreq );

        // Get top 10 OTU info, sorted by descending value
        top10Values = sample_values.slice(0,10).reverse();
        top10Ids = otu_ids.slice(0,10).reverse();
        top10Labels = otu_labels.slice(0,10).reverse();

        //////////////////////////////////////////////////////////////////////////////
        // Create a horizontal bar graph for the selected id sample
        //////////////////////////////////////////////////////////////////////////////
        function barGraph(selected_id) {
            // Plot graph for the top 10 OTU of the selected sample
            var yaxisLabels = top10Ids.map(otu_ID => `OTU ${otu_ID}`)
            var data = [
                {   
                    y: yaxisLabels,
                    x: top10Values,
                    text: top10Labels, 
                    type: 'bar',
                    orientation: 'h',
                },
            ];
            var layout = {
                title: {text: '<b>Top Ten Operational Taxonomic Units (OTUs)<b>', font: {color:"red"}},
                showlegend: false,
                xaxis: {
                    zeroline: true,
                },
                yaxis: {
                    zeroline: true,
                    gridwidth: 1
                },
                height: 370,
                width: 550,
                margin: { t:40 , l: 60, b: 50, r: 25 },
            };
            Plotly.newPlot('bar', data, layout);
        }
   
        //////////////////////////////////////////////////////////////////////////////
        // Create a bubble graph for the selected id sample
        //////////////////////////////////////////////////////////////////////////////
        function bubbleGraph(selected_id) {
            // Plot graph for all data of the selected sample
            var trace1 = {
                type:"scatter",
                x: otu_ids,
                y: sample_values,
                text: otu_labels,
                mode: 'markers',
                marker: {
                    color: otu_ids,
                    opacity: [0.1 ,0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                    size: sample_values
                }
            }
            var data = [trace1]
            var layout = {
                margin: {t:5 , l: 70, b: 100, r: 15},
                height: 500,
                width: 700,
                xaxis: {
                    title: {
                        text: "<b>OTU ID</b>",
                        font: {color:"red"}
                    },
                },

            }
            Plotly.newPlot('bubble', data, layout)
        }

        //////////////////////////////////////////////////////////////////////////////
        // Create gauge graph for the selected id sample
        //////////////////////////////////////////////////////////////////////////////
        function gaugeGraph(selected_id) {
            // Create gauge chart by using plotly pie chart
            let traceData = {
              type: 'pie',
              showlegend: false,
              hole: 0.4,
              rotation: 90,
              values: [180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180],
              text: ['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','8-9'],
              direction: 'clockwise',
              textinfo: 'text',
              textposition: 'inside',
              marker: {
                colors: ['#F8F3EC','#F4F1E5','#E9E6CA','#E2E4B1','#D5E49D','#B7CC92','#8CBF88','#8ABB8F','#85B48A','white'],
                labels: ['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','8-9',''],
                hoverinfo: "label"
              },
              hoverinfo: "skip"
            }
          
            // Create the center dot where the needle originates
            let centerDot = {
              type: 'scatter',
              x: [0],
              y: [0],
              marker: {
                size: 14,
                color:'#850000'
              },
              showlegend: false,
              hoverinfo: "skip"
            }
          
            // Set weight to the angle to adjust the needle movement position, 9 sectors, 20 degrees for each angle
            let weight = 20;
         
            // Set up angle of the needle for each sector on the gauge, maximum 180 degrees
            let angles = 180 - wfreq*weight; 

            // Make minor adjustments to the needle so it can land to the right position on the gauge sector
            if ((wfreq == 1) || (wfreq == 2) || (wfreq ==3)) { angles = angles + 3; } 
            else if (wfreq ==5) { angles = angles - 2; } 
            else if ((wfreq == 6) || (wfreq ==7) || (wfreq ==8)) { angles = angles - 4; };

            // Manage the needle's angle where wfreq is a null value
            if (!wfreq) {angles = -180};

            // Set up the needle for the gauge
            let radius = .5;
            let radians = angles * Math.PI / 180;
            let aX = 0.025 * Math.cos((radians) * Math.PI / 180);
            let aY = 0.025 * Math.sin((radians) * Math.PI / 180);
            let bX = -0.025 * Math.cos((radians) * Math.PI / 180);
            let bY = -0.025 * Math.sin((radians) * Math.PI / 180);
            let cX = radius * Math.cos(radians);
            let cY = radius * Math.sin(radians);
          
            // Draw the needle triangle
            let path = 'M ' + aX + ' ' + aY +
                      ' L ' + bX + ' ' + bY +
                      ' L ' + cX + ' ' + cY +
                      ' Z';
          
            // Set up the gauge layout
            let layout = {
              title: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week",
              font: { color: "red", family: "Arial", size: 12 },
              height: 480,
              width: 380,
              margin: { t: 30, r: 5, l: 15, b: 25 },
              shapes:[{
                  type: 'path',
                  path: path,
                  fillcolor: '#850000',
                  line: {
                    color: '#850000'
                  }
                }],
              xaxis: {zeroline:false, 
                      showticklabels:false,
                      showgrid: false, 
                      range: [-1, 1],
                      fixedrange: true
                    },
              yaxis: {zeroline:false, 
                      showticklabels:false,
                      showgrid: false, 
                      range: [-1, 1],
                      fixedrange: true
                    }
            };
          
            Plotly.newPlot("gauge", [traceData, centerDot], layout);
          }


        //////////////////////////////////////////////////////////////////////////////      
        // Create pie chart
        //////////////////////////////////////////////////////////////////////////////
        function pieChart(selected_id) {
            // Create pie chart for top 10 OTU
            var data = {
                values: top10Values,
                labels: top10Ids,
                type: 'pie'
            }

            var layout = {
                title: "<b>Percentage Split of Top 10 OTUs </b><br>(Label: OTU id, Count no. of Samples and %)",
                font: {"color" : "red"},
                height: 300,
                width: 400,
                margin: {"t": 100, "b": 0, "l": 25, "r": 0},
                showlegend: false
            }

            Plotly.newPlot('pieChart', [data], layout);
        }

        //////////////////////////////////////////////////////////////////////////////
        // Call all graphs functions to generate graphs for the selected sample id
        //////////////////////////////////////////////////////////////////////////////
        barGraph(selected_id)
        bubbleGraph(selected_id)
        gaugeGraph(selected_id)
        pieChart(selected_id)

    })

}


//////////////////////////////////////////////////////////////////////////////
// Push data from the metadata array (for a selected id) to the Demographic Info box in index.html
//////////////////////////////////////////////////////////////////////////////
function demographicInfo(selected_id) {
    const jsonData = d3.json("data/samples.json").then(jsonData=> {
        const metadata = jsonData.metadata;
        const demoInfoBox = d3.select('#sample-metadata')
        
        // Clear the previous data in the Demographic Info box before display new information
        demoInfoBox.html('');
        const filteredData = metadata.filter(sampleName => sampleName.id == selected_id)[0]
        console.log("Demographic data: ",filteredData)

        // Populate data on the Demographic Info box, with formatted text
        Object.entries(filteredData).forEach(([key, value]) => {
            demoInfoBox.append("h5").style("color","blue").text(`${key.toLowerCase()}: ${value}`);
        });

    });
}


//////////////////////////////////////////////////////////////////////////////
// Create optionChanged function that can be called from the index.html upon user makes changes to the drop downlist
//////////////////////////////////////////////////////////////////////////////
function optionChanged(new_sample_id) {
    demographicInfo(new_sample_id)
    createGraphs(new_sample_id)
}


//////////////////////////////////////////////////////////////////////////////
// Create default graphs (upon initial page's load) based on the default_id (i.e. first id/name on the dropdown list)
//////////////////////////////////////////////////////////////////////////////
function loadDefaultGraphs() {
    const JsonData = d3.json("data/samples.json").then(JsonData => {
        console.log('First read (with default_id) JsonData: ',JsonData)

        // Get the names (that contains sample ids) from json data file
        const sampleNames = JsonData.names;

        // Select the selector drop down box id in index.html
        const selector = d3.select('#selDataset')

        // Populate the index.html drop down list with the list of sample ids/names
        sampleNames.forEach(sample_id => {
            selector
                .append('option')
                .text(sample_id)
                .property('value', sample_id);
        });

        // Use the first sample from the list to build the initial plots, e.g. id = 940
        const default_id = sampleNames[0];

        // Calling function to populate data for the Demographic Info box based on the default id
        demographicInfo(default_id);

        // Calling function to create graphs based on the default id
        createGraphs(default_id)
    });
}


//////////////////////////////////////////////////////////////////////////////
// Manipulate the index.html page by update/append div class and div id
//////////////////////////////////////////////////////////////////////////////
function formatIndexPage() {
    // Change font color of the page heading
    d3.select("h1").style("color","#00008B");

    // Adjust the column width of the row displaying barChart and gauge graph
    d3.select(".col-md-5").classed("col-md-5",false).classed("col-md-6",true);
    d3.select(".col-md-5").classed("col-md-5",false).classed("col-md-4",true);

    // Adjust the column width of the row displaying bubbleChart and add new div to display pie chart
    d3.select(".col-md-12").classed("col-md-12", false).classed("temp",true);
    d3.selectAll(".col-md-12").each(function () {
        var t = document.createElement('div');
        t.classList.add("myDiv")
        this.parentNode.insertBefore(t, this.nextSibling);       
    });
    d3.select(".myDiv").append("div").attr("id", "pieChart");
    d3.select(".myDiv").classed("myDiv", false).classed("col-md-3",true);
    d3.select(".col-md-12").classed("col-md-12", false).classed("col-md-8",true);
    d3.select(".temp").classed("temp", false).classed("col-md-12",true);
}


//////////////////////////////////////////////////////////////////////////////
// Initialise and load the page of web visualisation dashboard
//////////////////////////////////////////////////////////////////////////////
formatIndexPage();
loadDefaultGraphs();
//////////////////////////////////////////////////////////////////////////////

