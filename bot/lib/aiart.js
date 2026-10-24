import axios from 'axios'
import { randomUUID, randomBytes } from 'node:crypto'

export const CONFIG = {
  configHost: 'https://config.production.aiartgen.net',
  accountHost: 'https://account.production.aiartgen.net',
  syncHost: 'https://sync-task.production.aiartgen.net',
  asyncHost: 'https://async-task.production.aiartgen.net',

  appVersionCode: '831',
  appVersionName: '8.3.1',
  platform: 'android',

  timeout: 120000,
  pollInterval: 5000,
  maxPoll: 60
}

export const IMAGE_MODELS = [
  {
    id: 'dream_shape_lighting',
    name: 'General',
    workType: 'text2img'
  },
  {
    id: 'juggernaut_lighting',
    name: 'Realistic',
    workType: 'text2img'
  },
  {
    id: 'redcraft_illustrious',
    name: 'Realistic 2',
    workType: 'text2img'
  },
  {
    id: 'ilustreal_illustrious',
    name: 'Realistic 3',
    workType: 'text2img'
  },
  {
    id: 'babes_illustrious',
    name: 'Realistic 4',
    workType: 'text2img'
  },
  {
    id: 'raemu_lighting',
    name: 'Anime',
    workType: 'text2img'
  },
  {
    id: 'wai_Illustrious',
    name: 'Anime 2',
    workType: 'text2img'
  },
  {
    id: 'illustrij_Illustrious',
    name: 'Anime 2.5D',
    workType: 'text2img'
  },
  {
    id: 'prefect_illustrious',
    name: 'Anime 3',
    workType: 'text2img'
  },
  {
    id: 'goddess_illustrious',
    name: 'Realistic 6',
    workType: 'text2img'
  },
  {
    id: 'perfectdeliberate_illustrious',
    name: 'Anime 2.5D 2',
    workType: 'text2img'
  },
  {
    id: 'guofeng_sdxl',
    name: 'GuoFeng',
    workType: 'text2img'
  },
  {
    id: 'disney_cartoon_sdxl',
    name: 'Disney Cartoon',
    workType: 'text2img'
  },
  {
    id: 'samaritan_sdxl',
    name: 'Samaritan',
    workType: 'text2img'
  },
  {
    id: 'prefectious_illustrious',
    name: 'Anime 4',
    workType: 'text2img'
  },
  {
    id: 'realvis_lighting',
    name: 'Realistic 5',
    workType: 'text2img'
  },
  {
    id: 'flux2_klein_fast',
    name: 'Flux2 Fast',
    workType: 'flux2_text2img'
  },
  {
    id: 'flux2_klein',
    name: 'Flux2',
    workType: 'flux2_text2img'
  },
  {
    id: 'redzimage_zimg',
    name: 'ZImage',
    workType: 'zimg_text2img'
  }
]

export const VIDEO_ENGINES = {
  wan: {
    id: 'wan2_2',
    name: 'Wan 2.2',
    text: 'text2video_wan',
    image: 'image2video_wan'
  },

  hunyuan: {
    id: 'hunyuan1_5',
    name: 'Hunyuan 1.5',
    text: 'text2video_hunyuan',
    image: 'image2video_hunyuan'
  },

  ltx2: {
    id: 'ltx2',
    name: 'LTX 2',
    text: 'text2video_ltx2',
    image: 'image2video_ltx2'
  }
}

export const RATIOS = [
  '1:1',
  '9:16',
  '16:9',
  '3:4',
  '4:3',
  '2:3',
  '3:2'
]

export const VIDEO_DURATION = [
  5,
  10,
  20
]

export const VIDEO_RESOLUTION = [
  '480p',
  '720p',
  '1080p'
]

export const delay = ms =>
  new Promise(resolve => setTimeout(resolve, ms))

export const uuid = () => randomUUID()

export const androidId = () =>
  randomBytes(8).toString('hex')

export function getModel(id = 'flux2_klein_fast') {
  return (
    IMAGE_MODELS.find(v => v.id === id) ??
    IMAGE_MODELS.find(v => v.id === 'flux2_klein_fast')
  )
}

