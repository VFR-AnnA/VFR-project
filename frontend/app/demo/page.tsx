// Redirect de gebruiker direct naar de Body-AI-viewer
import { redirect } from 'next/navigation';

export default function DemoRedirect() {
  redirect('/try/body-ai');   // ⬅ gewenste route
  return null;                // geen content meer renderen
}