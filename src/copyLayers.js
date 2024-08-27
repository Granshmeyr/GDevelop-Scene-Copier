function copyLayers(fromJson, toJson) {
  const { processedToLayers, newlyAppendedLayers } = toJson.layers.reduce(
    (acc, l) => {
      // Check for prefixed layers that need to be updated
      if (/^♻️/.test(l.name)) {
        const updatedLayer = fromJson.layers.find(
          (f) => f.name === l.name || f.name === removePrefix(l.name, "♻️")
        );

        if (updatedLayer != undefined) {
          acc.processedToLayers.push({
            ...updatedLayer,
            name: /^♻️/.test(updatedLayer.name)
              ? updatedLayer.name
              : `♻️${updatedLayer.name}`,
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
          (/^♻️/.test(f.name) && removePrefix(f.name, "♻️") === l.name) ||
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
      processedToLayers: [],
      newlyAppendedLayers: [...fromJson.layers.filter((l) => l.name !== "")],
    }
  );

  console.log(fromJson.layers);

  return {
    ...toJson,
    layers: [
      ...processedToLayers,
      ...newlyAppendedLayers.map((l) => ({
        ...l,
        name: /^♻️/.test(l.name) ? l.name : `♻️${l.name}`,
      })),
    ],
  };
}

export default copyLayers;

function removePrefix(str, prefix) {
  const regex = new RegExp(`^${prefix}`);
  return str.replace(regex, "");
}
