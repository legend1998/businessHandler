import React, { useEffect, useRef, useState } from 'react';

import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextInput from '../../components/TextInput';
import validationRules, { validateForm } from '../../helpers/validation';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import AsyncButton from '../../components/AsyncButton';
import IconSave from '@material-ui/icons/Save';
import Dialog from '@material-ui/core/Dialog';

import useStyles from '../../assets/style/FormStyles';
import { UserObject } from '../../types';

interface EditUserDialogProps {
    open: boolean,
    userAccount?: UserObject,
    onClose?: () => void,
    onEditAccount?: (user: UserObject, callback: () => void) => void
}

export default function EditUserDialog(props: EditUserDialogProps) {
    const { open, onClose, userAccount, onEditAccount } = props;

    // Hooks
    const classes = useStyles();

    // State
    const [type, setType] = useState('employee');

    // References
    const idRef = useRef<any>();
    const firstNameRef = useRef<any>();
    const lastNameRef = useRef<any>();
    const emailRef = useRef<any>();
    const refList = [firstNameRef, lastNameRef];

    // Effects
    useEffect(() => {
        setType(userAccount?.type || 'employee');
        setTimeout(() => {
            if (idRef.current && firstNameRef.current && lastNameRef.current && emailRef.current) {
                idRef.current.setValue(userAccount?.id || '');
                firstNameRef.current.setValue(userAccount?.first_name || '');
                lastNameRef.current.setValue(userAccount?.last_name || '');
                emailRef.current.setValue(userAccount?.email || '');
            }
        }, 0);
        // eslint-disable-next-line
    }, [open]);

    // Functions
    function handleClose() {
        if (onClose)
            onClose();
    }

    function editUserAccount(callback: () => void) {
        if (!validateForm(refList)) {
            callback();
            return;
        }

        if (onEditAccount && userAccount) {
            const user: UserObject = {
                ...userAccount,
                first_name: firstNameRef.current.value(),
                last_name: lastNameRef.current.value(),
                type: type
            };
            onEditAccount(user, callback);
        }
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Modifying User &mdash; <strong>{userAccount?.first_name} {userAccount?.last_name}</strong></DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Use this form to edit a user's account details. User emails may not be edited. The user's ID number is provided for convenience if needed.
                </DialogContentText>
                <TextInput
                    ref={idRef}
                    margin="normal"
                    fullWidth
                    inputProps={{ disabled: false, readOnly: true }}
                    name="id"
                    label="User ID"/>
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
                <div style={{ display: 'flex' }}>
                    <TextInput
                        ref={emailRef}
                        margin="normal"
                        fullWidth
                        label="Email Address"
                        name="email"
                        inputProps={{ disabled: false, readOnly: true }}
                        style={{ flex: 2 }} />
                    <FormControl style={{ flex: 1 }} className={`${classes.select} ${classes.marginLeft1}`}>
                        <InputLabel id="type-label">User Type</InputLabel>
                        <Select
                            labelId="type-label"
                            label="User Type"
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
                            <MenuItem value="employee">Employee</MenuItem>
                            <MenuItem value="manager">Manager</MenuItem>
                            <MenuItem value="admin">Administrator</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="default">
                    Cancel
                </Button>
                <AsyncButton callback={editUserAccount} color="primary" startIcon={<IconSave/>}>
                    Save
                </AsyncButton>
            </DialogActions>
        </Dialog>
    );
}
