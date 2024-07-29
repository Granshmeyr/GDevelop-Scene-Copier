import { invoke } from "@tauri-apps/api/core";
import { React, useState, cloneElement } from "react";
import "./App.css";
import {
  Button,
  Checkbox,
  darken,
  FormControlLabel,
  FormGroup,
  Box,
  ListItemText,
  Paper,
  Typography,
  useTheme,
  Grid,
  List,
  ListItem,
  alpha,
} from "@mui/material";

function App() {
  const theme = useTheme();
  const actionLables = ["Copy objects", "Copy groups", "Copy layers"];
  const [fromLayouts, setFromLayouts] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      name: `from_layout${i}.json`,
      selected: false,
    }))
  );
  const [toLayouts, setToLayouts] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      name: `to_layout${i}.json`,
      selected: false,
    }))
  );

  return (
    <Box sx={{ padding: theme.spacing(3), flexGrow: 1 }}>
      <Grid container spacing={theme.spacing(2)}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              gap: theme.spacing(2),
            }}
          >
            <Paper sx={{ flexGrow: 0.5, padding: theme.spacing(2) }}>
              <SelectableList
                items={fromLayouts}
                singleSelection
                header={"From layout:"}
                onSelect={(index) => {
                  setFromLayouts((fr) =>
                    fr.map((v, frIndex) =>
                      frIndex === index ? { ...v, selected: !v.selected } : v
                    )
                  );
                }}
              />
            </Paper>
            <Paper sx={{ flexGrow: 0.5, padding: theme.spacing(2) }}>
              <SelectableList
                items={toLayouts}
                header={"To layouts:"}
                onSelect={(index) => {
                  setToLayouts((to) =>
                    to.map((v, toIndex) =>
                      toIndex === index ? { ...v, selected: !v.selected } : v
                    )
                  );
                }}
              />
            </Paper>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              gap: theme.spacing(2),
            }}
          >
            <Box sx={{ flexGrow: 0.3 }}>
              <Button sx={{ width: "100%" }} variant="contained">
                Apply changes
              </Button>
            </Box>
            <Paper sx={{ flexGrow: 0.7, padding: theme.spacing(2) }}>
              <FormGroup>
                {actionLables.map((label) => (
                  <FormControlLabel
                    key={label}
                    control={<Checkbox defaultChecked={true} />}
                    label={label}
                  ></FormControlLabel>
                ))}
              </FormGroup>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

function SelectableList({ header, items, onSelect, singleSelection }) {
  const theme = useTheme();
  const hdr = header ? header : "Layout:";
  const itms = items
    ? items
    : Array(20).fill({ name: "layout.json", selected: false });

  return (
    <Box>
      <Typography sx={{ paddingBottom: theme.spacing(2) }} variant="h6">
        {hdr}
      </Typography>
      <Paper
        sx={{
          backgroundColor: darken(theme.palette.background.default, 0.02),
          boxShadow: `inset 0 2px 4px 0 ${alpha("#000", 0.2)}`,
        }}
      >
        <Box sx={{ maxHeight: 180, overflow: "auto" }}>
          <List dense>
            {itms.map((itm, itmIndex) =>
              cloneElement(
                <SelectableListItem
                  onClick={() => {
                    if (
                      singleSelection &&
                      itms.some((v) => v.selected) &&
                      !itms[itmIndex].selected
                    ) {
                      return;
                    }

                    onSelect?.(itmIndex);
                  }}
                  primary={itm.name}
                  selected={itms[itmIndex].selected}
                />,
                { key: itmIndex }
              )
            )}
          </List>
        </Box>
      </Paper>
    </Box>
  );
}

function SelectableListItem({ primary, selected, onClick }) {
  const theme = useTheme();
  const pri = primary ? primary : "default.json";
  const sel = selected ? selected : false;
  const selectedColor = "#A5D6A7";

  return (
    <ListItem
      sx={{
        padding: theme.spacing(0, 1.5),
        backgroundColor: sel ? selectedColor : "transparent",
        "&:hover": {
          backgroundColor: sel
            ? darken(selectedColor, 0.1)
            : alpha("#000", 0.1),
        },
      }}
      onClick={onClick}
    >
      <ListItemText primary={pri} />
    </ListItem>
  );
}

export default App;
