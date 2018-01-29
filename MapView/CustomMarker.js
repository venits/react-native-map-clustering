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
        if (
            this.state.geometry === nextProps.geometry
            && this.state.point_count === nextProps.properties.point_count
        ){
            return false;
        } else {
            return true;
        }
    }

    componentDidCatch (error) {
        if (__DEV__) {
            console.error(error);
        }
        this.setState({ error });
    }

    createPressHandler = (markers) => () => {
        this.props.onClusterPress(markers);
    }

    render(){
        if (this.state.error) {
            return null;
        }

        let pointCount = this.props.properties.point_count;
        let itemProps = {};
        let clusterId;

        if (pointCount === 0){
            itemProps = this.props.item.props;
        } else {
            clusterId = this.props.properties.cluster_id;
        }

        let coordinates = {
            longitude: this.props.geometry.coordinates[0],
            latitude: this.props.geometry.coordinates[1]
        };

        let textForCluster = '';
        let markerWidth, markerHeight, textSize;

        if (pointCount >= 2 && pointCount <= 10) {
            textForCluster = pointCount;
            markerWidth = width * 2 / 15;
            markerHeight = width * 2 / 15;
            textSize = GLOBAL.clusterTextSize;
        } if (pointCount > 10 && pointCount <= 25) {
            textForCluster = '10+';
            markerWidth = width / 7;
            markerHeight = width / 7;
            textSize = GLOBAL.clusterTextSize;
        } if (pointCount > 25 && pointCount <= 50) {
            textForCluster = '25+';
            markerWidth = width * 2 / 13;
            markerHeight = width * 2 / 13;
            textSize = GLOBAL.clusterTextSize;
        } if (pointCount > 50 && pointCount <= 100) {
            textForCluster = '50+';
            markerWidth = width / 6;
            markerHeight = width / 6;
            textSize = GLOBAL.clusterTextSize;
        } if (pointCount > 100) {
            textForCluster = '100+';
            markerWidth = width * 2 / 11;
            markerHeight = width * 2 / 11;
            textSize = GLOBAL.clusterTextSize;
        }

        if (GLOBAL.clusterTextSize) {
            textSize = GLOBAL.clusterTextSize;
        }
        let clusterColor;
        let markers;
        if (clusterId) {
            try {
                markers = GLOBAL[this.props.superCluster].getLeaves(clusterId);
            } catch (error) {
                if (__DEV__) {
                    console.log(clusterId + ' - ' + error.message);
                }
                return null;
            }
        }

        if (this.props.getClusterColor && markers) {
            clusterColor = this.props.getClusterColor(markers) || GLOBAL.clusterTextColor;
        } else {
            clusterColor = GLOBAL.clusterTextColor
        }

        let htmlElement;
        let isCluster;
        if (textForCluster !== ''){
            isCluster = 1;
            if (this.props.customClusterMarkerDesign && typeof this.props.customClusterMarkerDesign === "function") {
                htmlElement = (
                    <View
                        style={{
                            width: markerWidth,
                            height: markerHeight,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {this.props.customClusterMarkerDesign(markers || [])}
                        <Text
                            style={{
                                width: markerWidth,
                                textAlign: 'center',
                                position: 'absolute',
                                fontSize: textSize,
                                backgroundColor: 'transparent',
                                color: clusterColor,
                                fontWeight: 'bold'
                            }}
                        >
                            {textForCluster}
                        </Text>
                    </View>
                );
            } else if (this.props.customClusterMarkerDesign && typeof this.props.customClusterMarkerDesign === "object"){
                htmlElement = (
                    <View
                        style={{
                            width: markerWidth,
                            height: markerHeight,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {this.props.customClusterMarkerDesign}
                        <Text
                            style={{
                                width: markerWidth,
                                textAlign: 'center',
                                position:'absolute',
                                fontSize: textSize,
                                backgroundColor: 'transparent',
                                color: clusterColor,
                                fontWeight: 'bold'
                            }}
                        >
                            {textForCluster}
                        </Text>
                    </View>
                );
            }else{
                htmlElement = (
                    <View
                        style={{
                            borderRadius: markerWidth,
                            position: 'relative',
                            backgroundColor: GLOBAL.clusterColor,
                            width: markerWidth,
                            height: markerHeight,
                            borderWidth: GLOBAL.clusterBorderWidth,
                            borderColor: GLOBAL.clusterBorderColor,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Text
                            style={{width: markerWidth,
                                textAlign: 'center',
                                fontSize: textSize,
                                backgroundColor: 'transparent',
                                color: clusterColor,
                                fontWeight: 'bold'
                            }}
                        >
                            {textForCluster}
                        </Text>
                    </View>
                );
            }
        } else {
            isCluster = 0;
            htmlElement = this.props.item;
        }

        if (isCluster === 1){
            if (this.props.onClusterPress){
                return(
                    <Marker
                        key={isCluster}
                        {...itemProps}
                        coordinate={coordinates}
                        onPress={this.createPressHandler(markers)}
                    >
                        {htmlElement}
                    </Marker>
                );
            } else {
                return(
                    <Marker
                        pointerEvents={'none'}
                        key={isCluster}
                        coordinate={coordinates}
                        {...itemProps}
                    >
                        {htmlElement}
                    </Marker>
                );
            }
        } else {
            return htmlElement;
        }
    }
}
