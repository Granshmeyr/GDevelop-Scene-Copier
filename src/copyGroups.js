import { nonInheritedPrefix, isPrefixed } from "./common";

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

  console.log(
    fromJson.objectsGroups.map((f) =>
      f.objects.filter((o) => !isPrefixed(o.name, nonInheritedPrefix))
    )
  );

  return {
    ...toJson,
    objectsGroups: newToGroups,
  };
}

export default copyGroups;
