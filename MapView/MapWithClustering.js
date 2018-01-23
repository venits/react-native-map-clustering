import React, { Component } from 'react';
import MapView from 'react-native-maps';
import { width as w , height as h } from 'react-native-dimension';
import CustomMarker from './CustomMarker';
import SuperCluster from 'supercluster';
import geoViewport from '@mapbox/geo-viewport';

const height = h(100);
const width = w(100);
const divideBy = 7;

export default class MapWithClustering extends Component {
    constructor(props) {
        super(props);

        this.state = {
            clustering: props.clustering,
            markers: [],
            markersOnMap: [],
            otherChildren: [],
            numberOfMarkers: 0,
            region: props.region || props.initialRegion,
            previousRegion: props.region || props.initialRegion,
        };
        this.superCluster = Symbol('superCluster');
    }

    componentWillMount() {
        this.createMarkersOnMap();
    }

    componentWillReceiveProps() {
        this.createMarkersOnMap();
    }

    createMarkersOnMap () {
        newState = {
            markers: [],
            otherChildren: []
        };

        if (this.props.children !== undefined) {
            let size = this.props.children.length;

            if (size === undefined) {
                // one marker no need for clustering
                if (this.props.children.props && this.props.children.props.coordinate) {
                    newState.markers.push({
                        item: this.props.children,
                        properties: {point_count: 0},
                        geometry: {
                            type: "Point",
                            coordinates: [this.props.children.props.coordinate.longitude, this.props.children.props.coordinate.latitude]
                        }
                    });
                    newState.numberOfMarkers = 1;
                } else {
                    newState.otherChildren = this.props.children
                }
            } else {
                let newArray = [];
                this.props.children.map((item) => {
                    if (item.length === 0 || item.length === undefined) {
                        newArray.push(item);
                    } else {
                        item.map((child) => {
                            newArray.push(child);
                        });
                    }
                });

                newState.numberOfMarkers = newArray.length;
                newArray.map((item) => {
                    let canBeClustered = true;
                    item.props.cluster === undefined ? canBeClustered = true : canBeClustered = item.props.cluster;
                    if (item.props && item.props.coordinate && canBeClustered) {
                        newState.markers.push({
                            item: item,
                            properties: {point_count: 0},
                            geometry: {
                                type: "Point",
                                coordinates: [item.props.coordinate.longitude, item.props.coordinate.latitude]
                            }
                        });
                    } else {
                        newState.otherChildren.push(item);
                    }
                });
            }
            GLOBAL[this.superCluster] = SuperCluster({
                radius: width / this.props.radius,
                maxZoom: 20
            });
            GLOBAL[this.superCluster].load(newState.markers);
            this.calculateClustersForMap();
            this.setState(newState);
        }
    }

    onRegionChangeComplete(region) {
        if (region.longitudeDelta <= 80 && GLOBAL[this.superCluster]){
            if ((Math.abs(region.latitudeDelta - this.state.previousRegion.latitudeDelta) > this.state.previousRegion.latitudeDelta / divideBy)||
                (Math.abs(region.longitude - this.state.previousRegion.longitude) >= this.state.previousRegion.longitudeDelta/4) ||
                (Math.abs(region.latitude - this.state.previousRegion.latitude) >= this.state.previousRegion.latitudeDelta/4)) {
                this.calculateClustersForMap();
                this.setState({
                    region,
                    previousRegion: region
                });
            }
        }
    }

    calculateBBox = () => {
        return [
            this.state.region.longitude - this.state.region.longitudeDelta,
            this.state.region.latitude - this.state.region.latitudeDelta,
            this.state.region.longitude + this.state.region.longitudeDelta,
            this.state.region.latitude + this.state.region.latitudeDelta
        ];
    }

    getZoomLevel(bbox){
        return geoViewport.viewport(bbox, [height, width]);
    }

    calculateClustersForMap(){
        const markersOnMap = [];

        if (!GLOBAL[this.superCluster]) {
            throw new Error('SuperCluster not set!');
        }

        if (this.props.clustering) {
            let bbox = this.calculateBBox();
            let zoom;
            if (this.state.region.longitudeDelta >= 40) {
                zoom = 0;
            } else {
                zoom = this.getZoomLevel(bbox).zoom || 0;
            }
            if (isNaN(zoom)) {
                zoom = 0;
            }
            let cluster = GLOBAL[this.superCluster].getClusters([bbox[0], bbox[1], bbox[2], bbox[3]], zoom);

            for(let i = 0; i < cluster.length; i++){
                markersOnMap.push(
                    <CustomMarker
                        key={i}
                        onClusterPress={this.props.onClusterPress}
                        customClusterMarkerDesign={this.props.customClusterMarkerDesign}
                        {...cluster[i]}
                        getClusterColor={this.props.setClusterColor}
                        superCluster={this.superCluster}
                    >
                        {cluster[i].properties.point_count === 0 ?  cluster[i].item : null}
                    </CustomMarker>
                );
            }
        } else {
            for (let i = 0; i < this.state.markers.length; i++) {
                markersOnMap.push(
                    <CustomMarker
                        key={i}
                        {...this.state.markers[i]}
                        getClusterColor={this.props.setClusterColor}
                    >
                        {this.state.markers[i].properties.point_count === 0 ?  this.state.markers[i].item : null}
                    </CustomMarker>
                );
            }
        }
        this.setState({ markersOnMap });
    }

    handleRegionChangeComplete = (region) => {
         if (this.props.onRegionChangeComplete) {
             this.props.onRegionChangeComplete(region);
         }
         this.onRegionChangeComplete(region);
     }

    render() {
        GLOBAL.clusterColor = this.props.clusterColor;
        GLOBAL.clusterTextColor = this.props.clusterTextColor;
        GLOBAL.clusterTextSize = this.props.clusterTextSize;
        GLOBAL.clusterBorderColor = this.props.clusterBorderColor;
        GLOBAL.clusterBorderWidth = this.props.clusterBorderWidth;

        return (
            <MapView
                {...this.props}
                initialRegion={this.props.initRegion}
                 ref={(ref) => this._root = ref}
                 onRegionChangeComplete={this.handleRegionChangeComplete}
            >
                {this.state.markersOnMap}
                {this.state.otherChildren}
            </MapView>
        );
    }
}
MapWithClustering.defaultProps = {
    clusterColor: '#F5F5F5',
    clusterTextColor: '#FF5252',
    clusterTextSize: 17,
    clusterBorderColor: '#FF5252',
    clusterBorderWidth: 1,
    clustering: true,
    radius: 22,
};
