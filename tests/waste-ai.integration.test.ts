import { describe, it, expect } from 'vitest';
import { quantifyWaste } from '../src/lib/waste-ai/quantification-pipeline';

// Fake adapter that returns deterministic detection/segmentation/volume
const mockAdapter = {
    detect: async (imageDataUrl: string, _opts: any) => {
        const isPlastic = imageDataUrl.includes('PLASTIC');
        const objects = [
            {
                classId: 0,
                label: isPlastic ? 'plastique' : 'verre',
                displayLabel: isPlastic ? 'plastiques' : 'verre',
                confidence: 0.92,
                bbox: { x: 0.5, y: 0.5, width: 0.2, height: 0.2 },
                area: 0.04,
            },
        ];
        return {
            objects,
            totalObjects: objects.length,
            imageWidth: 800,
            imageHeight: 600,
            processingTimeMs: 10,
            modelUsed: 'yolo11' as const,
            confidence: 0.92,
        };
    },
    segment: async (_imageDataUrl: string, detections: any[]) => {
        // one segment corresponding to the detected object
        const seg = detections.map((d: any, i: number) => ({
            id: `s${i}`,
            label: d.displayLabel === 'verre' ? 'verre' : 'plastique',
            areaRatio: 0.6,
            confidence: 0.9,
        }));
        return {
            segments: seg,
            totalSegments: seg.length,
            wasteAreaRatio: 0.6,
            confidence: 0.9,
            modelUsed: 'sam2',
        };
    },
    estimateVolume: async (_imageDataUrl: string, _segments: any[]) => {
        return {
            dimensions: {
                lengthM: 2,
                widthM: 1,
                heightAvgM: 0.5,
                surfaceM2: 2,
                volumeM3: 1,
                confidence: 0.8,
            },
            method: 'estimation' as const,
            confidence: 0.8,
        };
    },
};

describe('Waste AI integration (adapter-based)', () => {
    it('classifies PLASTIC image as plastique', async () => {
        const res = await quantifyWaste('data:image/png;PLASTIC', { adapter: mockAdapter });
        expect(res.categories.main).toBe('plastique');
        expect(res.categories.composition[0].material).toBe('plastique');
        expect(res.categories.composition[0].percentage).toBeGreaterThan(0);
    });

    it('classifies GLASS image as verre and differs from PLASTIC', async () => {
        const resPlastic = await quantifyWaste('data:image/png;PLASTIC', { adapter: mockAdapter });
        const resGlass = await quantifyWaste('data:image/png;GLASS', { adapter: mockAdapter });

        expect(resGlass.categories.main).toBe('verre');
        expect(resGlass.categories.main).not.toBe(resPlastic.categories.main);
    });

    it('does not default to mixte for deterministic adapter results', async () => {
        const res = await quantifyWaste('data:image/png;PLASTIC', { adapter: mockAdapter });
        expect(res.categories.main).not.toBe('mixte');
    });
});
