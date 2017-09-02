# React-Native-Map-Clustering

Simple module that adds map clustering for both iOS and Android.

# Pre requirements:

  - Install 'react-native-maps' module. You can find all information here:
 https://github.com/airbnb/react-native-maps

In general all you have to do to start:

```sh
npm install react-native-maps --save
react-native link react-native-maps
```
  - Minimum versions you need for this module:
        react: >=15.4.0
        react-native >=0.40
        react-native-maps >=0.15.0

### Installation
All you have to do:
```sh
npm install react-native-map-clustering --save
```
### Usage

Usage is very simple:
1. Import MapView
```javascript
import MapView from 'react-native-map-clustering';
```
- Import Marker
```javascript
import Marker from 'react-native-maps';
```
2. Add this to your render method (you can put your own markers and region):
```javascript
<MapView
    region={{latitude: 52.5, longitude: 19.2,
             latitudeDelta: 8.5, longitudeDelta: 8.5}}
    style={{width: mapWidth, height: mapHeight}}>
    <Marker coordinate={{latitude: 52.0, longitude: 18.2}} />
    <Marker coordinate={{latitude: 52.4, longitude: 18.7}} />
    <Marker coordinate={{latitude: 52.1, longitude: 18.4}} />
    <Marker coordinate={{latitude: 52.6, longitude: 18.3}} />
    <Marker coordinate={{latitude: 51.6, longitude: 18.0}} />
    <Marker coordinate={{latitude: 53.1, longitude: 18.8}} />
    <Marker coordinate={{latitude: 52.9, longitude: 19.4}} />
</MapView>
```
3. **That's all!**.

### Demo
![Alt Text](https://raw.githubusercontent.com/venits/react-native-map-clustering/master/demo.gif)

### Extra props to control your clustering
----
| Name               | Type   | Default | Note                                                           |
|--------------------|--------|---------|----------------------------------------------------------------|
| clustering         | bool   | true    | Set true to enable and false to disable clustering.            |
| clusterColor       | String | #F5F5F5 | Background color of cluster.                                         |
| clusterTextColor   | String | #FF5252 | Color of text in cluster.                                      |
| clusterBorderColor | String | #FF5252 | Color of border. Set to transparent if you don't want borders. |
| clusterBorderWidth | Int    | 1       | Width of border. Set to 0 if you don't want borders.           |

Example of using props:
```javascript
<MapView
    clustering = {true}
    clusterColor = '#000'
    clusterTextColor = '#fff' 
    clusterBorderColor = '#fff'
    clusterBorderWidth = {4}
    region={{latitude: 52.5, longitude: 19.2,
             latitudeDelta: 8.5, longitudeDelta: 8.5}}
    style={{width: mapWidth, height: mapHeight}}>
</MapView>
```

### Some important notes!

**1. Use MapView as you would normally use MapView from react-native-maps (you can use all props). Same for markers.**

**2. Make sure not to put other views than markers to MapView.**
```javascript
<MapView>
    {this.state.markers}
    <Text>Do not do that</Text>
</MapView>
```

**3. Is you pass array of markers make sure it is [] not Set.**

**4.** Module overwrites **onRegionChangeComplete** prop so you will not be able to use it.

**5. Module takes care of region change so you don't have to store region in your component state.**

### Support and donations ;)

If you need help or more customize solution email me: tomasz.przybyl.it@gmail.com

**I am student so any donations will help me to create more cool modules ;)
Thanks for any donations, have a great day and Happy Coding ;)**

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XN8LRKQRBZJ86)


License
----
MIT
