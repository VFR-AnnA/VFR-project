"use client";
import { useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";

const ASSET_BASE = 'https://vfr-edge.vfravater.workers.dev';
const USE_CLOUDFLARE = true;

function ProgressiveModel({ stubUrl, fullUrl }: { stubUrl: string; fullUrl: string }) {
  const stub = useGLTF(stubUrl);
  const full = useGLTF(fullUrl);

  const [model, setModel] = useState(stub);

  useEffect(() => {
    setModel(full);
  }, [full]);

  return <primitive object={model.scene} />;
}

export default function VFRViewer() {
  return (
    <Suspense fallback={null}>
      <ProgressiveModel
        stubUrl={`${ASSET_BASE}/mannequin-stub.glb`}
        fullUrl={`${ASSET_BASE}/mannequin-draco.glb`}
      />
    </Suspense>
  );
}

useGLTF.preload(`${ASSET_BASE}/mannequin-stub.glb`);
useGLTF.preload(`${ASSET_BASE}/mannequin-draco.glb`);
