import React, { useRef, useState } from 'react';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

import Tabs from '@material-ui/core/Tabs';
import DialogContent from '@material-ui/core/DialogContent';
import Tab from '@material-ui/core/Tab';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconAdd from '@material-ui/icons/Add';
import DialogActions from '@material-ui/core/DialogActions';
import { createFilterOptions } from '@material-ui/lab/Autocomplete';

import PhoneInput from '../../components/PhoneInput';
import AsyncAutocomplete from '../../components/AsyncAutocomplete';
import TabPanel from '../../components/TabPanel';
import TextInput from '../../components/TextInput';
import InventoryEditor from '../../components/InventoryEditor';
import CurrencySelect from '../../components/CurrencySelect';
import AsyncButton from '../../components/AsyncButton';

import useStyles from '../../assets/style/FormStyles';
import validationRules, { validateForm } from '../../helpers/validation';
import { InventoryItemObject, ItemObject, Order } from '../../types';
import { connect } from 'react-redux';

const phoneUtil = PhoneNumberUtil.getInstance();

const filterOptions = createFilterOptions({
    matchFrom: 'any',
    stringify: (option: any) => `${option.phone_number} ${option.first_name} ${option.last_name} ${option.address} ${option.postal_code} ${option.city} ${option.state} ${option.country}`
})

interface CreateOrderDialogProps {
    open: boolean,
    itemList: ItemObject[],
    onClose?: () => void,
    onCreateOrder?: (order: Order, callback: () => void) => void
}

const mapStateToProps = (state: any) => {
    return {
        itemList: state.items
    }
};

