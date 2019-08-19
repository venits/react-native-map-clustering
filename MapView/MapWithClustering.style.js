import { width as w, height as h } from "react-native-dimension";

export function _clusterTextStyle(clusterTextSize, clusterTextColor) {
  return {
    fontWeight: "bold",
    color: clusterTextColor,
    fontSize: clusterTextSize
  };
}

export function _clusterStyle(
  clusterColor,
  clusterBorderColor,
  clusterBorderWidth
) {
  return {
    width: w(15),
    height: w(15),
    borderRadius: w(15),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: clusterColor,
    borderColor: clusterBorderColor,
    borderWidth: clusterBorderWidth
  };
}

export default {};
