import React, { useEffect, useRef, useState } from "react";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextInput from "../../components/TextInput";
import validationRules, { validateForm } from "../../helpers/validation";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import AsyncButton from "../../components/AsyncButton";
import IconAdd from "@material-ui/icons/Add";
import Dialog from "@material-ui/core/Dialog";
import Box from "@material-ui/core/Box";

import useStyles from "../../assets/style/FormStyles";
import { ItemObject } from "../../types";
import Network from "../../helpers/network";
import Paper from "@material-ui/core/Paper";
import { DataGrid, GridColDef } from "@material-ui/data-grid";
import LoadingPage from "../../components/LoadingPage";

interface CreateRuleProps {
  open: boolean;
  onClose?: () => void;
  onCreateRule?: (
    selection: ItemObject[],
    item: ItemObject,
    quantity:number,
    callback: () => void
  ) => void;
}

export default function CreateItemDialog(props: CreateRuleProps) {
  const { open, onClose, onCreateRule } = props;

  // Hooks
  const classes = useStyles();

  // State
  const [loading, setLoading] = useState(false);
  const [SelectItem, setSelectItem] = useState<ItemObject>({} as ItemObject);
  const [itemList, setItemList] = useState<ItemObject[]>([]);
  const [selection, setSelection] = useState<ItemObject[]>([]);

  // References
  const itemQuantity = useRef<any>();
  const refList = [ itemQuantity];

  // Effects

  useEffect(() => getItemList(), [open]);

  // Functions
  function handleClose() {
    if (onClose) onClose();
  }

  function createItem(callback: () => void) {
    if (!validateForm(refList)) {
      callback();
      return;
    }

    if (onCreateRule) {
      onCreateRule(selection, SelectItem,Number(itemQuantity.current.value()), callback);
    }
  }



  function getItemList() {
    setLoading(true);
    Network.get("/items")
      .then((res) => setItemList(res.data))
      .finally(() => setLoading(false));
  }

  // Table columns
  const columns: GridColDef[] = [
    { field: "name", headerName: "Item Name", flex: 1 },
    {
      field: "price",
      headerName: "Price",
      width: 100,
      valueFormatter: ({ value }) => `$ ${Number(value).toFixed(2)}`,
    },
    { field: 'actions', headerName: 'Actions', width: 120, disableClickEventBubbling: true,
    renderCell: ({ row }) =>
        <div style={{ display: 'flex' }}>
          <input type="number" min="1"  style={{width:"80%",height:"80%"}}  value={row?.quantity} onChange={(e)=>row.quantity=Number(e.target.value)} />
        </div>
}
  ];




  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Rule</DialogTitle>
      <div style={{ display: "flex" }}>
        <DialogContent style={{ flex: 1 }}>
          <DialogContentText>
            Use this form to add a new rule to your rulebook.
          </DialogContentText>
         <FormControl style={{width:"100%"}}>
              <Select
              labelId="type-label"
             
              value={SelectItem?.id}
              onChange={event=>setSelectItem(itemList.filter((item)=>item.id===event.target.value)[0])}
              >
              {itemList.map((item,index)=><MenuItem  key={index} value={item.id} > {item.name +" $"+ item.price+ " "+item.type} </MenuItem>)}
          </Select>
         </FormControl>

          <div >
          
            <TextInput
              ref={itemQuantity}
              
              className={classes.marginLeft1}
              margin="normal"
              fullWidth
              label="Quantity"
              name="Quantity"
              InputProps={{
                startAdornment: <span>&nbsp;</span>,
              }}
              style={{ flex: 1 }}
              validationRules={[
                validationRules.required,
                validationRules.validateOnlyNumbers,
              ]}
            />
          </div>
          <Box paddingRight={3}>
            
          </Box>
        </DialogContent>
        <Box width="50%" paddingRight={3}>
          {loading?
          <LoadingPage/>
          :<Paper elevation={1}>
            <DataGrid
              rows={itemList}
              columns={columns}
              autoHeight
              checkboxSelection
              selectionModel={selection.map((i) => i.id)}
              onSelectionModelChange={({ selectionModel }) =>
                setSelection(
                  selectionModel.map((id) =>
                    itemList.find((i) => i.id === id)
                  ) as ItemObject[]
                )
              }
            />
          </Paper>}
        </Box>
      </div>
      <DialogActions>
        <Button onClick={handleClose} color="default">
          Cancel
        </Button>
        <AsyncButton
          callback={createItem}
          color="primary"
          startIcon={<IconAdd />}
        >
          Create
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
}
