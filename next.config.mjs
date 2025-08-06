/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    async headers() {
        return [
          {
            source: '/favicon.ico',
            headers: [
              {
                key: 'Content-Type',
                value: 'image/x-icon',
              },
            ],
          },
        ];
      },
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: "/restake/:path*",
                    destination: "https://restakeapi.com/:path*",
                },
            ],
        };
    },
    // async redirects() {
    //     return [
    //         {
    //             source: "/optimism-retropgf-3",
    //             destination: "/trackers/optimism-retropgf-3",
    //             permanent: true,
    //         },
    //     ];
    // },
};

export default nextConfig;
