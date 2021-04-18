import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import AsyncButton from "../../components/AsyncButton";
import IconDelete from "@material-ui/icons/Delete";
import Dialog from "@material-ui/core/Dialog";

import {ProductionRate } from "../../types";

interface onDeleteRatesProps {
  open: boolean;
  onclose: () => void;
  rates:ProductionRate[],
  onDeleteRate?:(rates:ProductionRate[],callback:()=>void)=>void
}
function DeleteRateDialog(props: onDeleteRatesProps) {
  const { open, onclose, rates, onDeleteRate } = props;

  // Functions
  function handleClose() {
    if (onclose) onclose();
  }

  function deleteTheseRates(callback: () => void) {
    if (onDeleteRate && rates) onDeleteRate(rates, callback);
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      {rates?.length === 1 ? (
        <DialogTitle>
          Deleting Item &mdash; <strong>{rates[0].item_id}</strong>
        </DialogTitle>
      ) : (
        <DialogTitle>
          Deleting &mdash; <strong>{rates?.length || 0} users</strong>
        </DialogTitle>
      )}
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete
          <strong>
            {rates?.length === 1
              ? `${rates[0].item_id}`
              : `${rates?.length} items`}
          </strong>
          ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="default">
          Cancel
        </Button>
        <AsyncButton
          callback={deleteTheseRates}
          color="primary"
          startIcon={<IconDelete />}
        >
          Delete
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteRateDialog;
