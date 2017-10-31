import React, { Component } from 'react';
import {Image, Text, View} from  'react-native';
import {Marker} from 'react-native-maps';
import { width as w , height as h } from 'react-native-dimension';

const height = h(100);
const width = w(100);

export default class CustomMarker extends Component {

    constructor(props){
        super(props);
        this.state = {
            isLoaded:false,
            coordinates: null,
            props: {},
            point_count: 0,
            clusterId: null
        };
    }

    shouldComponentUpdate(nextProps, nextState){
        if(this.state.geometry === nextProps.geometry
            && this.state.point_count === nextProps.properties.point_count){
            return(false);
        }else{
            return(true);
        }
    }

    render(){
        this.state.point_count = this.props.properties.point_count;
        if(this.state.point_count === 0){
            this.state.props = this.props.item.props;
        }else{
            this.state.clusterId = this.props.properties.cluster_id;
            this.state.props = {};
        }

        let coordinates = {longitude: this.props.geometry.coordinates[0],
            latitude: this.props.geometry.coordinates[1]};
        this.state.coordinates = coordinates;

        let textForCluster = '';
        let markerWidth, markerHeight, textSize;
        let point_count = this.state.point_count;

        if(point_count>=2 && point_count<=10){
            textForCluster = point_count.toString();
            markerWidth = width*2/15;
            markerHeight = width*2/15;
            textSize = height/40;
        }if(point_count>10&&point_count<=25){
            textForCluster = '10+';
            markerWidth = width/7;
            markerHeight = width/7;
            textSize = height/40;
        }if(point_count>25&&point_count<=50){
            textForCluster = '25+';
            markerWidth = width*2/13;
            markerHeight = width*2/13;
            textSize = height/40;
        }if(point_count>50&&point_count<=100){
            textForCluster = '50+';
            markerWidth = width/6;
            markerHeight = width/6;
            textSize = height/38;
        }if(point_count>100){
            textForCluster = '100+';
            markerWidth = width*2/11;
            markerHeight = width*2/11;
            textSize = height/38;
        }

        let htmlElement;
        let isCluster;
        if(textForCluster !== ''){
            isCluster = 1;
            if(this.props.customClusterMarkerDesign && typeof this.props.customClusterMarkerDesign === "object"){
                htmlElement = <View style = {{width: markerWidth, height: markerHeight, justifyContent: 'center', alignItems: 'center'}}>
                    {this.props.customClusterMarkerDesign}
                    <Text style = {{width: markerWidth, textAlign: 'center', position:'absolute',
                        fontSize: textSize, backgroundColor: 'transparent', color: GLOBAL.clusterTextColor, fontWeight: 'bold'}}
                          children = {textForCluster}/>
                </View>;
            }else{
                htmlElement = (
                    <View style = {{ borderRadius: markerWidth, position: 'relative', backgroundColor: GLOBAL.clusterColor, width: markerWidth, height: markerHeight,
                        borderWidth: GLOBAL.clusterBorderWidth, borderColor: GLOBAL.clusterBorderColor, justifyContent: 'center', alignItems: 'center'}}>
                        <Text
                            style = {{width: markerWidth, textAlign: 'center',
                                fontSize: textSize, backgroundColor: 'transparent', color: GLOBAL.clusterTextColor, fontWeight: 'bold'}}>
                            {textForCluster}</Text>
                    </View>);
            }
        }else{
            isCluster = 0;
            htmlElement = this.props.item;
        }

        if(isCluster === 1){
            if(this.props.onClusterPress){
                return(
                    <Marker
                        key = {isCluster}
                        {...this.state.props}
                        coordinate = {coordinates}
                        onPress = {()=>{
                            let markers = superCluster.getLeaves(this.state.clusterId);
                            this.props.onClusterPress(this.state.coordinates, markers);
                        }}>
                        {htmlElement}
                    </Marker>
                );
            }else{
                return(
                    <Marker
                        key = {isCluster}
                        coordinate = {coordinates}
                        {...this.state.props}>
                        {htmlElement}
                    </Marker>
                );
            }
        }else{
            return(htmlElement);
        }
    }
}