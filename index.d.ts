declare module "react-native-map-clustering" {
  import * as React from "react";
  import {LayoutAnimationConfig} from "react-native";
  import Map, {MapViewProps, Marker} from "react-native-maps";

  export type Cluster = {};

  interface MapClusteringProps {
    clusteringEnabled?: boolean;
    animationEnabled?: boolean;
    preserveClusterPressBehavior?: boolean;
    layoutAnimationConf?: LayoutAnimationConfig;
    radius?: number;
    maxZoom?: number;
    minZoom?: number;
    extent?: number;
    nodeSize?: number;
    edgePadding?: {top: number; left: number; right: number; bottom: number};
    clusterColor?: string;
    clusterTextColor?: string;
    spiderLineColor?: string;
    onClusterPress?: (cluster: Marker, markers?: Marker[]) => void;
    mapRef?: (ref: React.Ref<Map>) => void;
  }

  export default class MapView extends React.Component<
    MapViewProps & MapClusteringProps,
    any
  > {}
}