function CreateOrderDialog(props: CreateOrderDialogProps) {

    // Props
    const { open, onClose, onCreateOrder, itemList } = props;

    // Hooks
    const classes = useStyles();

    // State
    const [customerType, setCustomerType] = useState(1);
    const [currency, setCurrency] = useState('CAD');
    const [showCustomerMissing, setShowCustomerMissing] = useState(false);
    const [showMustHaveItems, setShowMustHaveItems] = useState(false);
    const [items, setItems] = useState<InventoryItemObject[]>([]);

    // Refs
    const customerRef = useRef<any>();

    const firstNameRef = useRef<any>();
    const lastNameRef = useRef<any>();
    const emailRef = useRef<any>();
    const addressRef = useRef<any>();
    const cityRef = useRef<any>();
    const stateRef = useRef<any>();
    const countryRef = useRef<any>();
    const postalCodeRef = useRef<any>();
    const phoneNumberRef = useRef<any>();
    const refList = [firstNameRef, lastNameRef, emailRef, addressRef, cityRef, stateRef, countryRef, postalCodeRef, phoneNumberRef];

    // Functions
    function handleClose() {
        setItems([]);
        if (onClose)
            onClose();
    }

    function changeCustomerType(value: number) {
        if (value === 0) {
            setShowCustomerMissing(false);
        }
        setCustomerType(value)
    }

    function placeOrder(callback: () => void) {
        let flag = false;
        if (customerType === 0 && !validateForm(refList)) {
            flag = true;
        } else if (customerType === 1 && !customerRef.current.value()) {
            setShowCustomerMissing(true);
            flag = true;
        }
        if (items.length === 0) {
            setShowMustHaveItems(true);
            flag = true;
        }
        if (flag) {
            callback();
            return;
        } else {
            setShowCustomerMissing(false);
            setShowMustHaveItems(false);
        }

        if (onCreateOrder) {
            let order: Order;
            if (customerType === 1) {
                order = {
                    customer_id: customerRef.current.value().id,
                    currency,
                    items
                }
            } else {
                order = {
                    customer: {
                        first_name: firstNameRef.current.value(),
                        last_name: lastNameRef.current.value(),
                        email: emailRef.current.value(),
                        address: addressRef.current.value(),
                        city: cityRef.current.value(),
                        state: stateRef.current.value(),
                        country: countryRef.current.value(),
                        postal_code: postalCodeRef.current.value(),
                        phone_number: phoneNumberRef.current.value()
                    },
                    currency,
                    items
                }
            }
            onCreateOrder(order, callback);
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth style={{ zIndex: 0 }}>
            <DialogTitle>Create New Order</DialogTitle>
            <div style={{ display: 'flex' }}>
                <DialogContent style={{ flex: 1 }}>
                    <Tabs
                        value={customerType}
                        onChange={(_: any, value: number) => changeCustomerType(value)}
                        indicatorColor="secondary"
                        textColor="secondary"
                        centered>
                        <Tab label="New Customer" />
                        <Tab label="Existing Customer" />
                    </Tabs>
                    <TabPanel index={0} value={customerType}>
                        <form className={classes.form} noValidate style={{ width: '50%' }}>
                            <div style={{ display: 'flex' }}>
                                <TextInput
                                    ref={firstNameRef}
                                    className={classes.marginRight1}
                                    margin="normal"
                                    fullWidth
                                    autoFocus
                                    name="firstName"
                                    label="First Name"
                                    validationRules={[validationRules.required, validationRules.validateOnlyLetters]}/>
                                <TextInput
                                    ref={lastNameRef}
                                    className={classes.marginLeft1}
                                    margin="normal"
                                    fullWidth
                                    name="lastName"
                                    label="Last Name"
                                    validationRules={[validationRules.required, validationRules.validateOnlyLetters]}/>
                            </div>
                            <TextInput
                                ref={emailRef}
                                margin="normal"
                                fullWidth
                                label="Email Address"
                                name="email"
                                validationRules={[validationRules.required, validationRules.validateEmail]}/>
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
                            <CurrencySelect formControlProps={{ style: { width: '100%' }, className: classes.select }}
                                            value={currency}
                                            onChange={event => setCurrency(String(event.target.value))}
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
                                            }} extended />
                        </form>
                    </TabPanel>
                    <TabPanel index={1} value={customerType}>
                        <form className={classes.form} noValidate style={{ width: '40%' }}>
                            <AsyncAutocomplete style={{ width: '100%', marginTop: 20 }} ref={customerRef}
                                               idField="id" labelFormatter={(option: any) => `(${phoneUtil.format(phoneUtil.parse(option.phone_number), PhoneNumberFormat.INTERNATIONAL)}) ${String(option.first_name).toUpperCase()} ${String(option.last_name).toUpperCase()}`}
                                               labelRenderer={(option: any) =>
                                                   <div>
                                                       <div>{phoneUtil.format(phoneUtil.parse(option.phone_number), PhoneNumberFormat.INTERNATIONAL)} <strong style={{ fontSize: '1.1em'  }}>{option.first_name} {option.last_name}</strong></div>
                                                       <div style={{ fontSize: '0.9em' }}><em>{option.address}, {option.postal_code}, {option.city}, {option.state}, {option.country}</em></div>
                                                   </div>
                                               }
                                               filterOptions={filterOptions}
                                               url="/customers" debounceTime={500} inputLabel="Customer" inputPlaceholder="Search for a customer..." />
                            {showCustomerMissing &&
                                <Box color="error.main">
                                    <Typography variant="caption">Please select a customer.</Typography>
                                </Box>
                            }
                            <CurrencySelect formControlProps={{ style: { width: '100%' }, className: classes.select }}
                                            value={currency}
                                            onChange={event => setCurrency(String(event.target.value))}
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
                                            }} extended />
                        </form>
                    </TabPanel>
                    <InventoryEditor open={false} title="Order Items" items={items} onChange={setItems} itemList={itemList} currency={currency} noDialog showItemPrices/>
                    {showMustHaveItems &&
                        <Box color="error.main" textAlign="center">
                            <Typography variant="caption">Must have at least one item in the order.</Typography>
                        </Box>
                    }
                </DialogContent>
            </div>
            <DialogActions>
                <Button onClick={handleClose} color="default">
                    Cancel
                </Button>
                <AsyncButton callback={placeOrder} color="primary" startIcon={<IconAdd/>}>
                    Place Order
                </AsyncButton>
            </DialogActions>
        </Dialog>
    );
}

export default connect(mapStateToProps)(CreateOrderDialog);
