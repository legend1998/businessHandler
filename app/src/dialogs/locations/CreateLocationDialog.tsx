import React, { useRef, useState } from 'react';
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

import IconAddLocation from '@material-ui/icons/AddLocation';
import Dialog from '@material-ui/core/Dialog';

import TextInput from '../../components/TextInput';
import PhoneInput from '../../components/PhoneInput';
import AsyncButton from '../../components/AsyncButton';
import MapSelect from '../../components/MapSelect';

import validationRules, { validateForm } from '../../helpers/validation';

import useStyles from '../../assets/style/FormStyles';
import { Location } from '../../types';


interface AddLocationDialogProps {
    open: boolean,
    onClose?: () => void,
    onCreateLocation?: (location: Location, callback: () => void) => void
}

export default function CreateLocationDialog(props: AddLocationDialogProps) {
    const { open, onClose, onCreateLocation } = props;

    // Hooks
    const classes = useStyles();

    // State
    const [type, setType] = useState('store');

    // References
    const nameRef = useRef<any>();
    const addressRef = useRef<any>();
    const cityRef = useRef<any>();
    const stateRef = useRef<any>();
    const countryRef = useRef<any>();
    const postalCodeRef = useRef<any>();
    const phoneNumberRef = useRef<any>();
    const mapRef = useRef<any>();
    const refList = [nameRef, addressRef, cityRef, stateRef, countryRef, phoneNumberRef, postalCodeRef, mapRef];

    // Functions
    function handleChangePlace(place: any) {
        const name = place.id.includes('poi') ? place : undefined;
        const city = place.context.find((c: any) => c.id.includes('place'));
        const province = place.context.find((c: any) => c.id.includes('region'));
        const country = place.context.find((c: any) => c.id.includes('country'));
        const postalCode = place.id.includes('postcode') ? place : place.context.find((c: any) => c.id.includes('postcode'));
        const address = place.place_type.includes('poi') ? place.properties.address : `${place.address ? `${place.address} ` : ''}${place.text}`;
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

    function createLocation(callback: () => void) {
        if (!validateForm(refList)) {
            callback();
            return;
        }

        if (onCreateLocation) {
            const place = mapRef.current.value();
            const location: Location = {
                name: nameRef.current.value(),
                address: addressRef.current.value(),
                city: cityRef.current.value(),
                state: stateRef.current.value(),
                country: countryRef.current.value(),
                latitude: place.center[1],
                longitude: place.center[0],
                postal_code: postalCodeRef.current.value(),
                phone_number: phoneNumberRef.current.value(),
                type: type,
            };
            onCreateLocation(location, callback);
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Add New Location</DialogTitle>
            <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, paddingLeft: 24 }}>
                    <MapSelect ref={mapRef} onChangePlace={handleChangePlace}/>
                </div>
                <DialogContent style={{ flex: 1 }}>
                    <DialogContentText>
                       Use the map to find a place. You may then fill any extra information required below.
                    </DialogContentText>
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
                <AsyncButton callback={createLocation} color="primary" startIcon={<IconAddLocation/>}>
                    Add Location
                </AsyncButton>
            </DialogActions>
        </Dialog>
    );
}
