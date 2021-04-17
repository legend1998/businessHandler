import React, { useRef, useState } from 'react';

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
import IconPersonAdd from '@material-ui/icons/PersonAdd';
import Dialog from '@material-ui/core/Dialog';

import useStyles from '../../assets/style/FormStyles';
import { User } from '../../types';

interface CreateUserDialogProps {
    open: boolean,
    onClose?: () => void,
    onCreateAccount?: (user: User, callback: () => void) => void
}

export default function CreateUserDialog(props: CreateUserDialogProps) {
    const { open, onClose, onCreateAccount } = props;

    // Hooks
    const classes = useStyles();

    // State
    const [type, setType] = useState('employee');

    // References
    const firstNameRef = useRef<any>();
    const lastNameRef = useRef<any>();
    const emailRef = useRef<any>();
    const refList = [firstNameRef, lastNameRef, emailRef];

    // Functions
    function handleClose() {
        if (onClose)
            onClose();
    }

    function createUserAccount(callback: () => void) {
        if (!validateForm(refList)) {
            callback();
            return;
        }

        if (onCreateAccount) {
            const user: User = {
                email: emailRef.current.value(),
                first_name: firstNameRef.current.value(),
                last_name: lastNameRef.current.value(),
                type: type
            };
            onCreateAccount(user, callback);
        }
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add New User</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Use this form to add a new user account to your business. The new user will receive an email with a temporary password which they may change once logged in.
                </DialogContentText>
                <div style={{ display: 'flex' }}>
                    <TextInput
                        ref={firstNameRef}
                        className={classes.marginRight1}
                        margin="normal"
                        fullWidth
                        autoFocus
                        name="firstName"
                        label="First Name"
                        validationRules={[
                            validationRules.required,
                            validationRules.validateOnlyLetters,
                            validationRules.validateMaxLength(50)
                        ]}/>
                    <TextInput
                        ref={lastNameRef}
                        className={classes.marginLeft1}
                        margin="normal"
                        fullWidth
                        name="lastName"
                        label="Last Name"
                        validationRules={[
                            validationRules.required,
                            validationRules.validateOnlyLetters,
                            validationRules.validateMaxLength(50)
                        ]}/>
                </div>
                <div style={{ display: 'flex' }}>
                    <TextInput
                        ref={emailRef}
                        margin="normal"
                        fullWidth
                        label="Email Address"
                        name="email"
                        style={{ flex: 2 }}
                        validationRules={[
                            validationRules.required,
                            validationRules.validateEmail,
                            validationRules.validateMaxLength(255)
                        ]}/>
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
                <AsyncButton callback={createUserAccount} color="primary" startIcon={<IconPersonAdd/>}>
                    Add User
                </AsyncButton>
            </DialogActions>
        </Dialog>
    );
}
