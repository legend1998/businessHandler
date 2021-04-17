import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import { DataGrid, GridColDef, GridOverlay } from '@material-ui/data-grid';

import IconButton from '@material-ui/core/IconButton';
import IconDelete from '@material-ui/icons/Delete';
import IconSave from '@material-ui/icons/Save';
import IconCheck from '@material-ui/icons/Check';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { InventoryItem, InventoryItemObject, ItemObject, VariantGroupObject, VariantObject } from '../types.js';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import ListSubheader from '@material-ui/core/ListSubheader';
import Box from '@material-ui/core/Box';
import IconAdd from '@material-ui/icons/Add';
import AsyncButton from './AsyncButton';
import { convertAmount, formatAmount } from '../helpers/filters';
import store from '../store/root';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
    marginLeft: {
        marginLeft: theme.spacing(1)
    },
    marginRight: {
        marginRight: theme.spacing(1)
    }
}));

interface InventoryEditorProps {
    open: boolean,
    title: string | React.ReactNode,
    noDialog?: boolean,
    showItemPrices?: boolean,
    readonly?: boolean,
    onClose?: () => void,
    items: InventoryItemObject[],
    currency?: string,
    itemList: ItemObject[],
    onChange?: (items: InventoryItemObject[]) => void,
    onSave?: (callback: () => void) => void
}

