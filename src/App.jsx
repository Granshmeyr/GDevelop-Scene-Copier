import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { invoke } from "@tauri-apps/api/core";
import { React, useState, cloneElement } from "react";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import {
  Button,
  Checkbox,
  darken,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import "./App.css";
import {
  Box,
  Stack,
  Divider,
  ListItemText,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";

function App() {
  const theme = useTheme();
  const scriptLabels = ["Copy objects", "Copy groups", "Copy layers"];

  return (
    <Box sx={{ padding: theme.spacing(3), flexGrow: 1 }}>
      <Grid container spacing={theme.spacing(2)}>
        <Grid item xs={12}>
          <Paper sx={{ padding: theme.spacing(2) }}>
            <LayoutSelector header={"From layout:"} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ padding: theme.spacing(2) }}>
            <LayoutSelector header={"To layouts:"} />
          </Paper>
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
            <Box sx={{ width: "30%" }}>
              <Button sx={{ width: "100%" }} variant="contained">
                Apply changes
              </Button>
            </Box>
            <Paper sx={{ width: "70%", padding: theme.spacing(2) }}>
              <FormGroup>
                {scriptLabels.map((label) => (
                  <FormControlLabel
                    key={label}
                    control={<Checkbox />}
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

function LayoutSelector({ header, layouts }) {
  const theme = useTheme();
  const hdr = header ? header : "Layout:";
  const lyts = layouts ? layouts : Array(20).fill("layout.json");

  return (
    <Box>
      <Typography sx={{ paddingBottom: theme.spacing(2) }} variant="h6">
        {hdr}
      </Typography>
      <Paper
        sx={{
          backgroundColor: darken(theme.palette.background.default, 0.02),
          boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.2)",
        }}
      >
        <Box sx={{ maxHeight: 180, overflow: "auto" }}>
          <List dense>
            {lyts.map((v, i) =>
              cloneElement(
                <ListItem sx={{ padding: theme.spacing(0, 1.5) }}>
                  <ListItemText primary={v} />
                </ListItem>,
                { key: i }
              )
            )}
          </List>
        </Box>
      </Paper>
    </Box>
  );
}

export default App;
