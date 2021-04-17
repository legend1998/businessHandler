import React, { MouseEvent, useEffect, useRef } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import TextInput from '../components/TextInput';

import validationRuleList, { validateForm } from '../helpers/validation';

import Button from '@material-ui/core/Button';
import IconSave from '@material-ui/icons/Save';
import IconAdd from '@material-ui/icons/Add';

interface ChangeDialogProps {
    open: boolean,
    title: string | React.ReactNode,
    label: string,
    value?: string,
    validationRules?: ((value: string) => string | boolean | undefined)[],
    isCreation?: boolean,
    onClose?: () => void,
    onChange?: (value: string) => void
}

export default function ChangeDialog(props: ChangeDialogProps) {
    // Props
    const { open, title, label, value, validationRules, isCreation, onClose, onChange } = props;

    // Refs
    const inputRef = useRef<any>();

    // Effects
    useEffect(() => {
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.setValue(value || '');
            }
        }, 0);
        // eslint-disable-next-line
    }, [open]);

    function handleSave(event: MouseEvent) {
        event.preventDefault();
        if (!validateForm([inputRef]))
            return;

        if (onChange)
            onChange(inputRef.current.value());
    }

    return (
        <Dialog open={open} fullWidth maxWidth="xs">
            <form>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <TextInput
                        ref={inputRef}
                        margin="normal"
                        fullWidth
                        autoFocus
                        name="edit"
                        label={label}
                        validationRules={validationRules || [validationRuleList.required, validationRuleList.validateMaxLength(100)]}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="default">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} type="submit" color="primary" startIcon={isCreation ? <IconAdd/> : <IconSave/>}>
                        {isCreation ? 'Create' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )

}
