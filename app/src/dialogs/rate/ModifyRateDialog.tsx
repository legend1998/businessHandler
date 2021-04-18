import React, { useState, useEffect } from "react";
import Dialog from "@material-ui/core/Dialog";
import { Box, DialogTitle } from "@material-ui/core";
import {
  DialogContent,
  FormControl,
  Select,
  MenuItem,
} from "@material-ui/core";
import { DialogContentText } from "@material-ui/core";
import { ItemObject, Location, ProductionRate } from "../../types";
import Network from "../../helpers/network";
import { Button } from "react-bootstrap";
import DialogActions from "@material-ui/core/DialogActions";
import AsyncButton from "../../components/AsyncButton";
import IconAdd from "@material-ui/icons/Add";
import { useRef } from "react";
import validationRules, { validateForm } from "../../helpers/validation";
import TextInput from '../../components/TextInput';

interface CreateRateDialogProps {
  open: boolean;
  onclose: () => void;
  rate:ProductionRate,
  onEditRate: ( data:ProductionRate, callback: () => void) => void;
}

function CreateRateDialog(props: CreateRateDialogProps) {
  const { open, onclose, onEditRate ,rate} = props;

  // State
  const [loading, setLoading] = useState(false);
  const [SelectItem, setSelectItem] = useState<ItemObject>({} as ItemObject);
  const [Location, setLocation] = useState<Location>({} as Location);
  const [itemList, setItemList] = useState<ItemObject[]>([]);
  const [LocationList, setLocationList] = useState<Location[]>([]);
  const [selection, setSelection] = useState<ProductionRate[]>([]);
  const [frequency,setfrequency] = useState<any>("weekly");

  //effects

  useEffect(() => {
    getItemList();
    getLocationList();
  }, [open]);

  // references

  const useamount = useRef<any>();
  const reflist = [useamount];

  //functions

  function getItemList() {
    setLoading(true);
    Network.get("/items")
      .then((res) => setItemList(res.data))
      .finally(() => setLoading(false));
  }

  function getLocationList() {
    setLoading(true);
    Network.get("/locations")
      .then((res) => setLocationList(res.data))
      .finally(() => setLoading(false));
  }

  function handleClose() {
    if (onclose) onclose();
  }

  function editRateNow(callback:()=>void) {
    if(!validateForm(reflist)) {
      callback();
      return;
    }
    console.log("calling");

    var data:ProductionRate = {
        id:rate?.id,
      item_id : SelectItem.id,
      location_id : Location.id,
      target_amount : useamount.current.value(),
      frequency : frequency,
    };
    if(onEditRate)
    onEditRate(data,callback);
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create new Production Rate</DialogTitle>
      <div className="" style={{ display: "flex" }}>
        <DialogContent style={{ flex: 1 }}>
          <DialogContentText>
            Use this for to add new production rate
          </DialogContentText>
          <FormControl style={{ width: "100%" }}>
            <Select
              labelId="type-label"
              value={SelectItem?.id}
              onChange={(event) =>
                setSelectItem(
                  itemList.filter((item) => item.id === event.target.value)[0]
                )
              }
            >
              {itemList.map((item, index) => (
                <MenuItem key={index} value={item.id}>
                  {item + " $" + item.price + " " + item.type}
                </MenuItem>
              ))}
            </Select>
           
             <TextInput
              ref={useamount}
              fullWidth
              label="Target Amount"
              name="target_amount"
              InputProps={{
                startAdornment: <span>&nbsp;</span>,
              }}
              style={{ flex: 1 }}
              validationRules={[
                validationRules.required,
                validationRules.validateOnlyNumbers,
              ]}
            />
          
            <Select 
            defaultValue={frequency}
            onChange={(e)=>setfrequency(e.target.value)}
            >
              <MenuItem value="daily" defaultChecked > daily</MenuItem>
              <MenuItem value="weekly"> weekly</MenuItem>
              <MenuItem value="bi-weekly"> bi-weekly</MenuItem>
              <MenuItem value="monthly"> monthly</MenuItem>
              <MenuItem value="annually">  annually</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <Box width="50%" paddingRight={3}>
          <Select
            style={{ width: "100%" }}
            value={Location?.phone_number}
            onChange={(e) =>
              setLocation(
                LocationList.filter(
                  (location) => location.phone_number === e.target.value
                )[0]
              )
            }
          >
            {LocationList.map((location, index) => (
              <MenuItem key={index} value={location.phone_number}>
                {location.name +
                  " " +
                  location.city +
                  " " +
                  location.country +
                  " " +
                  location.postal_code}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </div>
      <DialogActions>
        <Button onClick={handleClose} color="default">
          Cancel
        </Button>
        <AsyncButton
          callback={editRateNow}
          color="primary"
          startIcon={<IconAdd />}
        >
          Create
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
}

export default CreateRateDialog;
