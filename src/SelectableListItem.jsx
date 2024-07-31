import React from "react";
import "./App.css";

import { darken, alpha } from "@mui/material/styles";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import ListItem from "@mui/material/ListItem";

import PropTypes from "prop-types";

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

SelectableListItem.propTypes = {
  primary: PropTypes.string,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};

export default SelectableListItem;
