import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "Piggy Back",
    short_name: "Piggy Back",
    description: "Mua sắm hoàn tiền cùng Piggy Back",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#fff8f8",
    theme_color: "#a8245e",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
