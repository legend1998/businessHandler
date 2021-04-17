import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import AsyncButton from "../../components/AsyncButton";
import IconDelete from "@material-ui/icons/Delete";
import Dialog from "@material-ui/core/Dialog";

import { ItemObject, Rule } from "../../types";

interface onDeleteRulesProps {
  open: boolean;
  onclose: () => void;
  items:Rule[],
  onDeleteRule?:(items:Rule[],callback:()=>void)=>void
}
function DeleteRules(props: onDeleteRulesProps) {
  const { open, onclose, items, onDeleteRule } = props;

  // Functions
  function handleClose() {
    if (onclose) onclose();
  }

  function deleteTheseRules(callback: () => void) {
    if (onDeleteRule && items) onDeleteRule(items, callback);
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      {items?.length === 1 ? (
        <DialogTitle>
          Deleting Item &mdash; <strong>{items[0].name}</strong>
        </DialogTitle>
      ) : (
        <DialogTitle>
          Deleting &mdash; <strong>{items?.length || 0} users</strong>
        </DialogTitle>
      )}
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete
          <strong>
            {items?.length === 1
              ? `${items[0].name}`
              : `${items?.length} items`}
          </strong>
          ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="default">
          Cancel
        </Button>
        <AsyncButton
          callback={deleteTheseRules}
          color="primary"
          startIcon={<IconDelete />}
        >
          Delete
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteRules;
