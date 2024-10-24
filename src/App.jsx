import {
  BaseDirectory,
  readDir,
  mkdir,
  exists,
  writeTextFile,
  readTextFile,
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
  const settingsData = useRef(null);
  /** @type {Object} */
  const fromData = useRef(null);
  /** @type {Object} */
  const gameData = useRef(null);

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

    settingsData.current = await (async () => {
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
      gameData.current = await JSON.parse(
        await readTextFile(`${settingsData.current.gamePath}`, {
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

  // Refactor this so that it gets layouts from the game file rather than a directory :(
  const fetchLayouts = useCallback(async () => {
    try {
      const layoutFiles = await readDir(settingsData.current.layoutsPath, {
        baseDir: BaseDirectory.Document,
      });

      const parsedData = await Promise.all(
        layoutFiles
          .filter((file) => file.isFile && file.name.endsWith(".json"))
          .map(async (file) => {
            const data = JSON.parse(
              await readTextFile(
                `${settingsData.current.layoutsPath}/${file.name}`,
                {
                  baseDir: BaseDirectory.Document,
                }
              )
            );

            const nameLine = data.name;

            return {
              name: nameLine ? nameLine : `⚠️ INVALID LAYOUT FILE ${file.name}`,
              fileName: file.name,
              selected: false,
            };
          })
      );

      const parsedDataSorted = parsedData
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name));

      setFromLayouts(parsedDataSorted);
      setToLayouts(parsedDataSorted);
    } catch (error) {
      console.error(
        "Error fetching layouts. Is your settings.json updated?",
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
                  setFromLayouts((fr) =>
                    fr.map((v, frIndex) => {
                      if (frIndex === index) {
                        (async () => {
                          const fromPath = createPath([
                            settingsData.current.layoutsPath,
                            v.fileName,
                          ]);

                          fromData.current = JSON.parse(
                            await readTextFile(fromPath)
                          );
                        })();

                        return { ...v, selected: true };
                      }

                      return {
                        ...v,
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
                  if (fromData.current == null) {
                    const fromPath = createPath([
                      settingsData.current.layoutsPath,
                      fromLayouts.find((fr) => fr.selected).fileName,
                    ]);

                    fromData.current = JSON.parse(await readTextFile(fromPath));
                  }

                  for (const s of scriptOptions) {
                    if (!s.checked) {
                      return;
                    }

                    const selectedTos = toLayouts.filter((v) => v.selected);

                    for (const to of selectedTos) {
                      const toPath = createPath([
                        settingsData.current.layoutsPath,
                        to.fileName,
                      ]);
                      const toStr = await readTextFile(toPath, {
                        baseDir: BaseDirectory.Document,
                      });

                      if (toStr == undefined) {
                        return;
                      }

                      const toData = JSON.parse(toStr);
                      const newToData = s.fn(fromData.current, toData);

                      await writeTextFile(
                        `${toPath}`,
                        JSON.stringify(newToData, null, 2)
                      );
                    }
                  }

                  fromData.current = null;
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