export function getResolution(ratio = '9:16') {

  switch (ratio) {

    case '1:1':
      return {
        width: 1024,
        height: 1024
      }

    case '16:9':
      return {
        width: 1344,
        height: 756
      }

    case '3:4':
      return {
        width: 1008,
        height: 1344
      }

    case '4:3':
      return {
        width: 1344,
        height: 1008
      }

    case '2:3':
      return {
        width: 896,
        height: 1344
      }

    case '3:2':
      return {
        width: 1344,
        height: 896
      }

    default:
      return {
        width: 756,
        height: 1344
      }

  }

}

export function parseArgs(text = '') {

  const args = text.trim().split(/\s+/)

  let model = 'flux2_klein_fast'
  let ratio = '9:16'
  let negativePrompt = ''

  const prompt = []

  for (const arg of args) {

    if (arg.startsWith('--model=')) {
      model = arg.slice(8)
      continue
    }

    if (arg.startsWith('--ratio=')) {
      ratio = arg.slice(8)
      continue
    }

    if (arg.startsWith('--negative=')) {
      negativePrompt = arg.slice(11)
      continue
    }

    prompt.push(arg)

  }

  return {
    prompt: prompt.join(' ').trim(),
    model,
    ratio,
    negativePrompt
  }

}

export class AIArtClient {

  constructor() {

    this.deviceId = uuid()
    this.adId = uuid()
    this.androidId = androidId()

    this.bearerToken = null

  }

  refreshGuest() {

    if (this.bearerToken) return

    this.deviceId = uuid()
    this.adId = uuid()
    this.androidId = androidId()

  }

  buildQuery(extra = {}) {

    return new URLSearchParams({

      app_version_code: CONFIG.appVersionCode,
      app_version_name: CONFIG.appVersionName,

      platform: CONFIG.platform,

      device_id: this.deviceId,
      ad_id: this.adId,
      android_id: this.androidId,

      ...extra

    }).toString()

  }

  async request(url, method = 'GET', body = null) {

    const headers = {
      'User-Agent': 'Dart/3.11 (dart:io)',
      'Accept-Encoding': 'gzip'
    }

    if (this.bearerToken) {
      headers.Authorization =
        `Bearer ${this.bearerToken}`
    }

    const { data } = await axios({
      url,
      method,
      data: body,
      timeout: CONFIG.timeout,
      headers
    })

    return data

  }
  
    async getConfig(clientDiamonds = 0) {

    return await this.request(
      `${CONFIG.configHost}/api/v1/config?${this.buildQuery({
        client_diamonds: clientDiamonds
      })}`
    )

  }

  async updateFcmToken(token) {

    return await this.request(
      `${CONFIG.accountHost}/api/v1/account/update_fcm_token?${this.buildQuery()}`,
      'POST',
      {
        fcm_token: token
      }
    )

  }

  async createImageTask(prompt, options = {}) {

    const model = getModel(options.model)

    const size = getResolution(options.ratio)

    return await this.request(
      `${CONFIG.syncHost}/api/v1/sync_task/add?${this.buildQuery()}`,
      'POST',
      {
        device_id: this.deviceId,
        prompt,
        prompt_translated: prompt,
        negative_prompt: options.negativePrompt || '',
        model_id: model.id,
        work_type: model.workType,
        width: size.width,
        height: size.height,
        ratio: options.ratio || '9:16',
        seed:
          options.seed ||
          Math.floor(Math.random() * 999999999999),
        priority: 0,
        batch_size: 1,
        has_face: false,
        steps: options.steps || 20,
        cfg_scale: options.cfgScale || 7,
        style: options.style || 'base',
        is4k: false,
        client_diamonds:
          options.clientDiamonds || 50
      }
    )

  }

  async getImageStatus(taskId) {

    return await this.request(
      `${CONFIG.syncHost}/api/v1/sync_task/status/${taskId}?${this.buildQuery()}`
    )

  }

  async getImageResult(taskId) {

    return await this.request(
      `${CONFIG.syncHost}/api/v1/sync_task/result/${taskId}?${this.buildQuery()}`
    )

  }

