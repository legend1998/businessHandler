import React, { useEffect, useRef } from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import FormControl from "@material-ui/core/FormControl";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import AsyncButton from "../../components/AsyncButton";
import IconAdd from "@material-ui/icons/Add";
import Dialog from "@material-ui/core/Dialog";
import Box from "@material-ui/core/Box";
import { DataGrid, GridColDef } from "@material-ui/data-grid";
import LoadingPage from "../../components/LoadingPage";
import { ItemObject, Rule } from "../../types";
import { Input } from "@material-ui/core";
import useStyles from "../../assets/style/FormStyles";
import Paper from "@material-ui/core/Paper";
import { useState } from "react";

interface EditRulesProps {
  open: boolean;
  onclose: () => void;
  item: any;
  onEditRule?: (
    selection: ItemObject[],
    item: Rule,
    quantity: number,
    callback: () => void
  ) => void;
}

function EditRules(props: EditRulesProps) {
  const { open, onclose, item, onEditRule } = props;

  const [loading, setLoading] = useState(false);
  const [itemList, setItemList] = useState<any[]>([]);
  const [selection, setSelection] = useState<ItemObject[]>([]);

  // Effects

  useEffect(() => getItemList(), [open]);


  function getItemList() {
    setLoading(true);
    if(item){
        var templist: any[]=[];
        item.inputs.map((i) => {
          let temp = i.item;
          templist.push({ ...temp, quantity: i?.quantity });
        });
        setItemList(templist);
        setSelection(templist);
    }
  

    setLoading(false);
  }
  // Hooks
  const classes = useStyles();


  function handleClose() {
    if (onclose) onclose();
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
    {
      field: "actions",
      headerName: "quantity",
      width: 120,
      disableClickEventBubbling: true,
      renderCell: ({ row }) => (
        <div style={{ display: "flex" }}>
          <input
            type="number"
            min="1"
            style={{ width: "80%", height: "80%" }}
            defaultValue={row?.quantity}
            onChange={(e) => (row.quantity = Number(e.target.value))}
          />
        </div>
      ),
    },
  ];

  // main editrule function
  function editRulesnow(callback: () => void) {
    
   
    if (onEditRule) {
      onEditRule(
        selection,
        item,
        item.out_quantity,
        callback
      );
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Update Rule</DialogTitle>
      <div style={{ display: "flex" }}>
        <DialogContent style={{ flex: 1 }}>
          <DialogContentText>
            Use this form to update a new rule to your rulebook.
          </DialogContentText>
          <FormControl style={{ width: "100%" }}>
            <Input value={item?.name} readOnly />
          </FormControl>

          <div>
            <input
              className={classes.marginLeft1}
              type="number"
              min="1"
              defaultValue={item?.out_quantity}
              onChange={(e)=>{item.out_quantity=e.target.value}}
              
            />
          </div>
          <Box paddingRight={3}></Box>
        </DialogContent>
        <Box width="50%" paddingRight={3}>
          {loading ? (
            <LoadingPage />
          ) : (
            <Paper elevation={1}>
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
            </Paper>
          )}
        </Box>
      </div>
      <DialogActions>
        <Button onClick={handleClose} color="default">
          Cancel
        </Button>
        <AsyncButton
          callback={editRulesnow}
          color="primary"
          startIcon={<IconAdd />}
        >
          Update
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
}

export default EditRules;
