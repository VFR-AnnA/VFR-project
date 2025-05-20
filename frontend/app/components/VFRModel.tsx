import { Html } from "@react-three/drei";
// …(overige imports)

export default function VFRModel(/* props */) {
  // …(overige logica)
  return (
    <>
      {/* 3D mesh */}
      <mesh /* geometry & material props */ />
      {/* Loading / fallback overlay */}
      <Html center>
        <span style={{ color: "#fff", fontSize: "12px" }}>Loading…</span>
      </Html>
    </>
  );
}