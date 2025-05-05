import Image from "next/image";
import VFRModal from "./components/VFRModal";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Visual Feature Recognition (VFR) Demo</h1>
      <VFRModal />
    </main>
  );
}
