import { removePrefix, isPrefixed, prefix } from "./common";

function copyLayers(fromJson, toJson) {
  const { remainingFromLayers, processedToLayers } = toJson.layers.reduce(
    (acc, t) => {
      // Check for prefixed layers that need to be updated
      if (isPrefixed(t.name, prefix)) {
        const updatedLayer = fromJson.layers.find(
          (f) =>
            (f.name === t.name || f.name === removePrefix(t.name, prefix)) &&
            f.name !== ""
        );

        // Don't append layer if already defined
        if (updatedLayer != undefined) {
          acc.processedToLayers.push({
            ...updatedLayer,
            name: isPrefixed(updatedLayer.name, prefix)
              ? updatedLayer.name
              : `${prefix}${updatedLayer.name}`,
          });

          acc.remainingFromLayers.splice(
            acc.remainingFromLayers.findIndex(
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
          (f.name === t.name || removePrefix(f.name, prefix) === t.name) &&
          f.name !== ""
      );

      // Don't append layer if already defined
      if (overwrittenLayer != undefined) {
        acc.remainingFromLayers.splice(
          acc.remainingFromLayers.findIndex(
            (v) => v.name === overwrittenLayer.name
          ),
          1
        );
      }

      acc.processedToLayers.push(t);
      return acc;
    },
    {
      remainingFromLayers: [...fromJson.layers],
      processedToLayers: [],
    }
  );

  const preAppendLayers = (() => {
    const baseIndex = remainingFromLayers.findIndex((f) => f.name === "");

    return remainingFromLayers.filter((_, i) => i < baseIndex);
  })();

  const postAppendLayers = (() => {
    const baseIndex = remainingFromLayers.findIndex((f) => f.name === "");

    return remainingFromLayers.filter((_, i) => i > baseIndex);
  })();

  return {
    ...toJson,
    layers: [
      ...preAppendLayers.map((l) => ({
        ...l,
        name: isPrefixed(l.name, prefix) ? l.name : `${prefix}${l.name}`,
      })),
      ...processedToLayers,
      ...postAppendLayers.map((l) => ({
        ...l,
        name: isPrefixed(l.name, prefix) ? l.name : `${prefix}${l.name}`,
      })),
    ],
  };
}

export default copyLayers;
