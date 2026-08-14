export interface DepthAcquisition {
  source: "lidar" | "arcore" | "ai";
  label: string;
  supported: boolean;
  depthData?: string | Float32Array | ImageData | Blob;
  confidence?: number;
  resolution?: {
    width: number;
    height: number;
  };
}
