import { isPrefixed, inheritedPrefix, nonInheritedPrefix } from "./common";
// eslint-disable-next-line no-unused-vars, unused-imports/no-unused-imports
import * as Types from "./type";

/**
 * Copies objects from -> to another scene.
 *
 * @param {Types.LayoutJson} fromJson - The source JSON object to copy objects from.
 * @param {Types.LayoutJson} toJson - The destination JSON object to copy objects to.
 * @returns {Types.LayoutJson}
 */
function copyObjects(fromJson, toJson) {
  // Collect from folders not marked as inherited
  const fromFolders = fromJson.objectsFolderStructure.children
    .filter(
      (f) =>
        f.folderName != undefined && !isPrefixed(f.folderName, inheritedPrefix)
    )
    .map((f) => ({
      ...f,
      folderName: `${inheritedPrefix}${f.folderName}`,
    }));

  // Collect folders marked as inherited
  const invalidFromFolders = fromJson.objectsFolderStructure.children.filter(
    (f) =>
      f.folderName != undefined && isPrefixed(f.folderName, inheritedPrefix)
  );

  // Collect fromObjs that are inherited
  const invalidFromObjNames = invalidFromFolders
    .reduce((acc, f) => {
      return [...acc, getFolderObjNamesRecursive(f.children)];
    }, [])
    .flat();

  // Collect toFolders that are/were not copied
  const nonCopiedToFolders = toJson.objectsFolderStructure.children.filter(
    (t) =>
      t.folderName != undefined &&
      !fromFolders.some((f) => f.folderName === t.folderName)
  );

  // Collect toObj names that are/were not copied
  const toObjNamesInNonInheritedFolders = nonCopiedToFolders
    .reduce((acc, t) => {
      return [...acc, getFolderObjNamesRecursive(t.children)];
    }, [])
    .flat();

  // Filter out inherited objs and pre-existing objs from to-be-copied objs
  const fromObjsProcessed = fromJson.objects.filter((f) => {
    if (
      isPrefixed(f.name, nonInheritedPrefix) ||
      invalidFromObjNames.includes(f.name) ||
      toObjNamesInNonInheritedFolders.includes(f.name)
    ) {
      return false;
    }

    return true;
  });

  const fromFoldersProcessed = fromFolders.map((f) => ({
    ...f,
    children: filterObjsWithName(f.children, toObjNamesInNonInheritedFolders),
  }));

  const toFoldersProcessed = toJson.objectsFolderStructure.children.filter(
    (t) => {
      if (t.folderName == undefined) {
        return true;
      }

      return !fromFolders.some((f) => f.folderName === t.folderName);
    }
  );

  const toObjNamesNotInFolder = toJson.objectsFolderStructure.children.reduce(
    (acc, t) => {
      if (t.folderName == undefined) {
        acc = [...acc, t.objectName];
      }

      return acc;
    },
    []
  );

  const toObjsProcessed = toJson.objects.filter(
    (t) =>
      toObjNamesInNonInheritedFolders.includes(t.name) ||
      toObjNamesNotInFolder.includes(t.name)
  );

  return {
    ...toJson,
    objects: [...toObjsProcessed, ...fromObjsProcessed],
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
