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
                !existingObj.name.startsWith("__")
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
          objects: f.objects.filter((o) => !o.name.startsWith("__")),
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
