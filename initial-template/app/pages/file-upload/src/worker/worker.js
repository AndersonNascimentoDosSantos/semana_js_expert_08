import CanvasRender from "./canvasRender.js";
import Mp4Demuxer from "./mp4Demuxer.js";
import VideoProcessor from "./videoProcessor.js";

const qvgaConstraints = {
  width: 320,
  height: 240,
};
const vgaConstraints = {
  width: 640,
  height: 480,
};
const hdConstraints = {
  width: 1280,
  height: 720,
};

const encoderConfig = {
  ...qvgaConstraints,
  bitrate: 10e6,
  codec: "vp09.00.10.08",
  pt: 1,
  hardwareAcceleration: "prefer-software",
  // MP4
  // codec: "avc1.42002A",
  // pt: 4,
  // hardwareAcceleration: "prefer-hardware",
  // avc:{format:  'annexb'}
};
const mp4Demuxer = new Mp4Demuxer();
const videoProcessor = new VideoProcessor({
  mp4Demuxer,
});

onmessage = async ({ data }) => {
  const renderFrame = CanvasRender.getRender(data.canvas);
  await videoProcessor.start({
    file: data.file,
    encoderConfig,
    renderFrame,
    sendMessage(message) {
      self.postMessage(message);
    },
  });
  let timeout = null;
  if (data.status === "start") {
    // Iniciar o temporizador
    timeout = setTimeout(() => {
      self.postMessage({ status: "done" });
    }, 2000);
  } else if (data.status === "done") {
    // Cancelar o temporizador se necessário
    if (timeout) {
      clearTimeout(timeout);
    }
  }
};
