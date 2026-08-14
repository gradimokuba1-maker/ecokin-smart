export type WasteDetectionAnalysis = {
  dominantCategory: import("./types").WasteMaterial;
  secondaryCategories: import("./types").WasteMaterial[];
  confidence: number;
  comment: string;
  provider: "lovable-vision" | "rule-based";
};
