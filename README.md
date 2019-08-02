
# React Native Map Clustering

React Native module that handles map clustering for you.
Works with **Expo** and **react-native-cli**.

### Installation
```js
// only if you haven't installed it before
npm install react-native-maps --save
//
npm install react-native-map-clustering --save
```
### Usage

1. Import Components
```javascript
import MapView from 'react-native-map-clustering';
import { Marker } from 'react-native-maps';
```

2. In **render()** method add this:

```javascript
<MapView  
  region={{  
    latitude: 52.5,  
    longitude: 19.2,  
    latitudeDelta: 8.5,  
    longitudeDelta: 8.5  
  }}  
  style={{ width: 400, height: 800 }}  
>  
  <Marker coordinate={{ latitude: 52.0, longitude: 18.2 }} />  
  <Marker coordinate={{ latitude: 52.4, longitude: 18.7 }} />  
  <Marker coordinate={{ latitude: 52.1, longitude: 18.4 }} />  
  <Marker coordinate={{ latitude: 52.6, longitude: 18.3 }} />  
  <Marker coordinate={{ latitude: 51.6, longitude: 18.0 }} />  
  <Marker coordinate={{ latitude: 53.1, longitude: 18.8 }} />  
  <Marker coordinate={{ latitude: 52.9, longitude: 19.4 }} />  
  <Marker coordinate={{ latitude: 52.2, longitude: 21 }} />  
</MapView>
```

### Demo
![Alt Text](https://raw.githubusercontent.com/venits/react-native-map-clustering/master/demo.gif)


## MapView
----
| Name               | Type   | Default | Note                                                           |
|--------------------|--------|---------|----------------------------------------------------------------|
| clustering         | bool   | true    | Set true to enable and false to disable clustering.            |
| clusterColor       | String | #F5F5F5 | Background color of cluster.                                         |
| clusterTextColor   | String | #FF5252 | Color of text in cluster.                                      |
| clusterBorderColor | String | #FF5252 | Color of border. Set to transparent if you don't want borders. |
| clusterBorderWidth | Int    | 1       | Width of border. Set to 0 if you don't want borders.           |
| customDefinedMarker | Marker   | null       | Define a custom react component that is used to render the cluster markers.      |
| onClusterPress | Function    | null       | Allows you to control cluster on click event.  Function returns coordinate of cluster.         |

## Marker
----
| Name               | Type   | Default | Note                                                           |
|--------------------|--------|---------|----------------------------------------------------------------|
| cluster            | bool   | null    | Set false to disable clustering for current marker.            |

Example of using props:
```javascript
<MapView
    clusterColor = '#000'
    clusterTextColor = '#fff'
    clusterBorderColor = '#fff'
    clusterBorderWidth = {4}
    style={{width: 400, height: 800}}
    region={{latitude: 52.5, longitude: 19.2,
             latitudeDelta: 8.5, longitudeDelta: 8.5}}
>
    <Marker
      coordinate={{latitude: 52, longitude: 19}}
      cluster={false}
    />
	<Marker coordinate={{latitude: 52, longitude: 19}} />
</MapView>
```