  async waitImage(taskId, callback = null) {

    for (
      let attempt = 0;
      attempt < CONFIG.maxPoll;
      attempt++
    ) {

      await delay(CONFIG.pollInterval)

      const status =
        await this.getImageStatus(taskId)

      callback?.(
        status.status,
        status.progress || 0
      )

      if (
        status.status === 'completed'
      ) {

        return await this.getImageResult(taskId)

      }

      if (
        status.status === 'failed'
      ) {

        throw new Error(
          status.error_message ||
          'Image generation failed.'
        )

      }

    }

    throw new Error(
      'Image generation timeout.'
    )

  }

  async createVideoTask(prompt, options = {}) {

    const engine =
      VIDEO_ENGINES[
        options.engine || 'wan'
      ] || VIDEO_ENGINES.wan

    const workType =
      options.imageUrl ?
      engine.image :
      engine.text

    return await this.request(
      `${CONFIG.asyncHost}/api/v1/async_task/add?${this.buildQuery()}`,
      'POST',
      {
        device_id: this.deviceId,
        prompt,
        prompt_translated: prompt,
        negative_prompt:
          options.negativePrompt || '',
        model_id: 'static',
        work_type: workType,
        width: 1024,
        height: 1024,
        ratio:
          options.ratio || '9:16',
        seed:
          options.seed ||
          Math.floor(Math.random() * 999999999999),
        priority: 0,
        batch_size: 1,
        has_face: false,
        steps: options.steps || 20,
        cfg_scale:
          options.cfgScale || 7,
        style: '',
        is4k: false,
        client_diamonds:
          options.clientDiamonds || 50,
        video_width:
          options.videoWidth || 720,
        video_height:
          options.videoHeight || 1280,
        video_duration:
          options.duration || 5,
        image_url:
          options.imageUrl || ''
      }
    )

  }

  async getVideoStatus(taskIds = []) {

    return await this.request(
      `${CONFIG.asyncHost}/api/v1/async_task/batch-status?${this.buildQuery()}`,
      'POST',
      {
        device_id: this.deviceId,
        task_ids: taskIds
      }
    )

  }

  async waitVideo(taskId, callback = null) {

    for (
      let attempt = 0;
      attempt < CONFIG.maxPoll;
      attempt++
    ) {

      await delay(CONFIG.pollInterval)

      const res =
        await this.getVideoStatus([taskId])

      const task =
        Array.isArray(res)
          ? res.find(v => v.task_id === taskId)
          : (res.tasks || []).find(
              v => v.task_id === taskId
            )

      if (!task) continue

      callback?.(
        task.status,
        task.progress || 0
      )

      if (
        task.status === 2 ||
        task.status === 'completed' ||
        task.status === 'success'
      ) {

        return task

      }

      if (
        task.status === 3 ||
        task.status === 'failed'
      ) {

        throw new Error(
          task.error_message ||
          'Video generation failed.'
        )

      }

    }

    throw new Error(
      'Video generation timeout.'
    )

  }

  async generateImage(
    prompt,
    options = {},
    callback = null
  ) {

    this.refreshGuest()

    const cfg =
      await this.getConfig()

    const diamonds =
      cfg?.account_info?.diamonds ?? 50

    const task =
      await this.createImageTask(
        prompt,
        {
          ...options,
          clientDiamonds: diamonds
        }
      )

    if (
      !task.success ||
      !task.task_id
    ) {

      throw new Error(
        'Failed create image task.'
      )

    }

    return await this.waitImage(
      task.task_id,
      callback
    )

  }

  async generateVideo(
    prompt,
    options = {},
    callback = null
  ) {

    this.refreshGuest()

    const cfg =
      await this.getConfig()

    const diamonds =
      cfg?.account_info?.diamonds ?? 50

    const task =
      await this.createVideoTask(
        prompt,
        {
          ...options,
          clientDiamonds: diamonds
        }
      )

    if (
      !task.success ||
      !task.task_id
    ) {

      throw new Error(
        'Failed create video task.'
      )

    }

    return await this.waitVideo(
      task.task_id,
      callback
    )

  }

}