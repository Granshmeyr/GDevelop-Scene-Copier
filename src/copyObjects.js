function copyObjects(fromJson, toJson) {
  const fromFolders = fromJson.objectsFolderStructure.children
    .filter((f) => f.folderName != undefined && !/^♻️/.test(f.folderName))
    .map((f) => ({
      ...f,
      folderName: `♻️${f.folderName}`,
    }));

  const invalidFromFolders = fromJson.objectsFolderStructure.children.filter(
    (f) => f.folderName != undefined && /^♻️/.test(f.folderName)
  );

  const invalidFromObjNames = invalidFromFolders
    .reduce((acc, f) => {
      return [...acc, getFolderObjNamesRecursive(f.children)];
    }, [])
    .flat();

  const toObjNames = getFolderObjNamesRecursive(
    toJson.objectsFolderStructure.children
  );

  const fromObjsProcessed = fromJson.objects.filter((f) => {
    if (
      /^⚠️/.test(f.name) ||
      invalidFromObjNames.includes(f.name) ||
      toObjNames.includes(f.name)
    ) {
      return false;
    }

    return true;
  });

  const nonCopiedToFolders = toJson.objectsFolderStructure.children.filter(
    (t) =>
      t.folderName != undefined &&
      !fromFolders.some((f) => f.folderName === t.folderName)
  );

  const toObjNamesDefinedOutsideCopiedFolder = nonCopiedToFolders
    .reduce((acc, t) => {
      return [...acc, getFolderObjNamesRecursive(t.children)];
    }, [])
    .flat();

  const fromFoldersProcessed = fromFolders.map((f) => ({
    ...f,
    children: filterObjsWithName(
      f.children,
      toObjNamesDefinedOutsideCopiedFolder
    ),
  }));

  const toFoldersProcessed = toJson.objectsFolderStructure.children.filter(
    (t) => {
      if (t.folderName == undefined) {
        return true;
      }

      return !fromFolders.some((f) => f.folderName === t.folderName);
    }
  );

  return {
    ...toJson,
    objects: [...toJson.objects, ...fromObjsProcessed],
    objectsFolderStructure: {
      folderName: "__ROOT",
      children: [...toFoldersProcessed, ...fromFoldersProcessed],
    },
  };

  function getFolderObjNamesRecursive(children) {
    return children.reduce((acc, c) => {
      if (c.children != undefined) {
        return [...acc, ...getFolderObjNamesRecursive(c.children)];
      }
      return [...acc, c.objectName];
    }, []);
  }

  function filterObjsWithName(children, names) {
    return children.filter((f) => {
      if (f.children != undefined) {
        f.children = filterObjsWithName(f.children, names);
        return true;
      }

      return !names.includes(f.objectName);
    });
  }
}

export default copyObjects;
