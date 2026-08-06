import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { serverWasteAIAdapter } from '../src/lib/waste-ai/adapters/server-adapter';

function makeFetchResponse(obj: any) {
    return Promise.resolve({
        ok: true,
        json: async () => ({ choices: [{ message: { content: JSON.stringify(obj) } }] }),
        text: async () => JSON.stringify(obj),
    } as any);
}

describe('serverWasteAIAdapter', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
        process.env = { ...OLD_ENV, LOVABLE_API_KEY: 'test' };
    });
    afterEach(() => {
        process.env = OLD_ENV;
        // @ts-ignore
        delete global.fetch;
    });

    it('maps plastic labels to plastique', async () => {
        // @ts-ignore
        global.fetch = () => makeFetchResponse({ objects: [{ label: 'plastic bottle', confidence: 0.9, bbox: [0.1, 0.1, 0.2, 0.2] }] });
        const res = await serverWasteAIAdapter.detect('data:image/png;PLASTIC_TEST', {});
        expect(res.objects.length).toBeGreaterThan(0);
        expect(res.objects[0].label).toBe('plastique');
    });

    it('maps glass labels to verre', async () => {
        // @ts-ignore
        global.fetch = () => makeFetchResponse({ objects: [{ label: 'glass bottle', confidence: 0.85, bbox: [0.2, 0.2, 0.4, 0.4] }] });
        const res = await serverWasteAIAdapter.detect('data:image/png;GLASS_TEST', {});
        expect(res.objects.length).toBeGreaterThan(0);
        expect(res.objects[0].label).toBe('verre');
    });
});
