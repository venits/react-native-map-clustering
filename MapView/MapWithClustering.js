import React, { Component } from 'react';
import MapView from 'react-native-maps';
import { width as w, height as h } from 'react-native-dimension';
import CustomMarker from './CustomMarker';
import superCluster from 'supercluster';
import geoViewport from '@mapbox/geo-viewport';

const height = h(100);
const width = w(100);
const divideBy = 7;

export default class MapWithClustering extends Component {
    static defaultProps = {
        clusterColor: '#F5F5F5',
        clusterTextColor: '#FF5252',
        clusterTextSize: 17,
        clusterBorderColor: '#FF5252',
        clusterBorderWidth: 1,
        clustering: true,
        radius: 22,
        maxZoom: 20,
    };

    constructor(props) {
        super(props);

        this.superCluster = superCluster({
            radius: width / props.radius,
            maxZoom: props.maxZoom,
        });

        this.state = {
            markers: [],
            markersOnMap: [],
            otherChildren: [],
            numberOfMarkers: 0,
            region: props.region || props.initialRegion,
            previousRegion: props.region || props.initialRegion,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.radius !== this.props.radius) {
            this.superCluster = superCluster({
                radius: width / nextProps.radius,
                maxZoom: this.props.maxZoom,
            });
        }
    }

    getMarkers = () => {
        const markers = [];
        const otherChildren = [];

        if (!this.props.clustering) {
            return this.props.children;
        } else if (!this.superCluster) {
            throw new Error('SuperCluster not set!');
        }

        if (this.props.children) {
            const size = this.props.children.length;

            if (size === 0) {
                return null;
            } else if (!size) {
                const item = this.props.children;

                // one marker no need for clustering
                if (
                    this.props.children.props &&
                    this.props.children.props.coordinate
                ) {
                    markers.push({
                        item,
                        properties: { point_count: 0 },
                        geometry: {
                            type: 'Point',
                            coordinates: [
                                item.props.coordinate.longitude,
                                item.props.coordinate.latitude,
                            ],
                        },
                    });
                } else {
                    otherChildren.push(item);
                }
            } else {
                let newArray = [];

                this.props.children.forEach((item) => {
                    if (!Array.isArray(item)) {
                        newArray.push(item);
                    } else {
                        newArray = newArray.concat(item);
                    }
                });

                newArray.forEach((item) => {
                    let canBeClustered = true;
                    if (item.props) {
                        canBeClustered = typeof item.props.cluster !== 'undefined'
                            ? item.props.cluster
                            : true;
                    }

                    if (item.props && item.props.coordinate && canBeClustered) {
                        markers.push({
                            item,
                            properties: { point_count: 0 },
                            geometry: {
                                type: 'Point',
                                coordinates: [
                                    item.props.coordinate.longitude,
                                    item.props.coordinate.latitude,
                                ],
                            },
                        });
                    } else {
                        otherChildren.push(item);
                    }
                });
            }

            const bbox = this.calculateBBox();
            let zoom;

            this.superCluster.load(markers);

            if (this.state.region.longitudeDelta >= 40) {
                zoom = 0;
            } else {
                zoom = this.getZoomLevel(bbox).zoom || 0;
            }
            if (isNaN(zoom)) {
                zoom = 0;
            }

            const clusters = this.superCluster.getClusters(
                bbox,
                zoom
            );

            const customMarkers = clusters.map((cluster) => (
                <CustomMarker
                    key={`custom-marker-${cluster.properties.cluster ? cluster.properties.cluster_id : cluster.item.key}`}
                    onClusterPress={this.props.onClusterPress}
                    customClusterMarkerDesign={this.props.customClusterMarkerDesign}
                    {...cluster}
                    getClusterColor={this.props.setClusterColor}
                    superCluster={this.superCluster}
                    clusterTextColor={this.props.clusterTextColor}
                >
                    {cluster.properties.point_count === 0
                        ? cluster.item
                        : null}
                </CustomMarker>
            )).filter((marker) => Boolean(marker));

            if (customMarkers.length && otherChildren.length) {
                return [
                    customMarkers,
                    otherChildren,
                ];
            } else if (customMarkers.length && !otherChildren.length) {
                return customMarkers;
            } else {
                return otherChildren;
            }
        }
    };

    onRegionChangeComplete = (region) => {
        if (region.longitudeDelta <= 80 && this.superCluster) {
            if (
                Math.abs(
                    region.latitudeDelta -
                        this.state.previousRegion.latitudeDelta
                ) >
                    this.state.previousRegion.latitudeDelta / divideBy ||
                Math.abs(
                    region.longitude - this.state.previousRegion.longitude
                ) >=
                    this.state.previousRegion.longitudeDelta / 4 ||
                Math.abs(
                    region.latitude - this.state.previousRegion.latitude
                ) >=
                    this.state.previousRegion.latitudeDelta / 4
            ) {
                this.setState({
                    region,
                    previousRegion: region,
                });
            }
        }
    };

    calculateBBox = () => ([
        this.state.region.longitude - this.state.region.longitudeDelta,
        this.state.region.latitude - this.state.region.latitudeDelta,
        this.state.region.longitude + this.state.region.longitudeDelta,
        this.state.region.latitude + this.state.region.latitudeDelta,
    ]);

    getZoomLevel = (bbox) => {
        return geoViewport.viewport(bbox, [height, width]);
    };

    handleRegionChangeComplete = (region) => {
        if (this.props.onRegionChangeComplete) {
            this.props.onRegionChangeComplete(region);
        }
        this.onRegionChangeComplete(region);
    };

    registerRef = (component) => {
        this._root = component;
    };

    render() {
        return (
            <MapView
                {...this.props}
                initialRegion={this.props.initialRegion}
                ref={this.registerRef}
                onRegionChangeComplete={this.handleRegionChangeComplete}
            >
                {this.getMarkers()}
            </MapView>
        );
    }
}
