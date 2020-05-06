declare module "react-native-map-clustering" {
  import * as React from "react";
  import { LayoutAnimationConfig } from "react-native";
  import Map, { MapViewProps, Marker } from "react-native-maps";

  export type Cluster = {};

  interface MapClusteringProps {
    clusteringEnabled?: boolean;
    spiralEnabled?: boolean;
    animationEnabled?: boolean;
    preserveClusterPressBehavior?: boolean;
    tracksClusterViewChanges?: boolean;
    layoutAnimationConf?: LayoutAnimationConfig;
    radius?: number;
    maxZoom?: number;
    minZoom?: number;
    extent?: number;
    nodeSize?: number;
    edgePadding?: { top: number; left: number; right: number; bottom: number };
    clusterColor?: string;
    clusterTextColor?: string;
    clusterFontFamily?: string;
    spiderLineColor?: string;
    onClusterPress?: (cluster: Marker, markers?: Marker[]) => void;
    mapRef?: (ref: React.Ref<Map>) => void;
    onMarkersChange?: (markers?: Marker[]) => void;
  }

  export default class MapView extends React.Component<
    MapViewProps & MapClusteringProps,
    any
  > {}
}
