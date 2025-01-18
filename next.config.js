module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://cms1.creatorsmela.com/:path*", // Proxy to the backend
      },
    ];
  },
};
