import React, { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import IconSave from '@material-ui/icons/Save';
import Dialog from '@material-ui/core/Dialog';

import TextInput from '../../components/TextInput';
import PhoneInput from '../../components/PhoneInput';
import AsyncButton from '../../components/AsyncButton';
import MapSelect from '../../components/MapSelect';

import validationRules, { validateForm } from '../../helpers/validation';

import useStyles from '../../assets/style/FormStyles';
import { LocationObject } from '../../types';


interface EditLocationDialogProps {
    open: boolean,
    location?: LocationObject,
    onClose?: () => void,
    onEditLocation?: (location: LocationObject, callback: () => void) => void
}

export default function EditLocationDialog(props: EditLocationDialogProps) {
    const { open, location, onClose, onEditLocation } = props;

    // Hooks
    const classes = useStyles();

    // State
    const [type, setType] = useState('store');
    const [latLng, setLatLng] = useState<[number, number]>([0, 0]);

    // References
    const idRef = useRef<any>();
    const nameRef = useRef<any>();
    const addressRef = useRef<any>();
    const cityRef = useRef<any>();
    const stateRef = useRef<any>();
    const countryRef = useRef<any>();
    const postalCodeRef = useRef<any>();
    const phoneNumberRef = useRef<any>();
    const mapRef = useRef<any>();
    const refList = [nameRef, addressRef, cityRef, stateRef, countryRef, phoneNumberRef, postalCodeRef];

    // Effects
    useEffect(() => {
        setType(location?.type || 'store');
        setLatLng([location?.longitude || 0, location?.latitude || 0]);
        setTimeout(() => {
            if (idRef.current &&
                nameRef.current &&
                addressRef.current &&
                cityRef.current &&
                stateRef.current &&
                countryRef.current &&
                postalCodeRef.current &&
                phoneNumberRef.current) {
                idRef.current.setValue(location?.id || '');
                nameRef.current.setValue(location?.name || '');
                addressRef.current.setValue(location?.address || '');
                cityRef.current.setValue(location?.city || '');
                stateRef.current.setValue(location?.state || '');
                countryRef.current.setValue(location?.country || '');
                postalCodeRef.current.setValue(location?.postal_code || '');
                phoneNumberRef.current.setValue(location?.phone_number || '');
            }
        }, 0);
        // eslint-disable-next-line
    }, [open]);

    // Functions
    function handleChangePlace(place: any) {
        const name = place.id.includes('poi') ? place : undefined;
        const city = place.context.find((c: any) => c.id.includes('place'));
        const province = place.context.find((c: any) => c.id.includes('region'));
        const country = place.context.find((c: any) => c.id.includes('country'));
        const postalCode = place.id.includes('postcode') ? place : place.context.find((c: any) => c.id.includes('postcode'));
        const address = place.place_type.includes('poi') ? place.properties.address : `${place.address ? `${place.address} ` : ''}${place.text}`;
        setLatLng(place.center);
        addressRef.current.setValue(address);
        if (name)
            nameRef.current.setValue(name.text);
        if (city)
            cityRef.current.setValue(city.text);
        if (province)
            stateRef.current.setValue(province.text);
        if (country)
            countryRef.current.setValue(country.text);
        if (postalCode)
            postalCodeRef.current.setValue(postalCode.text);
    }

    function handleClose() {
        if (onClose)
            onClose();
    }

    function editLocation(callback: () => void) {
        if (!validateForm(refList)) {
            callback();
            return;
        }

        if (onEditLocation && location) {
            const place = mapRef.current.value();
            const newLocation: LocationObject = {
                ...location,
                name: nameRef.current.value(),
                address: addressRef.current.value(),
                city: cityRef.current.value(),
                state: stateRef.current.value(),
                country: countryRef.current.value(),
                latitude: place ? place.center[1] : latLng[1],
                longitude: place ? place.center[0] : latLng[0],
                postal_code: postalCodeRef.current.value(),
                phone_number: phoneNumberRef.current.value(),
                type: type,
            };
            onEditLocation(newLocation, callback);
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Modifying Location &mdash; <strong>{location?.name}</strong></DialogTitle>
            <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, paddingLeft: 24 }}>
                    <MapSelect ref={mapRef}
                               autoUserLocation={false}
                               defaultViewport={{
                                   latitude: latLng[1],
                                   longitude: latLng[0],
                                   zoom: 15
                               }}
                               marker={latLng}
                               onChangePlace={handleChangePlace}/>
                </div>
                <DialogContent style={{ flex: 1 }}>
                    <DialogContentText>
                        Use the map to change the location of the place you are editing. You may then fill any extra information required below. The location ID is provided for convenience if needed.
                    </DialogContentText>
                    <TextInput
                        ref={idRef}
                        margin="normal"
                        fullWidth
                        inputProps={{ disabled: false, readOnly: true }}
                        name="id"
                        label="Location ID"/>
                    <div style={{ display: 'flex' }}>
                        <TextInput
                            ref={nameRef}
                            className={classes.marginRight1}
                            margin="normal"
                            fullWidth
                            name="name"
                            style={{ flex: 2 }}
                            label="Location Name"
                            validationRules={[validationRules.required, validationRules.validateOnlyLetters]}/>
                        <FormControl style={{ flex: 1 }} className={`${classes.select} ${classes.marginLeft1}`}>
                            <InputLabel id="type-label">Location Type</InputLabel>
                            <Select
                                labelId="type-label"
                                label="Location Type"
                                value={type}
                                MenuProps={{
                                    anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left"
                                    },
                                    transformOrigin: {
                                        vertical: "top",
                                        horizontal: "left"
                                    },
                                    getContentAnchorEl: null
                                }}
                                onChange={event => setType(String(event.target.value))}>
                                <MenuItem value="supplier">Supplier</MenuItem>
                                <MenuItem value="manufacture">Manufacture</MenuItem>
                                <MenuItem value="warehouse">Warehouse</MenuItem>
                                <MenuItem value="store">Store</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <TextInput
                            ref={addressRef}
                            className={classes.marginRight1}
                            margin="normal"
                            fullWidth
                            name="address"
                            label="Address"
                            style={{ flex: 7 }}
                            validationRules={[
                                validationRules.required,
                                validationRules.validateMaxLength(200)
                            ]}/>
                        <TextInput
                            ref={cityRef}
                            className={classes.marginLeft1}
                            margin="normal"
                            fullWidth
                            label="City"
                            name="city"
                            style={{ flex: 5 }}
                            validationRules={[
                                validationRules.required,
                                validationRules.validateMaxLength(100)
                            ]}/>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <TextInput
                            ref={stateRef}
                            className={classes.marginRight1}
                            margin="normal"
                            fullWidth
                            label="State"
                            name="state"
                            style={{ flex: 1 }}
                            validationRules={[
                                validationRules.required,
                                validationRules.validateMaxLength(100)
                            ]}/>
                        <TextInput
                            ref={countryRef}
                            className={classes.marginLeft1}
                            margin="normal"
                            fullWidth
                            label="Country"
                            name="country"
                            style={{ flex: 1 }}
                            validationRules={[
                                validationRules.required,
                                validationRules.validateMaxLength(100)
                            ]}/>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <PhoneInput ref={phoneNumberRef}
                                    margin="normal"
                                    fullWidth
                                    style={{ flex: 2 }}
                                    label="Phone Number"
                                    name="phoneNumber"/>
                        <TextInput
                            ref={postalCodeRef}
                            className={classes.marginLeft1}
                            margin="normal"
                            fullWidth
                            label="Postal Code"
                            name="postalCode"
                            style={{ flex: 1 }}
                            validationRules={[
                                validationRules.required,
                                validationRules.validateMaxLength(50)
                            ]}/>
                    </div>
                </DialogContent>
            </div>
            <DialogActions>
                <Button onClick={handleClose} color="default">
                    Cancel
                </Button>
                <AsyncButton callback={editLocation} color="primary" startIcon={<IconSave/>}>
                    Save
                </AsyncButton>
            </DialogActions>
        </Dialog>
    );
}
