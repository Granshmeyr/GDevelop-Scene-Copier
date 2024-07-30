function copyObjects(fromJson, toJson) {
  const fromFolders = fromJson.objectsFolderStructure.children.filter(
    (f) => f.folderName != undefined
  );
  const fromUuid = fromJson.variables.find((i) => i.name === "uuid").value;

  const { uuidsVars, uuidsVarsExists } = (() => {
    const found = toJson.variables.find(
      (v) => v.name === "__inheritedObjectFolders"
    );

    return {
      uuidsVars:
        found != undefined
          ? found
          : {
              name: "__inheritedObjectFolders",
              type: "structure",
              children: [],
            },
      uuidsVarsExists: found != undefined,
    };
  })();

  const keptFolderNames = uuidsVars.children
    .filter((v) => v.name !== fromUuid)
    .reduce((acc, v) => [...acc, ...v.children.map((v) => v.value)], []);

  const { uuidsFromVar, uuidsFromVarExists } = (() => {
    const found = uuidsVars.children.find((v) => v.name === fromUuid);

    return {
      uuidsFromVar:
        found != undefined
          ? {
              ...found,
              children: fromFolders.map((f) => ({
                type: "string",
                value: f.folderName,
              })),
            }
          : {
              name: fromUuid,
              persistentUuid: crypto.randomUUID(),
              type: "array",
              children: fromFolders.map((f) => ({
                type: "string",
                value: f.folderName,
              })),
            },
      uuidsFromVarExists: found != undefined,
    };
  })();

  // Remove all "?_" folders & objs being overwritten
  const { toFolderStructureProcessed, toObjsProcessed } =
    toJson.objectsFolderStructure.children?.reduce(
      (acc, v) => {
        if (
          !v.folderName ||
          !folderHasPrefix(v.folderName) ||
          keptFolderNames.includes(v.folderName)
        ) {
          acc.toFolderStructureProcessed.push(v);
          return acc;
        }

        if (v.children != undefined) {
          const collectedNames = getAllObjNamesRecursive(v.children);
          const filteredToObjs = acc.toObjsProcessed.filter(
            (v) => !collectedNames.includes(v.name)
          );

          acc.toObjsProcessed = filteredToObjs;
        }

        return acc;
      },
      {
        toFolderStructureProcessed: [],
        toObjsProcessed: [...toJson.objects],
      }
    ) ?? { toFolderStructureProcessed: [], toObjsProcessed: [] };

  const fromObjsProcessed = fromJson.objects.filter(
    (f) =>
      (!toObjsProcessed?.some?.((t) => t.name === f.name) ?? true) &&
      !f.name.startsWith("__")
  );
  const fromFoldersProcessed = fromFolders
    .filter((f) => f.children != undefined)
    .map((f) => ({
      ...f,
      children: filterExistingObjsRecursive(f.children),
    }));

  return {
    ...toJson,
    objects: [...toObjsProcessed, ...fromObjsProcessed],
    objectsFolderStructure: {
      folderName: "__ROOT",
      children: [...toFolderStructureProcessed, ...fromFoldersProcessed],
    },
    variables: (() => {
      const uuidsVarsUpdated = uuidsFromVarExists
        ? {
            ...uuidsVars,
            children: uuidsVars.children.map((v) =>
              v.name === fromUuid ? uuidsFromVar : v
            ),
          }
        : { ...uuidsVars, children: [...uuidsVars.children, uuidsFromVar] };

      return uuidsVarsExists
        ? toJson.variables.map((v) =>
            v.name === "__inheritedObjectFolders" ? uuidsVarsUpdated : v
          )
        : [...toJson.variables, uuidsVarsUpdated];
    })(),
  };

  function getAllObjNamesRecursive(children) {
    return children.reduce((acc, c) => {
      if (c.children != undefined) {
        return [...acc, ...getAllObjNamesRecursive(c.children)];
      }
      return [...acc, c.objectName];
    }, []);
  }

  function filterExistingObjsRecursive(children) {
    return children.filter((f) => {
      if (f.children != undefined) {
        f.children = filterExistingObjsRecursive(f.children, toObjsProcessed);
        return true;
      }

      return !toObjsProcessed.some((t) => t.name === f.objectName);
    });
  }

  function folderHasPrefix(str) {
    return str.startsWith("__");
  }
}

export default copyObjects;
