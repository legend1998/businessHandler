import ReactMapGL, { GeolocateControl, Marker, NavigationControl } from 'react-map-gl';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { MapboxProps } from 'react-map-gl/dist/esm/mapbox/mapbox';
// @ts-ignore
import Geocoder from 'react-map-gl-geocoder';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
import 'mapbox-gl/dist/mapbox-gl.css';

import pin from '../assets/img/pin.svg';

import mapboxgl from 'mapbox-gl';

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

interface MapSelectProps extends MapboxProps {
    defaultViewport?: any,
    autoUserLocation?: boolean,
    trackUserLocation?: boolean,
    marker?: [number, number],
    onChangePlace?: (place: any) => void
}

const MapSelect = forwardRef((props: MapSelectProps, ref) => {

    // Props
    const { defaultViewport, autoUserLocation, trackUserLocation, marker, onChangePlace, ...otherProps } = props;

    // State
    const [viewport, setViewport] = useState(defaultViewport || {
        latitude: 45.596927196249666,
        longitude: -73.67971974959126,
        zoom: 8
    });
    const [place, setPlace] = useState<any>(undefined);
    const [userCoords, setUserCoords] = useState<{latitude: number, longitude: number} | undefined>(undefined);
    const [inputState, setInputState] = useState<string | undefined>(undefined);

    // Refs
    const mapRef = useRef<any>();

    // Callbacks
    const handleViewportChange = useCallback(
        (newViewport) => setViewport(newViewport),
        []
    );
    const handleResult = useCallback(
        ({ result }: { result: any }) => updateInput(result),
        // eslint-disable-next-line
        []
    );
    const handleGeolocation = useCallback(
        ({ coords } : { coords: GeolocationCoordinates }) => setUserCoords({ latitude: coords.latitude, longitude: coords.longitude }),
        []
    );

    // Functions
    function updateInput(place: any) {
        setPlace(place);
        validateInput(place);
        if (onChangePlace)
            onChangePlace(place);
    }

    function validateInput(_place: any | undefined = undefined) {
        const placeObject = _place ? _place : place;
        if (!placeObject) {
            setInputState('Please select a target place using the map search.');
            return false;
        }
        setInputState(undefined);
        return true;
    }

    function getValue() {
        return place;
    }

    function setValue(value: [number, number]) {
        setPlace(value);
    }

    // Ref properties
    useImperativeHandle(ref, () => ({
        validate: () => validateInput(),
        value: () => getValue(),
        setValue: (value: [number, number]) => setValue(value)
    }));

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ReactMapGL
                ref={mapRef}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                {...viewport}
                width="100%"
                style={{ flex: 1 }}
                attributionControl={false}
                onViewportChange={handleViewportChange}
                {...otherProps}>
                <NavigationControl style={{ bottom: 10, left: 10 }} />
                <GeolocateControl
                    positionOptions={{enableHighAccuracy: true}}
                    trackUserLocation={!!trackUserLocation}
                    onGeolocate={handleGeolocation}
                    auto={autoUserLocation !== undefined ? autoUserLocation : true}
                    style={{ bottom: 10, right: 10 }}
                />
                <Geocoder
                    mapRef={mapRef}
                    onViewportChange={handleViewportChange}
                    onResult={handleResult}
                    limit={4}
                    proximity={userCoords}
                    types="address,poi"
                    mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                    position="top-right"
                    marker={!marker}
                />
                {marker &&
                    <Marker longitude={marker[0]} latitude={marker[1]} offsetTop={-41} offsetLeft={-23.5}>
                        <img src={pin} alt="marker"/>
                    </Marker>
                }
            </ReactMapGL>
            {inputState &&
                <Box color="error.main">
                    <Typography variant="caption">{inputState}</Typography>
                </Box>
            }
        </div>
    );
});

export default MapSelect;
