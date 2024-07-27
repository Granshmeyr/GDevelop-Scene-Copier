import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { invoke } from "@tauri-apps/api/core";
import { React, useState, cloneElement } from "react";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { darken } from "@mui/material";

import "./App.css";
import { Box, Divider, ListItemText, Paper, Typography } from "@mui/material";

function generateFileList(strings) {
  return (
    <List dense>
      {strings.map((v, i) =>
        cloneElement(
          <ListItem
            sx={(theme) => ({
              padding: theme.spacing(0, 1.5),
            })}
          >
            <ListItemText primary={v} />
          </ListItem>,
          { key: i }
        )
      )}
    </List>
  );
}

function App() {
  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing(3),
        flexGrow: 1,
      })}
    >
      <Paper>
        <Grid sx={(theme) => ({ padding: theme.spacing(2) })}>
          <Grid item xs={12}>
            <Box>
              <Typography
                sx={(theme) => ({ paddingBottom: theme.spacing(2) })}
                variant="h6"
              >
                From folder:
              </Typography>
              <Divider />
              <Paper
                sx={(theme) => ({
                  backgroundColor: darken(
                    theme.palette.background.default,
                    0.02
                  ),
                  boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.2)",
                })}
              >
                {generateFileList(Array(6).fill("file.txt"))}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default App;
