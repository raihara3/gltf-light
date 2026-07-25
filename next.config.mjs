/** @type {import('next').NextConfig} */
const nextConfig = {
  // @gltf-transform/core's entry pulls in NodeIO (node:fs). It only runs inside
  // the optimize Web Worker, so stub the `node:` builtins for the browser
  // bundle. (Validated in the #30 PoC.)
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
