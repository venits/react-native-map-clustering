# React Native Map Clustering

**Note: This is a modification to allow passing a list of markers that should not be clustered.**

This modification allows you to pass a new prop `notToCluster` with keys of markers you don't want to cluster.

## Props

| Name          | Type   | Default | Note                                                |
|---------------|--------|---------|-----------------------------------------------------|
| `notToCluster`| Array  | []      | Pass the marker keys you don't want to cluster      |

## Full Example

```jsx
import React from "react";
import MapView from "react-native-map-clustering-flex";
import { Marker } from "react-native-maps";

const INITIAL_REGION = {
  latitude: 52.5,
  longitude: 19.2,
  latitudeDelta: 8.5,
  longitudeDelta: 8.5,
};

const App = () => (
  <MapView initialRegion={INITIAL_REGION} style={{ flex: 1 }} notToCluster={['dontClusterMe','dontClusterMeToo']}>
    <Marker coordinate={{ latitude: 52.4, longitude: 18.7 }} />
    <Marker coordinate={{ latitude: 52.1, longitude: 18.4 }} />
    <Marker coordinate={{ latitude: 52.6, longitude: 18.3 }} />
    <Marker coordinate={{ latitude: 51.6, longitude: 18.0 }} />
    <Marker coordinate={{ latitude: 53.1, longitude: 18.8 }} />
    <Marker coordinate={{ latitude: 52.9, longitude: 19.4 }} />
    <Marker coordinate={{ latitude: 52.2, longitude: 21 }} />
    <Marker coordinate={{ latitude: 52.4, longitude: 21 }} />
    <Marker coordinate={{ latitude: 51.8, longitude: 20 }} />
    <Marker key={"dontClusterMe"} coordinate={{ latitude: 51.9, longitude: 21.2 }} />
    <Marker key={"dontClusterMeToo"} coordinate={{ latitude: 52.1, longitude: 21.4 }} />
  </MapView>
);

export default App;

