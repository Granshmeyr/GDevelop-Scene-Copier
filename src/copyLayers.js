function copyLayers(fromJson, toJson) {
  const { processedToLayers, newlyAppendedLayers } = toJson.layers.reduce(
    (acc, l) => {
      if (l.name === "") {
        return acc;
      }

      // Check for inherited layers "__foobar" that need to be updated
      if (l.name.startsWith("__")) {
        const updatedLayer = fromJson.layers.find(
          (f) => f.name === l.name || f.name === l.name.slice(2)
        );

        if (updatedLayer != undefined) {
          acc.processedToLayers.push({
            ...updatedLayer,
            name: updatedLayer.name.startsWith("__")
              ? updatedLayer.name
              : `__${updatedLayer.name}`,
          });

          acc.newlyAppendedLayers.splice(
            acc.newlyAppendedLayers.findIndex(
              (v) => v.name === updatedLayer.name
            ),
            1
          );
        } else {
          acc.processedToLayers.push(l);
        }

        return acc;
      }

      // Check for manually defined layers "foobar" that need to be preserved
      const overwrittenLayer = fromJson.layers.find(
        (f) =>
          (f.name.startsWith("__") && f.name.slice(2) === l.name) ||
          f.name === l.name
      );

      if (overwrittenLayer != undefined) {
        acc.newlyAppendedLayers.splice(
          acc.newlyAppendedLayers.findIndex(
            (v) => v.name === overwrittenLayer.name
          ),
          1
        );
      }

      acc.processedToLayers.push(l);
      return acc;
    },
    {
      processedToLayers: [toJson.layers.find((l) => l.name === "")],
      newlyAppendedLayers: [...fromJson.layers.filter((l) => l.name !== "")],
    }
  );

  return {
    ...toJson,
    layers: [
      ...processedToLayers,
      ...newlyAppendedLayers.map((l) => ({
        ...l,
        name: l.name.startsWith("__") ? l.name : `__${l.name}`,
      })),
    ],
  };
}

export default copyLayers;
