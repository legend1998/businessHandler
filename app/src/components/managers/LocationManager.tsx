import React, { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications'
import moment from 'moment'

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import IconAdd from '@material-ui/icons/Add';
import IconEdit from '@material-ui/icons/Edit';
import IconDelete from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import makeStyles from '@material-ui/core/styles/makeStyles';

import IntroPage from '../IntroPage';
import LoadingPage from '../LoadingPage';
import CreateLocationDialog from '../../dialogs/locations/CreateLocationDialog';
import EditLocationDialog from '../../dialogs/locations/EditLocationDialog';
import DeleteLocationDialog from '../../dialogs/locations/DeleteLocationDialog';

import Network from '../../helpers/network';
import { Location, LocationObject } from '../../types';

import map from '../../assets/img/map.png';


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

export default function LocationManager() {
    const classes = useStyles();
    const { addToast } = useToasts();

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<LocationObject | undefined>(undefined);
    const [locationList, setLocationList] = useState<LocationObject[]>([]);
    const [selection, setSelection] = useState<LocationObject[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(getLocationList, []);
    useEffect(() => {}, []);

    const columns: GridColDef[] =  [
        { field: 'name', headerName: 'Name', width: 130 },
        { field: 'address', headerName: 'Address', flex: 1 },
        { field: 'postal_code', headerName: 'Postal Code', width: 150 },
        { field: 'type', headerName: 'Type', width: 100 },
        { field: 'created_at', headerName: 'Created', width: 200, valueFormatter: ({ value }) => moment(String(value)).format('LLL') },
        { field: 'actions', headerName: 'Actions', width: 120,
            renderCell: ({ row }) =>
                <div style={{ display: 'flex' }}>
                    <IconButton size="small" color="secondary" onClick={() => { setCurrentLocation(row as LocationObject); setShowEdit(true); }}>
                        <IconEdit/>
                    </IconButton>
                    <IconButton size="small" color="primary" className={classes.marginLeft} onClick={() => { setSelection([row as LocationObject]); setShowDelete(true); }}>
                        <IconDelete/>
                    </IconButton>
                </div>
        }
    ];

    function createLocation(location: Location, callback: () => void) {
        return Network.post('/locations/create', location)
            .then(res => {
                setLocationList([...locationList, res.data]);
                setShowAdd(false);
                addToast('New location added', { appearance: 'success', autoDismiss: true });
            })
            .finally(callback);
    }

    function editLocation(location: LocationObject, callback: () => void) {
        return Network.put(`/locations/${location.id}`, location)
            .then(res => {
                const arr = [...locationList];
                arr.splice(arr.findIndex(l => l.id === location.id), 1, res.data);
                setLocationList(arr);
                setShowEdit(false);
                addToast('Location modified', { appearance: 'success', autoDismiss: true });
            })
            .finally(callback);
    }

    function deleteLocations(locations: LocationObject[], callback: () => void) {
        const location_ids = locations.map(l => l.id);
        return Network.post(`/locations/delete-multiple`, { location_ids })
            .then(_ => {
                const arr = [...locationList].filter(l => !location_ids.includes(l.id));
                setSelection([]);
                setLocationList(arr);
                setShowDelete(false);
                addToast(`${locations.length} location${locations.length > 1 ? 's' : ''} deleted`, { appearance: 'success', autoDismiss: true });
            })
            .finally(callback);
    }
    
    function getLocationList() {
        setLoading(true);
        Network.get('/locations')
            .then(res => setLocationList(res.data))
            .finally(() => setLoading(false));
    }

    return (
        <div style={{ display: 'contents' }}>
            {
                loading ?
                    <LoadingPage/>
                :
                locationList.length === 0 ?
                     <IntroPage image={map} description="This is where you can add, edit and remove warehouse and store locations." actionLabel="Add a Location" onClickAction={() => setShowAdd(true)}/>
                :
                    <div style={{ flex: 1, alignSelf: 'stretch' }}>
                        <div className={classes.header}>
                            <Typography variant="h4" component="div">
                                Locations
                            </Typography>
                            <div style={{ display: 'flex' }}>
                                {selection.length > 0 &&
                                    <Button color="primary" variant="contained" className={classes.marginRight} onClick={() => setShowDelete(true)} startIcon={<IconDelete/>}>
                                        Delete {selection.length} item{selection.length > 1 ? 's' : ''}
                                    </Button>
                                }
                                <Button color="secondary" variant="contained" onClick={() => setShowAdd(true)} startIcon={<IconAdd/>}>
                                    Add New Location
                                </Button>
                            </div>
                        </div>
                        <Box p={3}>
                            <Paper elevation={1}>
                                <DataGrid rows={locationList} columns={columns} autoHeight checkboxSelection
                                          selectionModel={selection.map(l => l.id)}
                                          onSelectionModelChange={({selectionModel}) => setSelection(selectionModel.map(id => locationList.find(l => l.id === id)) as LocationObject[])} />
                            </Paper>
                        </Box>
                    </div>
            }
            <CreateLocationDialog open={showAdd} onClose={() => setShowAdd(false)} onCreateLocation={createLocation}/>
            <EditLocationDialog open={showEdit} onClose={() => setShowEdit(false)} location={currentLocation} onEditLocation={editLocation}/>
            <DeleteLocationDialog open={showDelete} onClose={() => setShowDelete(false)} locations={selection} onDeleteLocations={deleteLocations}/>
        </div>
    );
}
