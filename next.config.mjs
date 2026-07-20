/** @type {import('next').NextConfig} */
const nextConfig = {
  // PoC #30: @gltf-transform/core's index pulls in NodeIO (node:fs). Stub the
  // `node:` builtins so it bundles for the browser/worker. (PoC branch only.)
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "");
      })
    );
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      url: false,
    };
    return config;
  },
};

export default nextConfig;
