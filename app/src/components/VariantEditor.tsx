import React, { useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import IconAdd from '@material-ui/icons/Add';
import IconEdit from '@material-ui/icons/Edit';
import IconExpandMore from '@material-ui/icons/ExpandMore';
import IconDelete from '@material-ui/icons/Delete';

import { Variant, VariantGroup, VariantGroupObject, VariantObject } from '../types';

import ChangeDialog from '../dialogs/ChangeDialog';
import DeleteDialog from '../dialogs/DeleteDialog';

const Accordion = withStyles({
    root: {
        border: '1px solid rgba(0, 0, 0, .125)',
        boxShadow: 'none',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        '&$expanded': {
            margin: 'auto',
        },
    },
    expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
    root: {
        backgroundColor: 'rgba(0, 0, 0, .03)',
        borderBottom: '1px solid rgba(0, 0, 0, .125)',
        marginBottom: -1,
        minHeight: 36,
        '&$expanded': {
            minHeight: 36,
        },
    },
    content: {
        '&$expanded': {
            margin: '12px 0',
        },
    },
    expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiAccordionDetails);

const useStyles = makeStyles((theme) => ({
    variantChips: {
        display: 'flex',
        flexWrap: 'wrap',
        marginTop: theme.spacing(1),
        '& > *': {

            marginRight: theme.spacing(1),
            marginBottom: theme.spacing(1)
        }
    }
}));

interface VariantEditorProps {
    variantGroups: (VariantGroup | VariantGroupObject)[],
    onChange?: (value: (VariantGroup | VariantGroupObject)[]) => void
}

export default function VariantEditor(props: VariantEditorProps) {
    const { variantGroups, onChange } = props;

    const classes = useStyles();

    // State
    const [showChange, setShowChange] = useState(false);
    const [title, setTitle] = useState('');
    const [label, setLabel] = useState('');
    const [value, setValue] = useState('');
    const [creation, setCreation] = useState(false);
    const [status, setStatus] = useState('');
    const [currentGroup, setCurrentGroup] = useState<VariantGroup | VariantGroupObject | undefined>(undefined);
    const [currentVariant, setCurrentVariant] = useState<Variant | VariantObject | undefined>(undefined);
    const [expanded, setExpanded] = useState<number | undefined>(undefined);

    const [showDelete, setShowDelete] = useState(false);

    function showCreateVariant(group: VariantGroup | VariantGroupObject) {
        setCurrentGroup(group);
        setTitle(`${group.name} — New Variant`);
        setLabel('Variant Name');
        setCreation(true);
        setStatus('create-variant');
        setValue('');
        setShowChange(true);
    }

    function showEditVariant(group: VariantGroup | VariantGroupObject, variant: Variant | VariantObject) {
        setCurrentGroup(group);
        setCurrentVariant(variant);
        setTitle(`Modifying — ${group.name} — ${variant.name}`);
        setLabel('Variant Name');
        setCreation(false);
        setStatus('edit-variant');
        setValue(variant.name);
        setShowChange(true);
    }

    function showEditVariantGroup(group: VariantGroup | VariantGroupObject) {
        setCurrentGroup(group);
        setTitle(`Modifying — ${group.name}`);
        setLabel('Group Name');
        setCreation(false);
        setStatus('edit-group');
        setValue(group.name);
        setShowChange(true);
    }

    function showDeleteVariantGroup(group: VariantGroup | VariantGroupObject) {
        setCurrentGroup(group);
        setShowDelete(true);
    }

    function onDialogChange(value: string) {
        switch (status) {
            case 'create-variant':
                onCreateVariant(value);
                break;
            case 'edit-variant':
                onEditVariantName(value);
                break;
            case 'edit-group':
                onEditGroupName(value);
                break;
        }
        setShowChange(false);
    }

    function onCreateVariant(name: string) {
        const variant: Variant = { name };
        currentGroup?.variants.push(variant);
    }

    function onDeleteVariant(groupIndex: number, variantIndex: number) {
        const arr = JSON.parse(JSON.stringify(variantGroups));
        arr[groupIndex].variants.splice(variantIndex, 1);
        if (onChange)
            onChange(arr);
    }

    function onDeleteGroup() {
        const index = variantGroups.indexOf(currentGroup as VariantGroupObject);
        const arr = JSON.parse(JSON.stringify(variantGroups));
        arr.splice(index, 1);
        if (onChange)
            onChange(arr);
        setShowDelete(false);
    }

    function onChangeGroupDescription(groupIndex: number, description: string) {
        const arr = JSON.parse(JSON.stringify(variantGroups));
        arr[groupIndex].description = description;
        if (onChange)
            onChange(arr);
    }

    function onEditGroupName(name: string) {
        if (currentGroup)
            currentGroup.name = name;
    }

    function onEditVariantName(name: string) {
        if (currentVariant)
            currentVariant.name = name;
    }

    return (
        <Box display="flex" flexDirection="column" marginTop={2}>
            {variantGroups.length === 0 &&
                <Typography align="center" variant="body2">There are currently no variant groups for this item.</Typography>
            }
            {variantGroups.map((group, gidx) =>
                <Accordion style={{ width: '100%' }} key={`vg${gidx}`} expanded={expanded === gidx} onChange={(_: any, newExpanded: boolean) => setExpanded(newExpanded ? gidx : undefined)}>
                    <AccordionSummary expandIcon={<IconExpandMore/>}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box color="info.main" marginRight={1}>
                                <IconButton size="small" color="secondary" onClick={e => { e.stopPropagation(); showEditVariantGroup(group); }}>
                                    <IconEdit />
                                </IconButton>
                            </Box>
                            <Typography style={{ flex: 1 }}>{group.name}</Typography>
                            <Box marginRight={1}>
                                <IconButton size="small" color="primary" onClick={e => { e.stopPropagation(); showDeleteVariantGroup(group); }}>
                                    <IconDelete />
                                </IconButton>
                            </Box>
                        </div>
                    </AccordionSummary>
                    <AccordionDetails style={{ flexDirection: 'column' }}>
                        <Box marginBottom={1}>
                            <TextField
                                fullWidth
                                name="description"
                                variant="outlined"
                                label="Group Description"
                                style={{ marginTop: 0 }}
                                onChange={event => onChangeGroupDescription(gidx, event.target.value)} />
                        </Box>
                        <div className={classes.variantChips}>
                            {group.variants.map((variant, vidx) =>
                                <Chip key={`vg${gidx}v${vidx}`}
                                      label={variant.name}
                                      color="secondary"
                                      icon={<IconEdit style={{ marginLeft: 5, fontSize: '10pt' }} />}
                                      size="small"
                                      onClick={() => showEditVariant(group, variant)}
                                      onDelete={() => onDeleteVariant(gidx, vidx)}/>
                            )}
                            <Chip icon={<IconAdd/>} size="small" label="New Variant" onClick={() => showCreateVariant(group)} />
                        </div>
                    </AccordionDetails>
                </Accordion>)
            }
            <ChangeDialog open={showChange}
                          onClose={() => setShowChange(false)}
                          title={title}
                          label={label}
                          value={value}
                          isCreation={creation}
                          onChange={onDialogChange}/>
            <DeleteDialog open={showDelete}
                          onClose={() => setShowDelete(false)}
                          title={<span>Deleting — <strong>{currentGroup?.name}</strong></span>}
                          prompt={<span>Are you sure you want to remove <strong>{currentGroup?.name}</strong> from the list of variant groups for this item?</span>}
                          onConfirmDelete={onDeleteGroup}/>
        </Box>
    )
}
