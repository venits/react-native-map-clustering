import React, { memo, useState, useEffect, useMemo, createRef } from "react";
import { Dimensions, LayoutAnimation, Platform } from "react-native";
import MapView from "react-native-maps";
import SuperCluster from "supercluster";
import ClusterMarker from "./ClusteredMarker";
import {
  isMarker,
  markerToGeoJSONFeature,
  calculateBBox,
  returnMapZoom
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
  preserveClusterPressBehavior,
  clusteringEnabled,
  clusterColor,
  clusterTextColor,
  layoutAnimationConf,
  animationEnabled,
  renderCluster,
  ...restProps
}) => {
  const [markers, updateMarkers] = useState([]);
  const [otherChildren, updateChildren] = useState([]);
  const [superCluster, setSuperCluster] = useState(null);
  const [currentRegion, updateRegion] = useState(
    restProps.region || restProps.initialRegion
  );
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
    updateChildren(otherChildren);
    setSuperCluster(superCluster);
  }, [children, restProps.region, restProps.initialRegion]);

  const _onRegionChangeComplete = region => {
    if (superCluster) {
      const bBox = calculateBBox(region);
      const zoom = returnMapZoom(region, bBox, minZoom);
      const markers = superCluster.getClusters(bBox, zoom);

      if (animationEnabled && Platform.OS === "ios") {
        LayoutAnimation.configureNext(layoutAnimationConf);
      }

      updateMarkers(markers);
      onRegionChangeComplete(region, markers);
      updateRegion(region);
    }
  };

  const _onClusterPress = cluster => () => {
    const children = superCluster.getLeaves(cluster.id);

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
      onRegionChangeComplete={_onRegionChangeComplete}
    >
      {markers.map(marker =>
        marker.properties.point_count === 0 ? (
          propsChildren[marker.properties.index]
        ) : renderCluster ? (
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
      )}
      {otherChildren}
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
  // Callbacks
  onRegionChangeComplete: () => {},
  onClusterPress: () => {},
  mapRef: () => {}
};

export default memo(ClusteredMapView);
