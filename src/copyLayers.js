function copyLayers(fromJson, toJson) {
  const prefix = "♻️";

  const { processedToLayers, newlyAppendedLayers } = toJson.layers.reduce(
    (acc, t) => {
      // Check for prefixed layers that need to be updated
      if (isPrefixed(t.name, prefix)) {
        const updatedLayer = fromJson.layers.find(
          (f) => f.name === t.name || f.name === removePrefix(t.name, prefix)
        );

        if (updatedLayer != undefined) {
          acc.processedToLayers.push({
            ...updatedLayer,
            name: isPrefixed(updatedLayer.name, prefix)
              ? updatedLayer.name
              : `${prefix}${updatedLayer.name}`,
          });

          acc.newlyAppendedLayers.splice(
            acc.newlyAppendedLayers.findIndex(
              (v) => v.name === updatedLayer.name
            ),
            1
          );
        } else {
          acc.processedToLayers.push(t);
        }

        return acc;
      }

      // Check for manually defined layers "foobar" that need to be preserved
      const overwrittenLayer = fromJson.layers.find(
        (f) =>
          (isPrefixed(f.name, prefix) &&
            removePrefix(f.name, prefix) === t.name) ||
          (f.name === t.name && f.name !== "")
      );

      if (overwrittenLayer != undefined) {
        acc.newlyAppendedLayers.splice(
          acc.newlyAppendedLayers.findIndex(
            (v) => v.name === overwrittenLayer.name
          ),
          1
        );
      }

      acc.processedToLayers.push(t);
      return acc;
    },
    {
      processedToLayers: [],
      newlyAppendedLayers: [...fromJson.layers.filter((l) => l.name !== "")],
    }
  );

  return {
    ...toJson,
    layers: [
      ...processedToLayers,
      ...newlyAppendedLayers.map((l) => ({
        ...l,
        name: isPrefixed(l.name, prefix) ? l.name : `${prefix}${l.name}`,
      })),
    ],
  };
}

export default copyLayers;

function removePrefix(str, prefix) {
  const regex = new RegExp(`^${prefix}`);
  return str.replace(regex, "");
}

function isPrefixed(str, prefix) {
  return new RegExp(`^${prefix}`).test(str);
}
