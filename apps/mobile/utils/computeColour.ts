export function getMoodColor(value: number): string {
  const clamped = Math.max(1, Math.min(100, value));

  const inputRange = [1, 25, 50, 75, 100];
  const outputRange = ['#f5cf27', '#05EEC3', '#019090', '#d196ec', '#e75b87'];

  for (let i = 0; i < inputRange.length - 1; i++) {
    const start = inputRange[i];
    const end = inputRange[i + 1];

    if (clamped >= start && clamped <= end) {
      const t = (clamped - start) / (end - start);
      return interpolateHex(outputRange[i], outputRange[i + 1], t);
    }
  }

  return outputRange[outputRange.length - 1];
}

function interpolateHex(color1: string, color2: string, t: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
