import React, { useCallback, useEffect, useState } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import { useToasts } from 'react-toast-notifications';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import IconFormatListNumbered from '@material-ui/icons/FormatListNumbered';
import makeStyles from '@material-ui/core/styles/makeStyles';

import IntroPage from '../IntroPage';

import Network from '../../helpers/network';
import { InventoryItemObject, LocationObject } from '../../types';

import warehouse from '../../assets/img/warehouse.png';
import pin from '../../assets/img/pin.svg';
import AsyncButton from '../AsyncButton';
import InventoryEditor from '../InventoryEditor';
import store from '../../store/root';
import LoadingPage from '../LoadingPage';

const useStyles = makeStyles(theme => ({
    header: {
        margin: theme.spacing(2, 3, 0, 3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    marginLeft: {
        marginLeft: theme.spacing(1)
    },
    marginRight: {
        marginRight: theme.spacing(1)
    }
}));

export default function InventoryManager() {
    const classes = useStyles();

    // State
    const [currentLocation, setCurrentLocation] = useState<LocationObject | undefined>(undefined);
    const [currentLocationInventory, setCurrentLocationInventory] = useState<InventoryItemObject[]>([]);
    const [openInventory, setOpenInventory] = useState(false);
    const [locationList, setLocationList] = useState<LocationObject[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewport, setViewport] = useState({
        latitude: 45.596927196249666,
        longitude: -73.67971974959126,
        zoom: 8
    });

    // Callbacks
    const handleViewportChange = useCallback(
        (newViewport) => setViewport(newViewport),
        []
    );

    const { addToast } = useToasts();

    // Effects
    useEffect(onMounted, []);

    function onMounted() {
        setLoading(true);
        getLocationList()
            .finally(getItemList)
            .finally(() => setLoading(false));
    }

    function getLocationList() {
        return Network.get('/locations')
            .then(res => setLocationList(res.data));
    }

    function getItemList() {
        if (store.getState().items.length === 0)
            return Network.get('/items')
                .then(res => store.dispatch({ type: 'setItems', payload: res.data }));
        return Promise.resolve();
    }

    function getInventory(locationID: string, callback: () => void) {
        return Network.get(`/locations/${locationID}/inventory`)
            .then(res => {
                setCurrentLocationInventory(res.data);
                setOpenInventory(true);
            })
            .finally(callback);
    }

    function saveInventory(callback: () => void) {
        return Network.put(`/locations/${currentLocation?.id}/inventory`, currentLocationInventory.map(i => ({ item_id: i.item.id, quantity: i.quantity, variants: i.variants })))
            .then(_ => {
                setOpenInventory(false);
                addToast('Inventory updated', { appearance: 'success', autoDismiss: true });
            })
            .finally(callback);
    }

    return (
        <div style={{ display: 'contents' }}>
            {
                loading ?
                    <LoadingPage/>
                :
                locationList.length === 0 ?
                    <IntroPage image={warehouse} description="This is where you can add, edit and remove warehouse and store locations." actionLabel="Add a Location" onClickAction={() => {}}/>
                :
                    <div style={{ flex: 1, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                        <div className={classes.header}>
                            <Typography variant="h4" component="div">
                                Select a Location
                            </Typography>
                        </div>
                        <Box flex={1} p={3}>
                            <Paper style={{ height: '100%', width: '100%' }} elevation={4}>
                                <ReactMapGL mapStyle="mapbox://styles/mapbox/streets-v9"
                                            {...viewport}
                                            width="100%"
                                            height="100%"
                                            attributionControl={false}
                                            onViewportChange={handleViewportChange}>
                                    {locationList.map((l, index) =>
                                        <Marker key={`m${index}`} latitude={l.latitude} longitude={l.longitude} offsetTop={-41} offsetLeft={-23.5}>
                                            <img src={pin} alt="marker" style={{ cursor: 'pointer' }} onClick={() => setCurrentLocation(l)}/>
                                        </Marker>
                                    )}
                                    {currentLocation &&
                                        <Popup latitude={currentLocation.latitude} longitude={currentLocation.longitude}
                                               offsetLeft={-10} offsetTop={-35} closeOnClick={false}
                                               onClose={() => setCurrentLocation(undefined)}>
                                            <Box marginRight={2}>
                                                <Typography variant="body1" component="div"><strong>{currentLocation.name}</strong></Typography>
                                                <Typography variant="body2" component="div">{currentLocation.address},</Typography>
                                                <div>
                                                    <Typography variant="body2" component="span">{currentLocation.postal_code},&nbsp;</Typography>
                                                    <Typography variant="body2" component="span">{currentLocation.city},&nbsp;</Typography>
                                                    <Typography variant="body2" component="span">{currentLocation.state},&nbsp;</Typography>
                                                    <Typography variant="body2" component="span">{currentLocation.country}</Typography>
                                                </div>
                                                <Box textAlign="right" marginTop={1}>
                                                    <AsyncButton size="small" variant="outlined" color="secondary"
                                                                 startIcon={<IconFormatListNumbered />}
                                                                 callback={(callback) => getInventory(currentLocation?.id, callback)}>
                                                        Inventory
                                                    </AsyncButton>
                                                </Box>
                                            </Box>
                                        </Popup>
                                    }
                                </ReactMapGL>
                            </Paper>
                        </Box>
                    </div>
            }
            <InventoryEditor open={openInventory}
                             onClose={() => setOpenInventory(false)}
                             title={`${currentLocation?.name} — Inventory`}
                             items={currentLocationInventory}
                             itemList={store.getState().items}
                             onChange={setCurrentLocationInventory}
                             onSave={saveInventory}/>
        </div>
    );
}
