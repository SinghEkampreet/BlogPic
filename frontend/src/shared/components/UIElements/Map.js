import React, { useRef, useEffect } from "react";

import "./Map.css";

const Map = ({ center, zoom, className, style }) => {
  const mapRef = useRef();

  useEffect(() => {
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
    });

    new window.google.maps.Marker({ position: center, map: map });
  }, [center, zoom]);

  return <div className={`map ${className}`} style={style} ref={mapRef}></div>;
};

export default Map;
