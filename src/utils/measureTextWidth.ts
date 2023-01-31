export default function measureTextWidth(text: string, font: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  let textCanvas;
  if (ctx) {
    ctx.font = font;
    textCanvas = ctx.measureText(text);
  }

  return textCanvas ? textCanvas.width : 0;
}
