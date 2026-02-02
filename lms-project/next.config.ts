/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "neo-lms.t3.storage.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, {isServer}) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
  reactCompiler: true,
};

export default nextConfig;
