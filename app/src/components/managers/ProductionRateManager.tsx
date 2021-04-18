import React, { useEffect, useState } from "react";
import Network from "../../helpers/network";
import LoadingPage from "../LoadingPage";
import IntroPage from "../IntroPage";
import flag from "../../assets/img/flag.png";
import { ItemObject, LocationObject, ProductionRate } from "../../types";
import { makeStyles } from "@material-ui/core/styles";
import { GridColDef } from "@material-ui/data-grid";
import IconButton from "@material-ui/core/IconButton";
import IconEdit from "@material-ui/icons/Edit";
import IconDelete from "@material-ui/icons/Delete";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import { DataGrid } from "@material-ui/data-grid";
import IconAdd from "@material-ui/icons/Add";
import { useToasts } from "react-toast-notifications";
import { getItemList as updateItemList } from "../../helpers/actions";
import ModifyRateDialog from "../../dialogs/rate/ModifyRateDialog";
import CreateRateDialog from "../../dialogs/rate/CreateRateDialog";
import DeleteRateDialog from "../../dialogs/rate/DeleteRateDialog";
import { Dialog } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  header: {
    margin: theme.spacing(2, 3, 0, 3),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  marginLeft: {
    marginLeft: theme.spacing(1),
  },
  marginRight: {
    marginRight: theme.spacing(1),
  },
}));

interface OpenRateDialogProps {
  open: boolean;
  onclose: () => void;
  location: LocationObject;
}

function ProductionRateManager(props: OpenRateDialogProps) {
  const { open, onclose, location } = props;

  const classes = useStyles();
  const { addToast } = useToasts();

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(undefined);
  const [rates, setRates] = useState<any[]>([]);
  const [selection, setSelection] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRateList();
  }, [open]);

  function getRateList() {
    if(open){
      setLoading(true);
    Network.get(`/productionRate/${location?.id}`)
      .then((res) => setRates(res.data))
      .finally(() => {
        setLoading(false);
      });
    }
  }


  // Table columns
  const columns: GridColDef[] = [
    { field: "item_id", headerName: "Item Id", flex: 1 },
    {
      field: "target_amount",
      headerName: "Target Amount",
      width: 100,
    },
    { field: "produced", headerName: "Produced", width: 130 ,      valueFormatter: ({ value }) => ` ${Number(value)}`,
  },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      valueFormatter: ({ value }) => ` ${Number(value)}`,

      disableClickEventBubbling: true,
      renderCell: ({ row }) => (
        <div style={{ display: "flex" }}>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => {
              setCurrentItem(row);
              setShowEdit(true);
            }}
          >
            <IconEdit />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            className={classes.marginLeft}
            onClick={() => {
              setSelection([row as ItemObject]);
              setShowDelete(true);
            }}
          >
            <IconDelete />
          </IconButton>
        </div>
      ),
    },
  ];

  function createRatesfunc(data: ProductionRate, callback: () => void) {
    console.log(data);
    return Network.post("productionRate/create", data)
      .then((res) => {
        setRates([...rates, res.data]);
        setShowCreate(false);
        addToast("rate added", { appearance: "success", autoDismiss: true });
        updateItemList(true);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(callback);
  }

  function editRatefunc(
    data: ProductionRate, callback: () => void  ) {
    return Network.put(`productionRate/${data?.id}`, data)
      .then((res) => {
        const arr = [...rates];
        arr.splice(
          arr.findIndex((i) => i.id === data?.id),
          1,
          res.data
        );
        setRates(arr);
        setShowEdit(false);
        addToast("Item modified", { appearance: "success", autoDismiss: true });
        updateItemList(true);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(callback);
  }

  function deleteRatesfunc(items: ProductionRate[], callback: () => void) {
    const production_rate_ids = items.map((i) => i.id);
    return Network.post("/productionRate/delete-multiple", { production_rate_ids }).then(() => {
      const arr = [...rates].filter((i) => !production_rate_ids.includes(i.id));
      setSelection([]);
      setRates(arr);
      setShowDelete(false);
      addToast(`${items.length} item${items.length > 1 ? "s" : ""} deleted`, {
        appearance: "success",
        autoDismiss: true,
      });
      updateItemList(true);
    });
  }

  function handleClose() {
    if (onclose) onclose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <div>
        {loading ? (
          <LoadingPage />
        ) : rates.length === 0 ? (
          <IntroPage
            image={flag}
            description="This is where you can add, edit, and remove items."
            actionLabel="Add New Rate"
            onClickAction={() => setShowCreate(true)}
          />
        ) : (
          <div style={{ flex: 1, alignSelf: "stretch" }}>
            <div className={classes.header}>
              <Typography variant="h4" component="div">
                Production Rates
              </Typography>
              <div style={{ display: "flex" }}>
                {selection.length > 0 && (
                  <Button
                    color="primary"
                    variant="contained"
                    className={classes.marginRight}
                    onClick={() => setShowDelete(true)}
                    startIcon={<IconDelete />}
                  >
                    Delete {selection.length} item
                    {selection.length > 1 ? "s" : ""}
                  </Button>
                )}
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => setShowCreate(true)}
                  startIcon={<IconAdd />}
                >
                  Add New Rate
                </Button>
                <Button onClick={handleClose} color="default">
                  Cancel
                </Button>
              </div>
            </div>
            <Box p={3}>
              <Paper elevation={1}>
                <DataGrid
                  rows={rates}
                  columns={columns}
                  autoHeight
                  checkboxSelection
                  selectionModel={selection.map((i) => i.id)}
                  onSelectionModelChange={({ selectionModel }) =>
                    setSelection(
                      selectionModel.map((id) =>
                        rates.find((i) => i.id === id)
                      ) as ItemObject[]
                    )
                  }
                />
              </Paper>
            </Box>
          </div>
        )}

        <CreateRateDialog
          open={showCreate}
          onclose={() => setShowCreate(false)}
          onCreateRate={createRatesfunc}
        />
        <ModifyRateDialog
          open={showEdit}
          onclose={() => setShowEdit(false)}
          rate={currentItem}
          onEditRate={editRatefunc}
        />
        <DeleteRateDialog
          open={showDelete}
          onclose={() => setShowDelete(false)}
          rates={selection}
          onDeleteRate={deleteRatesfunc}
        />
      </div>
    </Dialog>
  );
}

export default ProductionRateManager;
