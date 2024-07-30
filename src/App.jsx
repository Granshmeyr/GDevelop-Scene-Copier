import {
  BaseDirectory,
  readDir,
  mkdir,
  exists,
  readTextFileLines,
  writeTextFile,
  readTextFile,
} from "@tauri-apps/plugin-fs";
import { appDataDir, sep } from "@tauri-apps/api/path";
import React, {
  useState,
  cloneElement,
  useEffect,
  useCallback,
  useRef,
} from "react";
import "./App.css";
import useDisableRightClick from "./useDisableRightClick";
import copyGroups from "./copyGroups";
import copyLayers from "./copyLayers";
import copyObjects from "./copyObjects";

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
  const initialOptionState = true;
  const theme = useTheme();
  const [scriptOptions, setScriptOptions] = useState(
    [
      { name: "Copy objects", fn: copyObjects },
      { name: "Copy groups", fn: copyGroups },
      { name: "Copy layers", fn: copyLayers },
    ].map((option) => ({ ...option, checked: initialOptionState }))
  );

  const [fromLayouts, setFromLayouts] = useState([]);
  const [toLayouts, setToLayouts] = useState([]);
  const settingsData = useRef(null);
  const fromData = useRef(null);

  const fetchSettings = useCallback(async () => {
    const appDataPath = await appDataDir().catch((e) => console.error(e));
    const configFolderExists = await exists(appDataPath, {
      baseDir: BaseDirectory.Data,
    }).catch((e) => console.error(e));

    if (!configFolderExists) {
      await mkdir(appDataPath, {
        dir: BaseDirectory.Data,
      }).catch((e) => console.error(e));
    }

    const settingsPath = createPath([appDataPath, "settings.json"]);
    const settingsExists = await exists(settingsPath, {
      dir: BaseDirectory.AppData,
    }).catch((e) => console.error(e));

    settingsData.current = await (async () => {
      const data = settingsExists
        ? JSON.parse(
            await readTextFile(settingsPath).catch((e) => console.error(e))
          )
        : {
            layoutsPath: `C:/Users/MyName/Documents/GDevelop projects/MyGame/layouts`,
          };

      data.layoutsPath = normalizePath(data.layoutsPath);

      if (!settingsExists) {
        await writeTextFile(settingsPath, JSON.stringify(data, null, 2)).catch(
          (e) => console.error(e)
        );
      }

      return data;
    })();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const data = await readDir(settingsData.current.layoutsPath, {
        baseDir: BaseDirectory.Document,
      }).catch((e) => console.error(e));

      const parsedData = await Promise.all(
        data
          .filter((file) => file.isFile && file.name.endsWith(".json"))
          .map(async (file) => {
            const lines = await readTextFileLines(
              `${settingsData.current.layoutsPath}/${file.name}`,
              {
                baseDir: BaseDirectory.Document,
              }
            ).catch((e) => console.error(e));

            const nameLine = await (async () => {
              for await (const line of lines) {
                if (line.includes(`"name"`)) {
                  return line;
                }
              }
            })().catch((e) => console.error(e));

            return {
              name: nameLine
                ? nameLine.match(/"name":\s*"(.*?)"/)[1]
                : `⚠️ INVALID LAYOUT FILE ${file.name}`,
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
        `Error fetching layouts. Is your settings.json updated?`,
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
      await fetchData();
    })();
  }, [fetchSettings, fetchData]);

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
                            await readTextFile(fromPath).catch((e) =>
                              console.error(e)
                            )
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
                  if (!fromData) {
                    return;
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
                      }).catch((e) => console.error(e));

                      if (toStr == undefined) {
                        return;
                      }

                      const toData = JSON.parse(toStr);
                      const newToData = s.fn(fromData.current, toData);

                      await writeTextFile(
                        `${toPath}.gdsi`,
                        JSON.stringify(newToData, null, 2)
                      ).catch((e) => console.error(e));
                    }
                  }
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
