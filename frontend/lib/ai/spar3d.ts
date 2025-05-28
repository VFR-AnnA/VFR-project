export async function generateSpar3d(img: File, prompt: string) {
  const form = new FormData();
  form.append("image", img);
  form.append("prompt", prompt);
  const res = await fetch("http://localhost:3005/generate", {
    method: "POST",
    body: form,
  });
  const blob = await res.blob();
  return URL.createObjectURL(blob);       // browser-URL voor <ModelViewer/>
}