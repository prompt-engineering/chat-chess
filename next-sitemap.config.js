/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://chess.fluoritestudio.com/",
  generateRobotsTxt: true, // (optional)
  // ...other options
};
