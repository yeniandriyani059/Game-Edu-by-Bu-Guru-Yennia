import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

export interface SinglePoseResult {
  screenX: number; // 0.0 (Kiri Layar) s/d 1.0 (Kanan Layar) - sudah disinkronkan dengan mirror layar
  screenY: number; // 0.0 (Atas) s/d 1.0 (Bawah)
  rawCameraX: number; // Koordinat asli sensor kamera
  zone: 'LEFT' | 'CENTER' | 'RIGHT';
  isDetected: boolean;
  confidence: number;
  engine: 'mediapipe' | 'motion';
  debugStatus: 'ZONA KIRI (BENAR)' | 'ZONA TENGAH (BERSIAP)' | 'ZONA KANAN (SALAH)' | 'MENUNGGU PEMAIN';
}

export class BodyPoseTracker {
  private poseLandmarker: PoseLandmarker | null = null;
  private isInitializing: boolean = false;
  private isLoaded: boolean = false;
  private lastSmoothedX: number = 0.5;
  private lastSmoothedY: number = 0.4;
  private lastVideoTime: number = -1;

  // Offscreen canvas untuk fallback pendeteksi gerakan (motion detector)
  private fallbackCanvas: HTMLCanvasElement | null = null;
  private fallbackCtx: CanvasRenderingContext2D | null = null;
  private prevFrameData: Uint8ClampedArray | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.fallbackCanvas = document.createElement('canvas');
      this.fallbackCanvas.width = 96;
      this.fallbackCanvas.height = 64;
      this.fallbackCtx = this.fallbackCanvas.getContext('2d', { willReadFrequently: true });
    }
  }

  /**
   * Inisialisasi model MediaPipe PoseLandmarker untuk 1 orang (maxPoses: 1)
   */
  public async initMediaPipe(): Promise<boolean> {
    if (this.isLoaded) return true;
    if (this.isInitializing) return false;
    this.isInitializing = true;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      // MODE 1 PEMAIN (maxPoses: 1): Model Lite (Complexity: 0) teringan untuk prosesor Smart TV / IFP
      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task', // Versi Lite (Complexity: 0)
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1, // KUNCI 1 PEMAIN SAJA (maxPoses: 1)
        minPoseDetectionConfidence: 0.85, // Nilai 0.85 (Abaikan Benda Mati / Sandaran Kursi / Topi)
        minPosePresenceConfidence: 0.85,
        minTrackingConfidence: 0.85, // Nilai 0.85
      });

      this.isLoaded = true;
      this.isInitializing = false;
      return true;
    } catch (err) {
      console.warn('MediaPipe initialization warning (using high-speed motion fallback):', err);
      this.isInitializing = false;
      return false;
    }
  }

  /**
   * Evaluasi pose 1 pemain di layar penuh:
   * Layar dibagi 3 zona:
   * - KIRI: 0.00 s/d leftBoundary (default 0.38) -> JAWABAN BENAR
   * - TENGAH: leftBoundary s/d rightBoundary (0.38 s/d 0.62) -> ZONA NETRAL / BERSIAP
   * - KANAN: rightBoundary s/d 1.00 (default 0.62) -> JAWABAN SALAH
   *
   * FISIKA MIRROR KAMERA:
   * Tampilan video di-flip horizontal dengan CSS -scale-x-100 (efek cermin alami).
   * Ketika anak melompat ke KIRI FISIK:
   * Sensor kamera menangkap tubuh di sebelah kanan gambar (rawX > 0.5).
   * Pada layar cermin: screenX = 1.0 - rawX akan bernilai < 0.38 (KIRI LAYAR).
   * Maka sistem membaca: ZONA KIRI (BENAR)!
   */
  public processSinglePlayerFrame(
    video: HTMLVideoElement,
    invertMirror: boolean = false,
    leftBoundary: number = 0.38,
    rightBoundary: number = 0.62
  ): SinglePoseResult {
    const defaultResult: SinglePoseResult = {
      screenX: this.lastSmoothedX,
      screenY: this.lastSmoothedY,
      rawCameraX: 0.5,
      zone: 'CENTER',
      isDetected: false,
      confidence: 0,
      engine: this.isLoaded ? 'mediapipe' : 'motion',
      debugStatus: 'MENUNGGU PEMAIN',
    };

    if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return defaultResult;
    }

    if (this.isLoaded && this.poseLandmarker) {
      try {
        const currentTime = video.currentTime;
        if (currentTime !== this.lastVideoTime) {
          this.lastVideoTime = currentTime;
          const results = this.poseLandmarker.detectForVideo(video, performance.now());

          if (results.landmarks && results.landmarks.length > 0 && results.landmarks[0].length > 0) {
            const lm = results.landmarks[0];
            const nose = lm[0];
            const leftShoulder = lm[11];
            const rightShoulder = lm[12];

            let rawX: number;
            let rawY: number;
            let conf = 0;

            const noseVis = nose?.visibility !== undefined ? nose.visibility : 0.90;
            const leftShoulderVis = leftShoulder?.visibility !== undefined ? leftShoulder.visibility : 0.90;
            const rightShoulderVis = rightShoulder?.visibility !== undefined ? rightShoulder.visibility : 0.90;

            // Verifikasi keyakinan tinggi (min 0.85) agar hanya merespons tubuh manusia asli
            // Abaikan benda mati (sandaran kursi, topi, dll.)
            if (nose && noseVis >= 0.85) {
              rawX = nose.x;
              rawY = nose.y;
              conf = noseVis;
            } else if (leftShoulder && rightShoulder && (leftShoulderVis >= 0.85 || rightShoulderVis >= 0.85)) {
              rawX = (leftShoulder.x + rightShoulder.x) / 2;
              rawY = (leftShoulder.y + rightShoulder.y) / 2;
              conf = (leftShoulderVis + rightShoulderVis) / 2;
            } else {
              // Tingkat keyakinan di bawah 0.85 -> Abaikan objek benda mati!
              return defaultResult;
            }

            // Hitung koordinat layar mirrored
            // Standar: screenX = 1 - rawX (karena video di-mirror dengan CSS -scale-x-100)
            const targetScreenX = invertMirror ? rawX : 1.0 - rawX;
            const targetScreenY = rawY;

            // Smoothing exponential moving average
            const alpha = 0.45;
            this.lastSmoothedX = this.lastSmoothedX * (1 - alpha) + targetScreenX * alpha;
            this.lastSmoothedY = this.lastSmoothedY * (1 - alpha) + targetScreenY * alpha;

            const curX = Math.max(0.02, Math.min(0.98, this.lastSmoothedX));
            const curY = Math.max(0.05, Math.min(0.95, this.lastSmoothedY));

            let zone: 'LEFT' | 'CENTER' | 'RIGHT' = 'CENTER';
            let debugStatus: SinglePoseResult['debugStatus'] = 'ZONA TENGAH (BERSIAP)';

            if (curX < leftBoundary) {
              zone = 'LEFT';
              debugStatus = 'ZONA KIRI (BENAR)';
            } else if (curX > rightBoundary) {
              zone = 'RIGHT';
              debugStatus = 'ZONA KANAN (SALAH)';
            } else {
              zone = 'CENTER';
              debugStatus = 'ZONA TENGAH (BERSIAP)';
            }

            return {
              screenX: curX,
              screenY: curY,
              rawCameraX: rawX,
              zone,
              isDetected: true,
              confidence: conf,
              engine: 'mediapipe',
              debugStatus,
            };
          }
        } else {
          // Frame video belum berubah, kembalikan posisi smoothed terakhir
          const curX = this.lastSmoothedX;
          let zone: 'LEFT' | 'CENTER' | 'RIGHT' = 'CENTER';
          if (curX < leftBoundary) zone = 'LEFT';
          else if (curX > rightBoundary) zone = 'RIGHT';

          return {
            screenX: curX,
            screenY: this.lastSmoothedY,
            rawCameraX: 0.5,
            zone,
            isDetected: true,
            confidence: 0.8,
            engine: 'mediapipe',
            debugStatus:
              zone === 'LEFT'
                ? 'ZONA KIRI (BENAR)'
                : zone === 'RIGHT'
                ? 'ZONA KANAN (SALAH)'
                : 'ZONA TENGAH (BERSIAP)',
          };
        }
      } catch (err) {
        console.warn('Pose tracking frame warning:', err);
      }
    }

    // Gunakan fallback deteksi gerakan hanya jika MediaPipe belum berhasil dimuat
    if (!this.isLoaded) {
      return this.fallbackMotionDetection(video, invertMirror, leftBoundary, rightBoundary);
    }

    return defaultResult;
  }

  /**
   * Optical Motion Detection Fallback
   */
  private fallbackMotionDetection(
    video: HTMLVideoElement,
    invertMirror: boolean,
    leftBoundary: number,
    rightBoundary: number
  ): SinglePoseResult {
    if (!this.fallbackCanvas || !this.fallbackCtx) {
      return {
        screenX: 0.5,
        screenY: 0.4,
        rawCameraX: 0.5,
        zone: 'CENTER',
        isDetected: false,
        confidence: 0,
        engine: 'motion',
        debugStatus: 'MENUNGGU PEMAIN',
      };
    }

    const w = this.fallbackCanvas.width;
    const h = this.fallbackCanvas.height;

    this.fallbackCtx.drawImage(video, 0, 0, w, h);
    const frame = this.fallbackCtx.getImageData(0, 0, w, h);
    const data = frame.data;

    if (!this.prevFrameData || this.prevFrameData.length !== data.length) {
      this.prevFrameData = new Uint8ClampedArray(data);
      return {
        screenX: this.lastSmoothedX,
        screenY: 0.4,
        rawCameraX: 0.5,
        zone: 'CENTER',
        isDetected: false,
        confidence: 0,
        engine: 'motion',
        debugStatus: 'MENUNGGU PEMAIN',
      };
    }

    let leftEnergy = 0;
    let centerEnergy = 0;
    let rightEnergy = 0;

    const leftCut = Math.floor(w * leftBoundary);
    const rightCut = Math.floor(w * rightBoundary);

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const idx = (y * w + x) * 4;
        const diff =
          Math.abs(data[idx] - this.prevFrameData[idx]) +
          Math.abs(data[idx + 1] - this.prevFrameData[idx + 1]) +
          Math.abs(data[idx + 2] - this.prevFrameData[idx + 2]);

        if (diff > 45) {
          if (x < leftCut) leftEnergy++;
          else if (x > rightCut) rightEnergy++;
          else centerEnergy++;
        }
      }
    }

    this.prevFrameData = new Uint8ClampedArray(data);

    // Pada kamera cermin: energi kamera kiri adalah layar kanan, energi kamera kanan adalah layar kiri
    let displayLeftEnergy = invertMirror ? leftEnergy : rightEnergy;
    let displayRightEnergy = invertMirror ? rightEnergy : leftEnergy;

    let targetX = 0.5;
    let zone: 'LEFT' | 'CENTER' | 'RIGHT' = 'CENTER';

    const maxEnergy = Math.max(displayLeftEnergy, centerEnergy, displayRightEnergy);

    if (maxEnergy > 30) {
      if (displayLeftEnergy === maxEnergy && displayLeftEnergy > centerEnergy * 1.25) {
        targetX = 0.22;
        zone = 'LEFT';
      } else if (displayRightEnergy === maxEnergy && displayRightEnergy > centerEnergy * 1.25) {
        targetX = 0.78;
        zone = 'RIGHT';
      } else {
        targetX = 0.50;
        zone = 'CENTER';
      }
    }

    this.lastSmoothedX = this.lastSmoothedX * 0.7 + targetX * 0.3;

    return {
      screenX: this.lastSmoothedX,
      screenY: 0.4,
      rawCameraX: 0.5,
      zone,
      isDetected: maxEnergy > 15,
      confidence: 0.5,
      engine: 'motion',
      debugStatus:
        zone === 'LEFT'
          ? 'ZONA KIRI (BENAR)'
          : zone === 'RIGHT'
          ? 'ZONA KANAN (SALAH)'
          : 'ZONA TENGAH (BERSIAP)',
    };
  }

  public resetPosition(): void {
    this.lastSmoothedX = 0.5;
    this.lastSmoothedY = 0.4;
  }
}

export const poseTracker = new BodyPoseTracker();
