import { BaseDirectory, readDir } from "@tauri-apps/plugin-fs";
import React, { useState, cloneElement, useEffect, useCallback } from "react";
import "./App.css";
import useDisableRightClick from "./useDisableRightClick";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { darken, alpha } from "@mui/material/styles";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Box from "@mui/material/Box";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

import Grid from "@mui/material/Unstable_Grid2";

function App() {
  const theme = useTheme();
  const actionLables = ["Copy objects", "Copy groups", "Copy layers"];
  const [fromLayouts, setFromLayouts] = useState([]);
  const [toLayouts, setToLayouts] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const data = await readDir("test", {
        baseDir: BaseDirectory.Download,
      });

      setFromLayouts(
        data
          .map((v) =>
            v.isFile ? { name: v.name, selected: false } : undefined
          )
          .filter((v) => v != undefined)
      );
      setToLayouts(
        data
          .map((v) =>
            v.isFile ? { name: v.name, selected: false } : undefined
          )
          .filter((v) => v != undefined)
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useDisableRightClick();
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Box
      sx={{
        padding: theme.spacing(3),
        height: "100svh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Grid
        container
        spacing={theme.spacing(2)}
        sx={{
          flexGrow: 1,
          minHeight: 0,
        }}
      >
        <Grid xs={12} sx={{ height: "70%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "100%",
              gap: theme.spacing(2),
            }}
          >
            <Paper
              sx={{
                flexGrow: 1,
                padding: theme.spacing(2),
                display: "flex",
                flexDirection: "column",
              }}
            >
              <SelectableList
                items={fromLayouts}
                header={"From layout:"}
                onSelect={(index) => {
                  setFromLayouts((fr) =>
                    fr.map((v, frIndex) => ({
                      ...v,
                      selected: frIndex === index,
                    }))
                  );
                }}
              />
            </Paper>
            <Paper
              sx={{
                flexGrow: 1,
                padding: theme.spacing(2),
                display: "flex",
                flexDirection: "column",
              }}
            >
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
        <Grid xs={12} sx={{ height: "30%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "100%",
              gap: theme.spacing(2),
            }}
          >
            <Box sx={{ flexGrow: 0.3 }}>
              <Button
                sx={{ width: "100%", height: "100%" }}
                variant="contained"
              >
                Apply changes
              </Button>
            </Box>
            <Paper
              sx={{
                flexGrow: 0.7,
                padding: theme.spacing(2),
                overflow: "auto",
              }}
            >
              <FormGroup row>
                {actionLables.map((label) => (
                  <FormControlLabel
                    key={label}
                    control={<Checkbox size="small" defaultChecked={true} />}
                    label={<Typography variant="body2">{label}</Typography>}
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
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Typography sx={{ paddingBottom: theme.spacing(2) }} variant="h6">
        {hdr}
      </Typography>
      <Paper
        sx={{
          backgroundColor: darken(theme.palette.background.default, 0.02),
          boxShadow: `inset 0 2px 4px 0 ${alpha("#000", 0.2)}`,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            overflow: "auto",
            flexGrow: 1,
          }}
        >
          <List dense>
            {itms.map((itm, itmIndex) =>
              cloneElement(
                <SelectableListItem
                  onClick={() => {
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
