import React, { Component } from 'react';
import MapView from 'react-native-maps';
import { width as w , height as h } from 'react-native-dimension';
import CustomMarker from './CustomMarker';

const height = h(100);
const width = w(100);

const divideBy = 5;
const clusterPercentageRange = 0.05;
var _root;

export default class MapWithClustering extends Component{

    constructor(){
        super();
        this.state = {
            enableClustering: true,
            clusterColor: '',
            clusterTextColor: '',
            clusterBorderColor: '',
            clusterBorderWidth: 0,
            numberOfMarkers: 0,
            initDelta: 0,
            region: {},
            markers: new Set(),
            markersOnMap: [],
            mapProps: null,
        };
    }

    createMarkers(propsData){
        this.state.markers.clear();
        this.state.mapProps = propsData;
        this.state.initDelta = propsData.region.latitudeDelta;
        this.state.region = propsData.region;
        this.state.numberOfMarkers = 0;

        if(propsData.children !== undefined){
            let size = propsData.children.length;

            if(size === undefined){
                // one marker no need for clustering
                this.state.numberOfMarkers = 1;
                this.state.markers.add({
                    key: 1,
                    belly: new Set(),
                    value: 1,
                    uid: 1,
                    props: propsData.children.props,
                });
            }else{
                this.state.numberOfMarkers = size;
                markerKey = 0;
                propsData.children.map((item)=>{
                    this.state.markers.add({
                        key: markerKey,
                        belly: new Set(),
                        value: 1,
                        props: item.props
                    });
                    markerKey++;
                });
            }
            this.calculateCluster(1, this.state.initDelta*clusterPercentageRange);
        }
    }
    componentWillReceiveProps(nextProps){
        this.createMarkers(nextProps);
    }

    componentWillMount(){
        this.createMarkers(this.props);
    }

    onRegionChangeComplete(region) {
        this.state.region = region;
        if(this.state.numberOfMarkers > 1 && this.state.enableClustering) {
            if(region.latitudeDelta- this.state.initDelta >  this.state.initDelta/divideBy){
                this.state.initDelta = region.latitudeDelta;
                this.calculateCluster(1, region.latitudeDelta*clusterPercentageRange);
            }if(region.latitudeDelta- this.state.initDelta < - this.state.initDelta/divideBy){
                this.state.initDelta = region.latitudeDelta;
                this.calculateCluster(-1, region.latitudeDelta*clusterPercentageRange);
            }
        }
        this.setState({region: region});
    }

    calculateCluster(direction, clusterRange){
        if(this.state.enableClustering) {
            this.state.markers.forEach((marker) => {
                let belly = marker.belly;
                let y = marker.props.coordinate.latitude;
                let x = marker.props.coordinate.longitude;
                let id = marker.key;

                if(direction === 1){
                    this.state.markers.forEach( (childMarker) => {
                        let id2 = childMarker.key;
                        if(id !== id2){
                            let y2 = childMarker.props.coordinate.latitude;
                            let x2 = childMarker.props.coordinate.longitude;
                            if(Math.abs(y-y2) < clusterRange && Math.abs(x-x2) < clusterRange){
                                belly.add(childMarker);
                                marker.value += childMarker.value;
                                this.state.markers.delete(childMarker);
                            }}});
                }else{
                    belly.forEach( (childMarker) => {
                        let y2 = childMarker.props.coordinate.latitude;
                        let x2 = childMarker.props.coordinate.longitude;
                        if(Math.abs(y-y2) > clusterRange || Math.abs(x-x2) > clusterRange){
                            belly.delete(childMarker);
                            marker.value -= childMarker.value;
                            this.state.markers.add(childMarker);
                        }});}
            });
            if(direction === -1){
                this.calculateCluster(1, clusterRange);
            }else{
                // makrers on map for given set
                this.state.markersOnMap = [];
                this.state.markers.forEach((marker)=>{
                    this.state.markersOnMap.push(<CustomMarker clusterColor = {this.state.clusterColor} {...marker}
                                                               clusterTextColor = {this.state.clusterTextColor} clusterBorderColor = {this.state.clusterBorderColor}
                                                               clusterBorderWidth = {this.state.clusterBorderWidth}
                    >{marker.props.children}</CustomMarker>);
                });
                this.setState(this.state);
            }
        }else{
            this.state.markersOnMap = [];
            this.state.markers.forEach((marker)=>{
                this.state.markersOnMap.push(<CustomMarker {...marker}>{marker.props.children}</CustomMarker>);
            });
            this.setState(this.state);
        }
    }

    render(){
        let clustering = this.props.clustering;
        if(clustering === false || clustering === true){
            this.state.enableClustering = clustering;
        }else{
            this.state.enableClustering = true;
        }

        this.state.clusterColor = this.props.clusterColor;
        this.state.clusterTextColor = this.props.clusterTextColor;
        this.state.clusterBorderColor = this.props.clusterBorderColor;
        this.state.clusterBorderWidth = this.props.clusterBorderWidth;

        return(
            <MapView {...this.state.mapProps}
                     region = {this.state.region}
                     ref = {(ref) => this._root=ref}
                     onRegionChangeComplete={(region)=> {
                         this.onRegionChangeComplete(region);
                     }}>
                {this.state.markersOnMap}
            </MapView>
        );
    }

}