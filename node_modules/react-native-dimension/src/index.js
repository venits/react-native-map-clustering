import { Dimensions } from 'react-native';
import handleSize from './utils';

const myWidth = Dimensions.get('window').width;
const myHeight = Dimensions.get('window').height;

const width = num => myWidth * handleSize(num);
const height = num => myHeight * handleSize(num);
const totalSize = num => Math.sqrt((myHeight * myHeight) + (myWidth * myWidth)) * handleSize(num);

export { width, height, totalSize };
