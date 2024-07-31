import React, { cloneElement } from "react";
import "./App.css";
import SelectableListItem from "./SelectableListItem";

import { darken, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import List from "@mui/material/List";

import PropTypes from "prop-types";

function SelectableList({ header, items, onSelect }) {
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

SelectableList.propTypes = {
  header: PropTypes.string,
  items: PropTypes.array,
  onSelect: PropTypes.func,
};

export default SelectableList;
