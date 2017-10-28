import React, { Component } from 'react';
import MapView from 'react-native-maps';
import { width as w , height as h } from 'react-native-dimension';
import CustomMarker from './CustomMarker';
import SuperCluster from 'supercluster';
import geoViewport from '@mapbox/geo-viewport';

const height = h(100);
const width = w(100);
const divideBy = 7;
var superCluster;

export default class MapWithClustering extends Component {

    constructor(props) {
        super(props);
        this.state = {
            clustering: props.clustering,
            region: props.region,
            initRegion : props.region,
            mapProps: null,
            markers: [],
            markersOnMap: [],
            otherChildren: [],
            numberOfMarkers: 0,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.state.onClusterPress = nextProps.onClusterPress;
        this.createMarkersOnMap(nextProps);
    }

    componentWillMount() {
        this.state.onClusterPress = this.props.onClusterPress;
        this.createMarkersOnMap(this.props);
    }

    createMarkersOnMap(propsData){
        this.state.markers = [];
        this.state.mapProps = propsData;
        this.state.otherChildren = [];

        if (propsData.children !== undefined) {
            let size = propsData.children.length;

            if (size === undefined) {
                // one marker no need for clustering
                if (propsData.children.props && propsData.children.props.coordinate) {
                    this.state.markers.push({
                        props:  propsData.children.props,
                        properties: {point_count: 0},
                        geometry: {
                            type: "Point",
                            coordinates: [propsData.children.props.coordinate.longitude, propsData.children.props.coordinate.latitude]
                        }
                    });
                    this.state.numberOfMarkers = 1;
                } else {
                    this.state.otherChildren = propsData.children
                }
            } else {
                let newArray = [];
                propsData.children.map((item) => {
                    if (item.length === 0 || item.length === undefined) {
                        newArray.push(item);
                    } else {
                        item.map((child) => {
                            newArray.push(child);
                        });
                    }
                });

                this.state.numberOfMarkers = newArray.length;
                newArray.map((item) => {
                    if (item.props && item.props.coordinate) {
                        this.state.markers.push({
                            props:  item.props,
                            properties: {point_count: 0},
                            geometry: {
                                type: "Point",
                                coordinates: [item.props.coordinate.longitude, item.props.coordinate.latitude]
                            }
                        });
                    } else {
                        this.state.otherChildren.push(item);
                    }
                });
            }
            superCluster = SuperCluster({
                radius: width/22,
                maxZoom: 20
            });
            superCluster.load(this.state.markers);
            this.calculateClustersForMap();
        }
    }

    onRegionChangeComplete(region) {
        this.state.region = region;
        if(region.longitudeDelta<=80){
            if ((Math.abs(region.latitudeDelta - this.state.initRegion.latitudeDelta) > this.state.initRegion.latitudeDelta / divideBy)||
                (Math.abs(this.state.region.longitude-this.state.initRegion.longitude) >= this.state.initRegion.longitudeDelta/4) ||
                (Math.abs(this.state.region.latitude-this.state.initRegion.latitude) >= this.state.initRegion.latitudeDelta/4)) {
                this.state.initRegion = region;
                this.calculateClustersForMap();
                this.setState(this.state);
            }
        }
    }

    calculateBBox(){
        return [
            this.state.region.longitude-this.state.region.longitudeDelta,
            this.state.region.latitude-this.state.region.latitudeDelta,
            this.state.region.longitude+this.state.region.longitudeDelta,
            this.state.region.latitude+this.state.region.latitudeDelta
        ];
    }

    getZoomLevel(bbox){
        return geoViewport.viewport(bbox, [height, width]);
    }

    calculateClustersForMap(){
        this.state.markersOnMap = [];
        if(this.state.clustering){
            let bbox = this.calculateBBox();
            let zoom;
            if(this.state.region.longitudeDelta>=40){
                zoom = 0;
            }else{
                zoom = this.getZoomLevel(bbox).zoom;
            }
            let cluster = superCluster.getClusters([bbox[0], bbox[1], bbox[2], bbox[3]], zoom);

            for(let i = 0; i < cluster.length; i++){
                this.state.markersOnMap.push(
                    <CustomMarker key = {i} onClusterPress = {this.state.onClusterPress}
                                  customClusterMarkerDesign = {this.props.customClusterMarkerDesign} {...cluster[i]}>
                        { cluster[i].properties.point_count === 0 ?  cluster[i].props.children : null }
                    </CustomMarker>

                );
            }
        }else{
            for(let i = 0; i < this.state.markers.length; i++){
                this.state.markersOnMap.push(
                    <CustomMarker key = {i} {...this.state.markers[i]}>
                        { cluster[i].properties.point_count === 0 ?  cluster[i] : null }
                    </CustomMarker>
                );
            }
        }
    }

    render() {
        this.state.clustering = this.props.clustering;
        GLOBAL.clusterColor = this.props.clusterColor;
        GLOBAL.clusterTextColor = this.props.clusterTextColor;
        GLOBAL.clusterBorderColor = this.props.clusterBorderColor;
        GLOBAL.clusterBorderWidth = this.props.clusterBorderWidth;

        return (
            <MapView {...this.state.mapProps}
                     region={this.state.region}
                     ref={(ref) => this._root = ref}
                     onRegionChangeComplete={(region) => {
                         if( this.state.mapProps.onRegionChangeComplete){
                             this.state.mapProps.onRegionChangeComplete(region);
                         }
                         this.onRegionChangeComplete(region);
                     }}>
                {this.state.markersOnMap}
                {this.state.otherChildren}
            </MapView>
        );
    }
}
MapWithClustering.defaultProps = {
    clusterColor: '#F5F5F5',
    clusterTextColor: '#FF5252',
    clusterBorderColor: '#FF5252',
    clusterBorderWidth: 1,
    clustering: true
};
