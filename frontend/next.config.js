/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // در صورت نیاز به ترجمه مسیرها می‌توانید i18n را اضافه کنید، اما برای RTL نیاز نیست
  reactStrictMode: true,
};

module.exports = nextConfig;