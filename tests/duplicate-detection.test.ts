import assert from "node:assert/strict";
import test from "node:test";
import { evaluateDuplicateReport } from "../src/lib/duplicate-detection.ts";

test("detects nearby active reports with strong image similarity", () => {
    const reports = [
        {
            id: "ECO-SIG-1",
            commune: "kinshasa",
            status: "en_cours",
            lat: -4.3508,
            lng: 15.3086,
            createdAt: new Date().toISOString(),
            history: [],
            ack: false,
        },
    ] as any;

    const result = evaluateDuplicateReport({
        reports,
        lat: -4.35085,
        lng: 15.30862,
        hash: "0000000000000000",
        imageSimilarity: 98,
    });

    assert.ok(result?.candidate);
    assert.equal(result?.candidate?.id, "ECO-SIG-1");
    assert.equal(result?.reason, "nearby_active");
});

test("uses the stored image hash when the signatures match", () => {
    const reports = [
        {
            id: "ECO-SIG-2",
            commune: "kinshasa",
            status: "en_cours",
            lat: -4.3508,
            lng: 15.3086,
            createdAt: new Date().toISOString(),
            history: [],
            ack: false,
            imageHash: "0000000000000000",
        },
    ] as any;

    const result = evaluateDuplicateReport({
        reports,
        lat: -4.35085,
        lng: 15.30862,
        hash: "0000000000000000",
    });

    assert.ok(result?.candidate);
    assert.equal(result?.candidate?.id, "ECO-SIG-2");
});

test("does not flag completed reports", () => {
    const reports = [
        {
            id: "ECO-SIG-3",
            commune: "kinshasa",
            status: "terminee",
            lat: -4.3508,
            lng: 15.3086,
            createdAt: new Date().toISOString(),
            history: [],
            ack: true,
        },
    ] as any;

    const result = evaluateDuplicateReport({
        reports,
        lat: -4.35085,
        lng: 15.30862,
        hash: "0000000000000000",
        imageSimilarity: 98,
    });

    assert.equal(result, null);
});
