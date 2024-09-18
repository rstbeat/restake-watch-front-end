/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: "/restake/:path*",
                    destination: "https://jnt1ylgihi.execute-api.us-east-1.amazonaws.com/prod/:path*",
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
