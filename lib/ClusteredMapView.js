import React, { memo, useState, useEffect, useMemo, createRef } from "react";
import { Dimensions, LayoutAnimation, Platform } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import SuperCluster from "supercluster";
import ClusterMarker from "./ClusteredMarker";
import {
  isMarker,
  markerToGeoJSONFeature,
  calculateBBox,
  returnMapZoom,
  generateSpiral
} from "./helpers";

const ClusteredMapView = ({
  radius,
  maxZoom,
  minZoom,
  extent,
  nodeSize,
  children,
  onClusterPress,
  onRegionChangeComplete,
  onMarkersChange,
  preserveClusterPressBehavior,
  clusteringEnabled,
  clusterColor,
  clusterTextColor,
  spiderLineColor,
  layoutAnimationConf,
  animationEnabled,
  renderCluster,
  ...restProps
}) => {
  const [markers, updateMarkers] = useState([]);
  const [spiderMarkers, updateSpiderMarker] = useState([]);
  const [otherChildren, updateChildren] = useState([]);
  const [superCluster, setSuperCluster] = useState(null);
  const [currentRegion, updateRegion] = useState(
    restProps.region || restProps.initialRegion
  );

  const [isSpiderfier, updateSpiderfier] = useState(false);
  const [spiderfierMarker, updateSpiderfierMarker] = useState(null);
  const [clusterChildren, updateClusterChildren] = useState(null);
  const mapRef = createRef();

  const propsChildren = useMemo(() => React.Children.toArray(children), [
    children
  ]);

  useEffect(() => {
    const rawData = [];
    const otherChildren = [];

    if (!clusteringEnabled) {
      updateChildren(propsChildren);
      return;
    }

    React.Children.forEach(children, (child, i) => {
      if (isMarker(child)) {
        rawData.push(markerToGeoJSONFeature(child, i));
      } else {
        otherChildren.push(child);
      }
    });

    const superCluster = new SuperCluster({
      radius,
      maxZoom,
      minZoom,
      extent,
      nodeSize
    });

    superCluster.load(rawData);

    const bBox = calculateBBox(currentRegion);
    const zoom = returnMapZoom(currentRegion, bBox, minZoom);
    const markers = superCluster.getClusters(bBox, zoom);

    updateMarkers(markers);
    onMarkersChange(markers);
    updateChildren(otherChildren);
    setSuperCluster(superCluster);
  }, [children, restProps.region, restProps.initialRegion]);

  useEffect(() => {
    if (isSpiderfier && markers.length > 0) {
      let positions = generateSpiral(
        markers[0].properties.point_count,
        markers[0].geometry.coordinates,
        clusterChildren
      );
      updateSpiderMarker(positions);
      updateSpiderfierMarker({
        latitude: markers[0].geometry.coordinates[1],
        longitude: markers[0].geometry.coordinates[0]
      });
    } else {
      updateSpiderMarker([]);
    }
  }, [isSpiderfier]);

  const _onRegionChangeComplete = region => {
    if (superCluster) {
      const bBox = calculateBBox(region);
      const zoom = returnMapZoom(region, bBox, minZoom);
      const markers = superCluster.getClusters(bBox, zoom);

      if (animationEnabled && Platform.OS === "ios") {
        LayoutAnimation.configureNext(layoutAnimationConf);
      }
      if (zoom >= 17 && markers.length === 1 && clusterChildren) {
        updateSpiderfier(true);
      } else {
        updateSpiderfier(false);
      }

      updateMarkers(markers);
      onRegionChangeComplete(region, markers);
      updateRegion(region);
    }
  };

  const _onClusterPress = cluster => () => {
    const children = superCluster.getLeaves(cluster.id, (limit = Infinity));
    updateClusterChildren(children);

    if (preserveClusterPressBehavior) {
      onClusterPress(cluster, children);
      return;
    }

    const coordinates = children.map(({ geometry }) => ({
      latitude: geometry.coordinates[1],
      longitude: geometry.coordinates[0]
    }));

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: restProps.edgePadding
    });

    onClusterPress(cluster, children);
  };

  return (
    <MapView
      {...restProps}
      ref={map => {
        restProps.mapRef(map);
        mapRef.current = map;
      }}
      onRegionChangeComplete={_onRegionChangeComplete}>
      {markers.map(marker =>
        marker.properties.point_count === 0 ? (
          propsChildren[marker.properties.index]
        ) : !isSpiderfier ? (
          renderCluster ? (
            renderCluster({
              onPress: _onClusterPress(marker),
              clusterColor,
              clusterTextColor,
              ...marker
            })
          ) : (
            <ClusterMarker
              key={`cluster-${marker.id}`}
              {...marker}
              onPress={_onClusterPress(marker)}
              clusterColor={clusterColor}
              clusterTextColor={clusterTextColor}
            />
          )
        ) : null
      )}
      {otherChildren}
      {spiderMarkers.map(marker => (
        <Marker
          key={marker.latitude}
          coordinate={marker}
          image={marker.image}
          onPress={marker.onPress}
        ></Marker>
      ))}
      {spiderMarkers.map((marker, index) => {
        {
          return (
            spiderfierMarker && (
              <Polyline
                key={index}
                coordinates={[spiderfierMarker, marker, spiderfierMarker]}
                strokeColor={spiderLineColor}
                strokeWidth={1}
              />
            )
          );
        }
      })}
    </MapView>
  );
};

ClusteredMapView.defaultProps = {
  clusteringEnabled: true,
  animationEnabled: true,
  preserveClusterPressBehavior: false,
  layoutAnimationConf: LayoutAnimation.Presets.spring,
  // SuperCluster parameters
  radius: Dimensions.get("window").width * 0.06,
  maxZoom: 20,
  minZoom: 1,
  extent: 512,
  nodeSize: 64,
  // Map parameters
  edgePadding: { top: 50, left: 50, right: 50, bottom: 50 },
  // Cluster styles
  clusterColor: "#00B386",
  clusterTextColor: "#FFFFFF",
  spiderLineColor: "#FF0000",
  // Callbacks
  onRegionChangeComplete: () => {},
  onClusterPress: () => {},
  onMarkersChange: () => {},
  mapRef: () => {}
};

export default memo(ClusteredMapView);