export default function InventoryEditor(props: InventoryEditorProps) {

    // Props
    const { open, onClose, title, items, noDialog, showItemPrices, readonly, itemList, onChange, onSave } = props;
    const businessCurrency = store.getState().auth.business.currency;
    const currency = props.currency || businessCurrency;

    // Hooks
    const classes = useStyles();

    // State
    const [selection, setSelection] = useState<InventoryItemObject[]>([]);

    // Functions
    function handleClose() {
        if (onClose)
            onClose();
    }

    function handleSave(callback: () => void) {
        if (onSave)
            onSave(callback);
        handleClose();
    }

    function setGroupSelection(itemIndex: number, variantGroupID: string, variantID: string) {
        const arr = [...items];
        arr[itemIndex].variants[variantGroupID] = variantID;
        if (onChange)
            onChange(arr);
    }

    function setItemSelection(inventoryItem: InventoryItem | InventoryItemObject, itemID: string){
        const item = itemList.find(i => i.id === itemID);
        if (!item || inventoryItem.item.id === item.id)
            return;

        inventoryItem.item = item;
        inventoryItem.variants = {};
        (item.variant_groups as VariantGroupObject[]).forEach(g => inventoryItem.variants[g.id] = (g.variants[0] as VariantObject).id)
        if (onChange)
            onChange([...items]);
    }

    function onChangeQuantity(row: InventoryItemObject, value: string) {
        row.quantity = parseInt(value.replace(/[^\d]/g, '')) || 1;
        if (onChange)
            onChange([...items]);
    }

    function onAddItem() {
        const item: InventoryItemObject = {
            id: uuid(),
            item: itemList[0],
            quantity: 1,
            variants: {}
        };
        (item.item.variant_groups as VariantGroupObject[]).forEach(g => item.variants[g.id] = (g.variants[0] as VariantObject).id);
        const arr = [...items, item];
        if (onChange)
            onChange(arr);
    }

    function onRemoveItem(inventoryItemID: string) {
        const arr = [...items];
        arr.splice(arr.findIndex(i => i.id === inventoryItemID), 1);
        if (onChange)
            onChange(arr);
    }

    function onRemoveSelection() {
        const inventoryItemIDs = selection.map(i => i.id);
        const arr = [...items].filter(i => !inventoryItemIDs.includes(i.id));
        setSelection([]);
        if (onChange)
            onChange(arr);
    }

    // Table columns
    const columns: GridColDef[] =  [
        { field: 'quantity', headerName: 'Quantity', width: 130, disableClickEventBubbling: true,
            renderCell: ({ row }) =>
                <TextField
                    fullWidth
                    variant="outlined"
                    value={row.quantity}
                    InputProps={{
                        endAdornment: <span>x</span>
                    }}
                    inputProps={{
                        style: { textAlign: 'right', paddingRight: 5 }
                    }}
                    onChange={event => onChangeQuantity(row as InventoryItemObject, String(event.target.value))}/>
        },
        { field: 'item', headerName: 'Item', width: 200,
            renderCell: ({ row }) =>
                <Select
                    fullWidth
                    style={{ height: 37 }}
                    variant="outlined"
                    value={row.item.id}
                    inputProps={{ readOnly: readonly }}
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
                    onChange={event => setItemSelection(row as InventoryItemObject, String(event.target.value))}>
                    {itemList.map(item =>
                        <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                    )}
                </Select>
        },
        { field: 'variants', headerName: 'Variants', flex: 1,
            renderCell: ({ row }) =>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {row.item.variant_groups.map((group: VariantGroupObject) =>
                        <Select
                            key={`${row.id}-${group.id}`}
                            value={row.variants[group.id]}
                            style={{ height: 37, minWidth: 100, marginRight: 10, marginTop: 5, marginBottom: 5 }}
                            variant="outlined"
                            inputProps={{ readOnly: readonly }}
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
                            onChange={event => setGroupSelection(items.indexOf(row as InventoryItemObject), group.id, String(event.target.value), )}>
                            <ListSubheader color="primary" style={{ pointerEvents: 'none', fontSize: 16 }}><strong>{group.name}</strong></ListSubheader>
                            {(group.variants as VariantObject[]).map(variant =>
                                <MenuItem key={variant.id} value={variant.id}>{variant.name}</MenuItem>
                            )}
                        </Select>
                    )}
                </div>
        },
        { field: 'actions', headerName: 'Actions', width: 100, disableClickEventBubbling: true,
            renderCell: ({ row }) =>
                <div style={{ display: 'flex' }}>
                    <IconButton size="small" color="primary" className={classes.marginLeft} onClick={() => onRemoveItem(String(row.id))}>
                        <IconDelete/>
                    </IconButton>
                </div>
        }
    ];

    if (readonly) {
        columns.splice(columns.length - 1, 1);
    }

    if (showItemPrices) {
        columns.splice(2, 0, {
            field: 'price', headerName: 'Unit Price', width: 120,
            renderCell: ({ row }) => <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <strong>{formatAmount(currency, currency !== businessCurrency ? convertAmount(currency, row.item.price) : row.item.price, true)}</strong>
            </div>
        });
    }

    const subtotal = items.reduce((total, item) => total + convertAmount(currency, item.quantity * item.item.price), 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    return (
        noDialog ?
            <div style={{ display: 'contents'}}>
                <DialogTitle>
                    <Box display="flex">
                        <Box flex={1}>{title}</Box>
                        <Box display="flex">
                            {!readonly && selection.length > 0 &&
                                <Button color="primary" variant="contained" className={classes.marginRight} onClick={onRemoveSelection} startIcon={<IconDelete/>}>
                                    Remove {selection.length} item{selection.length > 1 ? 's' : ''}
                                </Button>
                            }
                            {!readonly &&
                                <Button color="secondary" variant="contained" onClick={onAddItem} startIcon={<IconAdd/>}>
                                    Add New Item
                                </Button>
                            }
                        </Box>
                    </Box>
                </DialogTitle>
                <Box bgcolor="#fcfcfc" style={{ height: 350, width: '100%' }}>
                    <DataGrid columns={columns} rows={items} checkboxSelection={!readonly}
                              components={{
                                  NoRowsOverlay: () => <GridOverlay>No items</GridOverlay>
                              }}
                              selectionModel={selection.map(i => i.id)}
                              onSelectionModelChange={({ selectionModel }) => setSelection(selectionModel.map(id => items.find(i => i.id === id)) as InventoryItemObject[])}/>
                </Box>
                {showItemPrices &&
                    <Typography variant="body1" component="div">
                        <Box pr={3} pt={2} textAlign="left" display="flex" justifyContent="flex-end">
                            <Box textAlign="right">
                                <div>Subtotal</div>
                                <div>Tax</div>
                                <div style={{ fontSize: '1.2em', marginTop: 5 }}>Total</div>
                            </Box>
                            <Box width={150} textAlign="right" style={{ fontFamily: 'Consolas, monospace' }}>
                                <div><strong>{formatAmount(currency, subtotal, true)}</strong></div>
                                <div><strong>{formatAmount(currency, tax, true)}</strong></div>
                                <div style={{ fontSize: '1.2em', marginTop: 5 }}><strong>{formatAmount(currency, total, false)}</strong></div>
                            </Box>
                        </Box>
                    </Typography>
                }
            </div>
        :
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth style={{ zIndex: 0 }}>
                <DialogTitle>
                    <Box display="flex">
                        <Box flex={1}>{title}</Box>
                        <Box display="flex">
                            {!readonly && selection.length > 0 &&
                            <Button color="primary" variant="contained" className={classes.marginRight} onClick={onRemoveSelection} startIcon={<IconDelete/>}>
                                Remove {selection.length} item{selection.length > 1 ? 's' : ''}
                            </Button>
                            }
                            {!readonly &&
                                <Button color="secondary" variant="contained" onClick={onAddItem} startIcon={<IconAdd/>}>
                                    Add New Item
                                </Button>
                            }
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box bgcolor="#fcfcfc" style={{ height: 400, width: '100%' }}>
                        <DataGrid columns={columns} rows={items} checkboxSelection={!readonly}
                                  components={{
                                      NoRowsOverlay: () => <GridOverlay>No items</GridOverlay>
                                  }}
                                  selectionModel={selection.map(i => i.id)}
                                  onSelectionModelChange={({ selectionModel }) => setSelection(selectionModel.map(id => items.find(i => i.id === id)) as InventoryItemObject[])}/>
                    </Box>
                    {showItemPrices &&
                        <Typography variant="body1" component="div">
                            <Box pr={3} pt={2} textAlign="left" display="flex" justifyContent="flex-end">
                                <Box textAlign="right">
                                    <div>Subtotal</div>
                                    <div>Tax</div>
                                    <div style={{ fontSize: '1.2em', marginTop: 5 }}>Total</div>
                                </Box>
                                <Box width={150} textAlign="right" style={{ fontFamily: 'Consolas, monospace' }}>
                                    <div><strong>{formatAmount(currency, subtotal, true)}</strong></div>
                                    <div><strong>{formatAmount(currency, tax, true)}</strong></div>
                                    <div style={{ fontSize: '1.2em', marginTop: 5 }}><strong>{formatAmount(currency, total, false)}</strong></div>
                                </Box>
                            </Box>
                        </Typography>
                    }
                </DialogContent>
                {readonly ?
                    <DialogActions>
                        <Button onClick={handleClose} color="primary" startIcon={<IconCheck/>}>
                            OK
                        </Button>
                    </DialogActions>
                    :
                    <DialogActions>
                        <Button onClick={handleClose} color="default">
                            Cancel
                        </Button>
                        <AsyncButton callback={handleSave} color="primary" startIcon={<IconSave/>}>
                            Save
                        </AsyncButton>
                    </DialogActions>
                }
            </Dialog>
    );
}
