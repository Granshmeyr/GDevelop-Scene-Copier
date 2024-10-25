import {
  BaseDirectory,
  mkdir,
  exists,
  writeTextFile,
  readTextFile,
  rename,
  copyFile,
} from "@tauri-apps/plugin-fs";
import { appDataDir } from "@tauri-apps/api/path";
import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import useDisableRightClick from "./useDisableRightClick";
import copyGroups from "./copyGroups";
import copyLayers from "./copyLayers";
import copyObjects from "./copyObjects";
import SelectableList from "./SelectableList";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import Grid from "@mui/material/Unstable_Grid2";

// eslint-disable-next-line no-unused-vars, unused-imports/no-unused-imports
import * as Types from "./type";

function App() {
  const initialOptionState = true;
  const theme = useTheme();
  const [scriptOptions, setScriptOptions] = useState(
    [
      { name: "Copy objects", fn: copyObjects },
      { name: "Copy groups", fn: copyGroups },
      { name: "Copy layers", fn: copyLayers },
    ].map((option) => ({ ...option, checked: initialOptionState }))
  );

  /** @type {Types.LayoutFile[]} */
  const [fromLayouts, setFromLayouts] = useState([]);
  /** @type {Types.LayoutFile[]} */
  const [toLayouts, setToLayouts] = useState([]);
  /** @type {React.MutableRefObject<Types.SettingsFile>} */
  const settingsRef = useRef(null);
  /** @type {Types.LayoutJson} */
  const fromJsonRef = useRef(null);
  /** @type {Object} */
  const gameJsonRef = useRef(null);

  const fetchSettings = useCallback(async () => {
    const appDataPath = await appDataDir();
    const configFolderExists = await exists(appDataPath, {
      baseDir: BaseDirectory.Data,
    });

    if (!configFolderExists) {
      await mkdir(appDataPath, {
        dir: BaseDirectory.Data,
      });
    }

    const settingsPath = createPath([appDataPath, "settings.json"]);
    const settingsExists = await exists(settingsPath, {
      dir: BaseDirectory.AppData,
    });

    settingsRef.current = await (async () => {
      const newData = settingsExists
        ? JSON.parse(await readTextFile(settingsPath))
        : {
            gamePath: `C:/Users/MyName/Documents/GDevelop projects/MyGame/myGame.json`,
          };

      newData.gamePath = normalizePath(newData.gamePath);

      if (!settingsExists) {
        await writeTextFile(settingsPath, JSON.stringify(newData, null, 2));
      }

      return newData;
    })();
  }, []);

  const fetchGameData = useCallback(async () => {
    try {
      gameJsonRef.current = await JSON.parse(
        await readTextFile(`${settingsRef.current.gamePath}`, {
          baseDir: BaseDirectory.Document,
        })
      );
    } catch (error) {
      console.error(
        "Error reading game .json file. Idk why.",
        "\n",
        "\n",
        error
      );
    }
  }, []);

  const fetchLayouts = useCallback(async () => {
    try {
      const parsedLayouts = gameJsonRef.current.layouts
        .map((v) => ({
          name: v.name,
          selected: false,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setFromLayouts(parsedLayouts);
      setToLayouts(parsedLayouts);
    } catch (error) {
      console.error(
        "Error fetching layouts. My code is probably wrong.",
        "\n",
        "\n",
        error
      );
    }
  }, []);

  useDisableRightClick();
  useEffect(() => {
    (async () => {
      await fetchSettings();
      await fetchGameData();
      await fetchLayouts();
    })();
  }, [fetchSettings, fetchLayouts]);

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
                  setFromLayouts((fromLayouts) =>
                    fromLayouts.map((from, frIndex) => {
                      if (frIndex === index) {
                        fromJsonRef.current = gameJsonRef.current.layouts.find(
                          (lyt) => lyt.name === from.name
                        );

                        return { ...from, selected: true };
                      }

                      return {
                        ...from,
                        selected: frIndex === index,
                      };
                    })
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
                onClick={async () => {
                  if (fromJsonRef.current == null) {
                    const fromPath = createPath([
                      settingsRef.current.layoutsPath,
                      fromLayouts.find((fr) => fr.selected).fileName,
                    ]);

                    fromJsonRef.current = JSON.parse(
                      await readTextFile(fromPath)
                    );
                  }

                  try {
                    await copyFile(
                      settingsRef.current.gamePath,
                      `${settingsRef.current.gamePath}.bak`
                    );
                  } catch (error) {
                    console.error(
                      "Couldn't backup game file for some reason.",
                      "\n",
                      "\n",
                      error
                    );
                  }

                  for (const scrpt of scriptOptions) {
                    if (!scrpt.checked) {
                      return;
                    }

                    const selectedToLayouts = toLayouts.filter(
                      (v) => v.selected
                    );

                    for (let i = 0; i < selectedToLayouts.length; i++) {
                      const toLayout = selectedToLayouts[i];
                      const toJson = gameJsonRef.current.layouts.find(
                        (lyt) => lyt.name === toLayout.name
                      );
                      const newToJson = scrpt.fn(fromJsonRef.current, toJson);

                      Object.assign(toJson, newToJson);

                      if (i === selectedToLayouts.length - 1) {
                        console.log("Writing game file!");

                        try {
                          await writeTextFile(
                            `${settingsRef.current.gamePath}.tmp`,
                            JSON.stringify(gameJsonRef.current, null, 2)
                          );

                          await rename(
                            `${settingsRef.current.gamePath}.tmp`,
                            `${settingsRef.current.gamePath}`
                          );
                        } catch (error) {
                          console.log(
                            "Some error occured writing the file.",
                            "\n",
                            "\n",
                            error
                          );
                        }
                      }
                    }
                  }

                  fromJsonRef.current = null;
                }}
              >
                Copy from ➜ to
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
                {scriptOptions.map((checkOpt, i) => (
                  <FormControlLabel
                    key={i}
                    control={
                      <Checkbox
                        size="small"
                        checked={checkOpt.checked}
                        onChange={(e) => {
                          setScriptOptions((current) =>
                            current.map((opt) =>
                              opt.name === checkOpt.name
                                ? {
                                    ...opt,
                                    checked: e.target.checked,
                                  }
                                : opt
                            )
                          );
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2">{checkOpt.name}</Typography>
                    }
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

function createPath(strings) {
  const invalidStr = strings.some((s) => typeof s !== "string");

  if (invalidStr) {
    return "";
  }

  const processedStrs = strings.map((s) => normalizePath(s));

  return processedStrs.join("/");
}

function normalizePath(path) {
  if (typeof path !== "string") {
    return "";
  }

  path = path.replace(/\\/g, "/");

  const segments = path.split("/");
  const normalizedSegments = [];

  for (let segment of segments) {
    if (segment === "." || segment === "") {
      continue;
    } else if (segment === "..") {
      if (
        normalizedSegments.length > 0 &&
        normalizedSegments[normalizedSegments.length - 1] !== ".."
      ) {
        normalizedSegments.pop();
      } else {
        normalizedSegments.push("..");
      }
    } else {
      normalizedSegments.push(segment);
    }
  }

  let normalizedPath = normalizedSegments.join("/");

  if (path.startsWith("/")) {
    normalizedPath = "/" + normalizedPath;
  }
  if (path.endsWith("/") && normalizedPath !== "/") {
    normalizedPath += "/";
  }

  return normalizedPath;
}

export default App;
