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
import { ItemObject, VariantGroup } from '../../types';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconAdd from '@material-ui/icons/Add.js';
import VariantEditor from '../../components/VariantEditor';
import ChangeDialog from '../ChangeDialog';

interface EditItemDialogProps {
    open: boolean,
    item?: ItemObject,
    onClose?: () => void,
    onEditItem?: (item: ItemObject, callback: () => void) => void
}

export default function EditItemDialog(props: EditItemDialogProps) {
    const { open, item, onClose, onEditItem } = props;

    // Hooks
    const classes = useStyles();

    // State
    const [itemType, setType] = useState('raw-material');
    const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
    const [showChange, setShowChange] = useState(false);

    // References
    const itemIdRef = useRef<any>();
    const itemNameRef = useRef<any>();
    const itemDescriptionRef = useRef<any>();
    const itemPriceRef = useRef<any>();
    const itemImageRef = useRef<any>();
    const refList = [itemNameRef, itemDescriptionRef, itemPriceRef, itemImageRef];

    // Effects
    useEffect(() => {
        setType(item?.type || 'raw-material');
        setVariantGroups(item?.variant_groups || []);
        setTimeout(() => {
            if (itemIdRef.current &&
                itemNameRef.current &&
                itemDescriptionRef.current &&
                itemPriceRef.current &&
                itemImageRef.current) {
                    itemIdRef.current.setValue(item?.id || '');
                    itemNameRef.current.setValue(item?.name || '');
                    itemDescriptionRef.current.setValue(item?.description || '');
                    itemPriceRef.current.setValue(item?.price.toFixed(2) || '');
                    itemImageRef.current.setValue(item?.image_url || '');
            }
        }, 0);
        // eslint-disable-next-line
    }, [open]);

    // Functions
    function handleClose() {
        if (onClose)
            onClose();
    }

    function editItem(callback: () => void) {
        if (!validateForm(refList)) {
            callback();
            return;
        }

        if (onEditItem && item) {
            const newItem: ItemObject = {
                ...item,
                type: itemType,
                name: itemNameRef.current.value(),
                description: itemDescriptionRef.current.value(),
                price: itemPriceRef.current.value(),
                image_url: itemImageRef.current.value(),
                variant_groups: variantGroups
            };
            onEditItem(newItem, callback);
        }
    }

    function createVariantGroup(name: string) {
        const group: VariantGroup = {
            name,
            description: '',
            variants: []
        };
        setVariantGroups([...variantGroups, group]);
        setShowChange(false);
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Modifying Item &mdash; <strong>{item?.name}</strong></DialogTitle>
            <div style={{ display: 'flex'}}>
                <DialogContent>
                    <DialogContentText>
                        Use this form to modify an item.
                    </DialogContentText>
                    <TextInput
                        ref={itemIdRef}
                        margin="normal"
                        fullWidth
                        inputProps={{ disabled: false, readOnly: true }}
                        name="item_id"
                        label="Item ID"/>
                    <TextInput
                        ref={itemNameRef}
                        className={classes.marginRight1}
                        margin="normal"
                        fullWidth
                        autoFocus
                        name="item"
                        label="Item Name"
                        validationRules={[validationRules.required, validationRules.validateMaxLength(100)]}/>
                    <TextInput
                        ref={itemDescriptionRef}
                        margin="normal"
                        fullWidth
                        multiline
                        rows={4}
                        name="description"
                        label="Item Description"
                        validationRules={[validationRules.required, validationRules.validateMaxLength(500)]}/>
                    <div style={{ display: 'flex' }}>
                        <FormControl style={{ flex: 2 }} className={`${classes.select} ${classes.marginRight1}`}>
                            <InputLabel id="type-label">Item Type</InputLabel>
                            <Select
                                labelId="type-label"
                                value={itemType}
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
                                <MenuItem value="raw-material">Raw Material</MenuItem>
                                <MenuItem value="assembly-part">Assembly Part</MenuItem>
                                <MenuItem value="end-product">Finished Product</MenuItem>
                            </Select>
                        </FormControl>
                        <TextInput
                            ref={itemPriceRef}
                            className={classes.marginLeft1}
                            margin="normal"
                            fullWidth
                            label="Price"
                            name="price"
                            InputProps={{
                                startAdornment: <span>$&nbsp;</span>
                            }}
                            style={{ flex: 1 }}
                            validationRules={[validationRules.required, validationRules.validateOnlyNumbers]}/>
                    </div>
                    <TextInput
                        ref={itemImageRef}
                        margin="normal"
                        fullWidth
                        autoFocus
                        name="image"
                        label="Image URL"
                        validationRules={[validationRules.required, validationRules.validateURL]}/>
                </DialogContent>
                <Box width="50%" paddingRight={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">
                            <strong>Variant Groups</strong>
                        </Typography>
                        <Button color="secondary" startIcon={<IconAdd/>} onClick={() => setShowChange(true)}>
                            Add New
                        </Button>
                    </Box>
                    <VariantEditor variantGroups={variantGroups} onChange={setVariantGroups}/>
                    <ChangeDialog open={showChange} onClose={() => setShowChange(false)} title="New Variant Group" label="Group Name" isCreation onChange={createVariantGroup}/>
                </Box>
            </div>
            <DialogActions>
                <Button onClick={handleClose} color="default">
                    Cancel
                </Button>
                <AsyncButton callback={editItem} color="primary" startIcon={<IconSave/>}>
                    Save
                </AsyncButton>
            </DialogActions>
        </Dialog>
    );
}
