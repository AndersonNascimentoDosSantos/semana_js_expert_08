/**@param {HTMLCanvasElement} canvas */
let _canvas;
let _ctx;
export default class CanvasRender {
  /**
   * @param {VideoFrame} frame
   */
  static draw(frame) {
    const { displayHeight, displayWidth } = frame;
    _canvas.width = displayWidth;
    _canvas.height = displayHeight;
    _ctx.drawImage(frame, 0, 0, displayWidth, displayHeight);
    frame.close();
  }
  /**@param {HTMLCanvasElement} canvas */
  static getRender(canvas) {
    _canvas = canvas;
    _ctx = canvas.getContext("2d");
    const renderer = this;
    let _pendingFrame = null;
    return (frame) => {
      const renderAnimationFrame = () => {
        renderer.draw(_pendingFrame);
        _pendingFrame = null;
      };
      if (!_pendingFrame) {
        requestAnimationFrame(renderAnimationFrame);
      } else {
        _pendingFrame.close();
      }
      _pendingFrame = frame;
    };
  }
}
