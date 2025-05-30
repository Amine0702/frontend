/** @type {import('next').NextConfig} */
module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  async redirects() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "mdwnext.tn",
          },
        ],
        destination: "https://www.mdwnext.tn",
        permanent: true,
      },
    ];
  },
};
