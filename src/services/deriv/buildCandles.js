let currentCandle = null;

export function buildCandle(price) {
  const now = Math.floor(Date.now() / 1000);

  const bucket = Math.floor(now / 60) * 60;

  if (!currentCandle) {
    currentCandle = {
      time: bucket,
      open: price,
      high: price,
      low: price,
      close: price,
    };

    return currentCandle;
  }

  if (currentCandle.time !== bucket) {
    currentCandle = {
      time: bucket,
      open: price,
      high: price,
      low: price,
      close: price,
    };

    return currentCandle;
  }

  currentCandle.high =
    Math.max(currentCandle.high, price);

  currentCandle.low =
    Math.min(currentCandle.low, price);

  currentCandle.close = price;

  return currentCandle;
}
