import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mi Libertad Financiera",
    short_name: "Mi Libertad",
    description: "Sistema personal de gestión de deudas y amortización hacia la libertad financiera",
    start_url: "/",
    display: "standalone",
    background_color: "#070D1A",
    theme_color: "#070D1A",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
