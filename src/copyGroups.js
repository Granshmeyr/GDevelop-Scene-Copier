import { nonInheritedPrefix, isPrefixed } from "./common";
// eslint-disable-next-line no-unused-vars, unused-imports/no-unused-imports
import * as Types from "./type";

/**
 * Copies object groups from -> to another scene.
 *
 * @param {Types.LayoutJson} fromJson - The source JSON object to copy groups from.
 * @param {Types.LayoutJson} toJson - The destination JSON object to copy groups to.
 * @returns {Types.LayoutJson}
 */
function copyGroups(fromJson, toJson) {
  const newToGroups = (() => {
    const { updatedToGroups, toAppendGroups } = toJson.objectsGroups.reduce(
      (acc, t) => {
        const existingGroup = fromJson.objectsGroups.find(
          (f) => f.name === t.name
        );

        if (existingGroup == undefined) {
          acc.updatedToGroups.push(t);
          return acc;
        }

        const updatedGroup = {
          ...t,
          objects: [
            ...t.objects.map(
              (t) => existingGroup.objects.find((f) => f.name === t.name) || t
            ),
            ...existingGroup.objects.filter(
              (existingObj) =>
                !t.objects.some((t) => t.name === existingObj.name) &&
                !isPrefixed(existingObj.name, nonInheritedPrefix)
            ),
          ],
        };

        acc.updatedToGroups.push(updatedGroup);
        acc.toAppendGroups = acc.toAppendGroups.filter(
          (f) => f.name !== t.name
        );
        return acc;
      },
      {
        updatedToGroups: [],
        toAppendGroups: fromJson.objectsGroups.map((f) => ({
          ...f,
          objects: f.objects.filter(
            (o) => !isPrefixed(o.name, nonInheritedPrefix)
          ),
        })),
      }
    );

    return [...updatedToGroups, ...toAppendGroups];
  })();

  return {
    ...toJson,
    objectsGroups: newToGroups,
  };
}

export default copyGroups;
