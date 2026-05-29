import { FFmpeg } from '@ffmpeg/ffmpeg'

export async function transcodeVideo() {
  const ffmpeg = new FFmpeg()

  await ffmpeg.load()

  console.log('ffmpeg.wasm loaded')
}
