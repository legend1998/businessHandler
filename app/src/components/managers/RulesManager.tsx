import React, { useEffect, useState } from "react";
import Network from "../../helpers/network";
import LoadingPage from "../LoadingPage";
import IntroPage from "../IntroPage";
import flag from "../../assets/img/flag.png";
import { ItemObject, Rule } from "../../types";
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
import CreateRules from "../../dialogs/rules/CreateRules";
import { useToasts } from "react-toast-notifications";
import { getItemList as updateItemList } from "../../helpers/actions";
import EditRules from "../../dialogs/rules/EditRules";
import DeleteRules from "../../dialogs/rules/DeleteRules";

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

function RulesManager() {
  const classes = useStyles();
  const { addToast } = useToasts();

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(undefined);
  const [rules, setRulesList] = useState<any[]>([]);
  const [selection, setSelection] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRulesList();
  }, []);

  function getRulesList() {
    setLoading(true);
    Network.get("/rules")
      .then((res) => setRulesList(res.data))
      .finally(() => {
        setLoading(false);
        console.log(rules, loading);
      });
  }

  // Table columns
  const columns: GridColDef[] = [
    { field: "name", headerName: "Item Name", flex: 1 },
    {
      field: "out_quantity",
      headerName: "Quantity",
      width: 100,
      valueFormatter: ({ value }) => ` ${Number(value).toFixed(2)}`,
    },
    { field: "type", headerName: "Type", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
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

  function createRulesnow(
    selection: ItemObject[],
    item: ItemObject,
    quantity: number,
    callback: () => void
  ) {
    const data = {
      name: item.name,
      quantity: quantity,
      input_items: selection,
      item_id: item.id,
      out_item_variant: item.variant_groups.map((variant) => {
        return { variant: variant.name };
      }),
    };
    console.log(data);
    return Network.post("rules/create", data)
      .then((res) => {
        setRulesList([...rules, res.data]);
        console.log(res.data);
        setShowCreate(false);
        addToast("Item added", { appearance: "success", autoDismiss: true });
        updateItemList(true);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(callback);
  }

  function EditRulesfunc(
    selection: ItemObject[],
    item: Rule,
    quantity: number,
    callback: () => void
  ) {
    const data = {
      name: item.name,
      quantity: quantity,
      input_items: selection,
      item_id: item.out_item_id,
      item_variant_id: item.out_item_variants,
    };
    console.log(data);
    return Network.put(`rules/${item.id}`, data)
      .then((res) => {
        const arr = [...rules];
        arr.splice(
          arr.findIndex((i) => i.id === item.id),
          1,
          res.data
        );
        setRulesList(arr);
        setShowEdit(false);
        addToast("Item modified", { appearance: "success", autoDismiss: true });
        updateItemList(true);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(callback);
  }

  function deleteRules(items: Rule[], callback: () => void) {
    const rule_ids = items.map((i) => i.id);
    return Network.post("/rules/delete-multiple", { rule_ids }).then(()=>{
        const arr = [...rules].filter(i=>!rule_ids.includes(i.id));
        setSelection([]);
        setRulesList(arr);
        setShowDelete(false);
        addToast(`${items.length} item${items.length > 1 ? 's' : ''} deleted`, { appearance: 'success', autoDismiss: true });
        updateItemList(true);
    });
  }

  return (
    <div style={{ display: "contents" }}>
      {loading ? (
        <LoadingPage />
      ) : rules.length === 0 ? (
        <IntroPage
          image={flag}
          description="This is where you can add, edit, and remove items."
          actionLabel="Add New Rule"
          onClickAction={() => setShowCreate(true)}
        />
      ) : (
        <div style={{ flex: 1, alignSelf: "stretch" }}>
          <div className={classes.header}>
            <Typography variant="h4" component="div">
             Assembly  Rules
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
                Add New Rule
              </Button>
            </div>
          </div>
          <Box p={3}>
            <Paper elevation={1}>
              <DataGrid
                rows={rules}
                columns={columns}
                autoHeight
                checkboxSelection
                selectionModel={selection.map((i) => i.id)}
                onSelectionModelChange={({ selectionModel }) =>
                  setSelection(
                    selectionModel.map((id) =>
                      rules.find((i) => i.id === id)
                    ) as ItemObject[]
                  )
                }
              />
            </Paper>
          </Box>
        </div>
      )}

      <CreateRules
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreateRule={createRulesnow}
      />
      <EditRules
        open={showEdit}
        onclose={() => setShowEdit(false)}
        item={currentItem}
        onEditRule={EditRulesfunc}
      />
      <DeleteRules
        open={showDelete}
        onclose={() => setShowDelete(false)}
        items={selection}
        onDeleteRule={deleteRules}
      />
    </div>
  );
}

export default RulesManager;
