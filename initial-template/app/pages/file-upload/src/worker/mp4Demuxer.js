import { DataStream, createFile } from "../deps/mp4box.0.5.2.js";

export default class Mp4Demuxer {
  #onConfig;
  #onChunck;
  #file;
  /**
   *
   * @param {ReadableStream} stream
   * @param {Object} options
   * @param {(config:Object)=>void} options.onConfig
   *  @returns {Promise<void>}
   */
  async run(stream, { onConfig, onChunck }) {
    this.#onChunck = onChunck;
    this.#onConfig = onConfig;
    this.#file = createFile();
    this.#file.onReady = this.#onReady.bind(this);
    this.#file.onSamples = this.#onSamples.bind(this);
    this.#file.onError = (error) => console.error("deu ruim mp4demuxer", error);
    return this.#init(stream);
  }

  #description(thrack) {
    const track = this.#file.getTrackById(thrack.id);
    for (const entry of track.mdia.minf.stbl.stsd.entries) {
      const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
      if (box) {
        const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
        box.write(stream);
        return new Uint8Array(stream.buffer, 8);
      }
    }
    throw new Error("avcC,hvcC,vpcC or av1C box not found");
  }
  /**
 * 
 * @param {*} trackId 
 * @param {*} ref 
 * @param {Array(Object)} samples 
/**
 * @typedef {Object} Sample
 * @property {number} timescale - A number representing timescale.
 * @property {number} duration - A number representing duration.
 * @property {number} dts - A number representing dts.
 * @property {number} cts - A number representing cts.
 * @property {boolean} is_sync - A boolean representing if it's synchronized.
 */

  /**
   * @param {Array<Sample>} samples - An array of sample objects.
   */

  #onSamples(trackId, ref, samples) {
    for (const sample of samples) {
      this.#onChunck(
        new EncodedVideoChunk({
          type: sample.is_sync ? "key" : "delta",
          timestamp: (1e6 * sample.cts) / sample.timescale,
          duration: (1e6 * sample.duration) / sample.timescale,
          data: sample.data,
        })
      );
    }
  }

  #onReady(info) {
    const [track] = info.videoTracks;
    this.#onConfig({
      codec: track.codec,
      codedHeight: track.video.height,
      codedWidth: track.video.width,
      description: this.#description(track),
      durationSec: info.duration / info.timescale,
    });
    this.#file.setExtractionOptions(track.id);
    this.#file.start();
  }
  /**
   *
   * @param {ReadableStream} stream
   * @returns {Promise<void>}
   */
  #init(stream) {
    let _offset = 0;
    const consumeFile = new WritableStream({
      write: (chunck) => {
        const copy = chunck.buffer;
        copy.fileStart = _offset;
        this.#file.appendBuffer(copy);
        _offset += chunck.length;
      },
      close: () => {
        this.#file.flush();
      },
    });
    return stream.pipeTo(consumeFile);
  }
}
