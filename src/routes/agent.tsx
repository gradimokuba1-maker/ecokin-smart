import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { useAccess } from "@/lib/access-store";
import { LiveReport, STATUS_META, URGENCY_META, useLiveReports } from "@/lib/eco-store";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Check, Crosshair, Loader2, MapPinned, Play, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/client-only";
import { InteractiveMap } from "@/components/interactive-map";
import { InterventionValidation } from "@/components/intervention-validation";

export const Route = createFileRoute("/agent")({
    head: () => ({
        meta: [
            { title: "Tableau de Bord Agent — EcoKin Smart" },
            { name: "description", content: "Tableau de bord opérationnel pour les agents de terrain." },
        ],
    }),
    component: () => (
        <AccessGate required={["agent"]} title="Tableau de Bord Agent">
            <AgentDashboard />
        </AccessGate>
    ),
});

function PhotoCapture({ report, type, onCapture, onClose }: { report: LiveReport, type: 'before' | 'after', onCapture: (dataUrl: string) => void, onClose: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        let isActive = true;
        (async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                if (isActive && videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    setStream(mediaStream);
                }
            } catch (err) {
                console.error("Erreur d'accès à la caméra:", err);
                onClose();
            }
        })();
        return () => {
            isActive = false;
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [onClose, stream]);

    const handleCapture = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        onCapture(canvas.toDataURL('image/jpeg', 0.8));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-2xl bg-card p-4">
                <CardTitle>Photo {type === 'before' ? 'Avant' : 'Après'} - {report.id}</CardTitle>
                <CardDescription>Cadrez la zone d'intervention.</CardDescription>
                <video ref={videoRef} autoPlay playsInline className="mt-4 aspect-video w-full rounded-lg bg-muted object-cover" />
                <div className="mt-4 flex justify-center gap-4">
                    <Button onClick={handleCapture} size="lg" className="rounded-full">
                        <Camera className="mr-2 size-5" /> Capturer
                    </Button>
                </div>
                <Button onClick={onClose} variant="ghost" size="icon" className="absolute right-2 top-2 rounded-full">
                    <X className="size-5" />
                </Button>
            </div>
        </div>
    );
}

function AgentDashboard() {
    const { session } = useAccess();
    const { items: allReports, setStatus, setPhoto } = useLiveReports();
    const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [geoStatus, setGeoStatus] = useState<"loading" | "ok" | "error">("loading");
    const [capturing, setCapturing] = useState<{ report: LiveReport, type: 'before' | 'after' } | null>(null);

    const handlePhotoCapture = (reportId: string, type: 'before' | 'after', dataUrl: string) => {
        if (session) {
            setPhoto(reportId, type, dataUrl, session.name);
        }
    };

    useEffect(() => {
        if (typeof navigator !== "undefined" && navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setGeoStatus("ok");
                },
                () => setGeoStatus("error"),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            setGeoStatus("error");
        }
    }, []);

    const assignedReports = useMemo(() => {
        return allReports.filter((r) => !session.commune || r.commune === session.commune);
    }, [allReports, session.commune]);

    const todoReports = useMemo(() => {
        return assignedReports.filter((r) => r.status === "assignee" || r.status === "en_cours");
    }, [assignedReports]);

    const doneReports = useMemo(() => {
        return assignedReports.filter((r) => r.status === "terminee");
    }, [assignedReports]);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <SiteNav />
            <main className="flex-1">
                <div className="border-b bg-card">
                    <div className="container py-8">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-eco">
                                    <UserRound className="size-4" /> Espace Agent de terrain
                                </div>
                                <h1 className="mt-2 font-display text-4xl font-bold">Tableau de Bord Opérationnel</h1>
                                <p className="mt-1 text-muted-foreground">Missions du jour, signalements et interventions de {session.commune ?? "votre commune"}.</p>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl border bg-background p-2 text-xs">
                                {geoStatus === "loading" && <><Loader2 className="size-3 animate-spin" /><span>GPS...</span></>}
                                {geoStatus === "ok" && <><Crosshair className="size-3 text-eco" /><span>GPS Actif</span></>}
                                {geoStatus === "error" && <><Crosshair className="size-3 text-red-500" /><span>GPS Inactif</span></>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container py-8">
                    <Tabs defaultValue="missions">
                        <TabsList>
                            <TabsTrigger value="missions">Missions ({todoReports.length})</TabsTrigger>
                            <TabsTrigger value="history">Historique ({doneReports.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="missions" className="mt-4">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="space-y-3">
                                    {todoReports.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Aucune mission assignée pour le moment.</p>
                                    ) : (
                                        todoReports.map((report) => (
                                            <Card key={report.id}>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center justify-between text-base">
                                                        <span>{report.id}</span>
                                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${URGENCY_META[report.urgency].bg} ${URGENCY_META[report.urgency].color}`}>{URGENCY_META[report.urgency].label}</span>
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground capitalize">{report.category} · {report.commune}</p>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <p className="text-xs text-muted-foreground">{report.description}</p>
                                                </CardContent>
                                                <CardFooter className="flex flex-wrap gap-2">
                                                    <InterventionValidation
                                                        report={report}
                                                        onStart={() => setStatus(report.id, 'en_cours', session.name)}
                                                        onCaptureBefore={() => setCapturing({ report, type: 'before' })}
                                                        onCaptureAfter={() => setCapturing({ report, type: 'after' })}
                                                        onComplete={() => setStatus(report.id, 'terminee', session.name)}
                                                    />
                                                </CardFooter>
                                            </Card>
                                        ))
                                    )}
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><MapPinned className="size-4" /> Carte des missions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ClientOnly fallback={<div className="h-[400px] animate-pulse rounded-lg bg-muted" />}>
                                            <InteractiveMap commune={session.commune} reports={todoReports} />
                                        </ClientOnly>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="history" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Interventions terminées</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="divide-y divide-border">
                                        {doneReports.map((report) => (
                                            <li key={report.id} className="py-3">
                                                <p className="font-semibold">{report.id} · {report.category}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(report.history.find(h => h.label.includes("terminee"))?.at ?? report.createdAt).toLocaleString('fr-FR')}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {capturing && (
                    <PhotoCapture report={capturing.report} type={capturing.type} onClose={() => setCapturing(null)} onCapture={(dataUrl) => handlePhotoCapture(capturing.report.id, capturing.type, dataUrl)} />
                )}
            </main>
            <SiteFooter />
        </div>
    );
}
