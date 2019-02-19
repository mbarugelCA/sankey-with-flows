import * as d3 from 'd3'
import { Looker, VisualizationDefinition, Cell } from '../common/types';
import { handleErrors } from '../common/utils';
import './my-custom-viz.scss'
// Imports from custom Sankey
import '../d3-sankey-with-highlighting/css/global.css' 
import '../d3-sankey-with-highlighting/css/highlightjs.css'

import '../d3-sankey-with-highlighting/asset/showdown.min.js'
//import '../d3-sankey-with-highlighting/asset/highlight.pack.js'
import $ from "jquery";



import testdataTitanic from '../d3-sankey-with-highlighting/asset/titanic-data.json'

declare var looker: Looker;

interface WhateverNameYouWantVisualization extends VisualizationDefinition {
    elementRef?: HTMLDivElement,
    svg?: any,
    tooltip?: any,


}

const vis: WhateverNameYouWantVisualization = {
    id: 'some id', // id/label not required, but nice for testing and keeping manifests in sync
    label: 'Some Name',
    options: {
        title: {
            type: 'string',
            label: 'Title',
            display: 'text',
            default: 'Default Text'
        }
    },
    // Set up the initial state of the visualization
    create(element, config) {
        $.getScript('https://mingq.in/d3-sankey-with-highlighting/asset/highlight.pack.js')
        
        element.innerHTML = ''
        //this.elementRef = element;
        this.tooltip = d3.select(element).append('div').attr('class', 'chord-tip')
        this.svg = d3.select(element).append('svg')
        
        let node = document.createElement('div');
        node.innerHTML = 'hola'
        element.parentElement.append(node)
        
        //let aaa = SankeyDriver;
        console.log('loaded')
        console.log(testdataTitanic)
    },
    // Render in response to the data or settings changing
    update(data, element, config, queryResponse) {
        console.log( 'data', data );
        console.log( 'element', element );
        console.log( 'config', config );
        console.log( 'queryResponse', queryResponse );
        const errors = handleErrors(this, queryResponse, {
            // min_pivots: 0,
            // max_pivots: 0,
            // min_dimensions: 1,
            // max_dimensions: 1,
            // min_measures: 1,
            // max_measures: 1
        });
        if (errors) { // errors === true means no errors
            element.innerHTML = data[0]['referral.count']['value'] //'Hello Looker!!!!';
            element.setAttribute('class', 'the-text2');
            
            
            
            
        }
    }
};

looker.plugins.visualizations.add(vis);
