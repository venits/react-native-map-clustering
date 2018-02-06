import React, { Component } from 'react';
import { Image, Text, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { width as w, height as h } from 'react-native-dimension';

const width = w(100);

const backgroundColor = 'transparent';

const styles = StyleSheet.create({
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        textAlign: 'center',
        position: 'absolute',
        backgroundColor,
        fontWeight: 'bold',
    },
});

export default class CustomMarker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: false,
            coordinates: null,
            props: {},
            point_count: 0, // Comes from superCluster
            clusterId: null,
        };
    }

    componentDidCatch(error) {
        if (__DEV__) {
            console.error(error);
        }
        this.setState({ error });
    }

    createPressHandler = (markers) => () => {
        this.props.onClusterPress(markers);
    };

    render() {
        if (this.state.error) {
            return null;
        }

        let itemProps = {};
        let clusterId;

        if (this.props.properties.point_count === 0) {
            itemProps = this.props.item.props;
        } else {
            clusterId = this.props.properties.cluster_id;
        }

        const coordinates = {
            longitude: this.props.geometry.coordinates[0],
            latitude: this.props.geometry.coordinates[1],
        };

        let textForCluster;
        let markerWidth;
        let markerHeight;
        let textSize;

        if (this.props.properties.point_count >= 2 && this.props.properties.point_count <= 10) {
            textForCluster = this.props.properties.point_count;
            markerWidth = width * 2 / 15;
            markerHeight = width * 2 / 15;
            textSize = this.props.clusterTextSize;
        } else if (this.props.properties.point_count > 10 && this.props.properties.point_count <= 25) {
            textForCluster = '10+';
            markerWidth = width / 7;
            markerHeight = width / 7;
            textSize = this.props.clusterTextSize * 0.7;
        } else if (this.props.properties.point_count > 25 && this.props.properties.point_count <= 50) {
            textForCluster = '25+';
            markerWidth = width * 2 / 13;
            markerHeight = width * 2 / 13;
            textSize = this.props.clusterTextSize * 0.7;
        } else if (this.props.properties.point_count > 50 && this.props.properties.point_count <= 100) {
            textForCluster = '50+';
            markerWidth = width / 6;
            markerHeight = width / 6;
            textSize = this.props.clusterTextSize * 0.7;
        } else if (this.props.properties.point_count > 100) {
            textForCluster = '100+';
            markerWidth = width * 2 / 11;
            markerHeight = width * 2 / 11;
            textSize = this.props.clusterTextSize * 0.5;
        }

        let clusterColor;
        let markers;

        if (clusterId) {
            try {
                markers = this.props.superCluster.getLeaves(clusterId);
            } catch (error) {
                if (__DEV__) {
                    console.log(`${clusterId} - ${error.message}`);
                }
                return null;
            }
        }

        if (this.props.getClusterColor && markers) {
            clusterColor =
                this.props.getClusterColor(markers) ||
                this.props.clusterTextColor;
        } else {
            clusterColor = this.props.clusterTextColor;
        }

        let content;
        let isCluster;

        if (textForCluster) {
            isCluster = true;
            if (
                this.props.customClusterMarkerDesign &&
                typeof this.props.customClusterMarkerDesign === 'function'
            ) {
                content = (
                    <View
                        style={[
                            styles.centerContent,
                            {
                                width: markerWidth,
                                height: markerHeight,
                            },
                        ]}
                    >
                        {this.props.customClusterMarkerDesign(markers || [])}
                        <Text
                            style={[
                                styles.text,
                                {
                                    width: markerWidth,
                                    fontSize: textSize,
                                    color: clusterColor,
                                },
                            ]}
                        >
                            {textForCluster}
                        </Text>
                    </View>
                );
            } else if (
                this.props.customClusterMarkerDesign &&
                typeof this.props.customClusterMarkerDesign === 'object'
            ) {
                content = (
                    <View
                        style={[
                            styles.centerContent,
                            {
                                width: markerWidth,
                                height: markerHeight,
                            },
                        ]}
                    >
                        {this.props.customClusterMarkerDesign}
                        <Text
                            style={[
                                styles.text,
                                {
                                    width: markerWidth,
                                    fontSize: textSize,
                                    color: clusterColor,
                                },
                            ]}
                        >
                            {textForCluster}
                        </Text>
                    </View>
                );
            } else {
                content = (
                    <View
                        style={[
                            styles.centerContent,
                            {
                                borderRadius: markerWidth,
                                backgroundColor: this.props.clusterColor,
                                width: markerWidth,
                                height: markerHeight,
                                borderWidth: this.props.clusterBorderWidth,
                                borderColor: this.props.clusterBorderColor,
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.text,
                                {
                                    width: markerWidth,
                                    fontSize: textSize,
                                    color: clusterColor,
                                }
                            ]}
                        >
                            {textForCluster}
                        </Text>
                    </View>
                );
            }
        } else {
            isCluster = false;

            content = this.props.item;
        }

        if (isCluster) {
            if (this.props.onClusterPress) {
                return (
                    <Marker
                        key={isCluster}
                        {...itemProps}
                        coordinate={coordinates}
                        onPress={this.createPressHandler(markers)}
                    >
                        {content}
                    </Marker>
                );
            } else {
                return (
                    <Marker
                        key={isCluster}
                        pointerEvents={'none'}
                        coordinate={coordinates}
                        {...itemProps}
                    >
                        {content}
                    </Marker>
                );
            }
        } else {
            return content;
        }
    }
}
