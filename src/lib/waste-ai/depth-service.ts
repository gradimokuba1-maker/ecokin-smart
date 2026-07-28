export interface DepthAcquisition {
  source: "lidar" | "tof" | "arcore" | "arkit" | "ai";
  label: string;
  supported: boolean;
  depthData?: Float32Array | ImageData | Blob;
  confidence?: number;
  resolution?: {
    width: number;
    height: number;
  };
}
