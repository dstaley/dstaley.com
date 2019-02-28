module.exports = {
  siteMetadata: {
    title: "Dylan Staley",
    url: "https://dstaley.com",
    siteUrl: "https://dstaley.com",
    description: "Dylan Staley, Web Developer and purveyor of cute puppy pics."
  },
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/src/posts`,
        name: "posts"
      }
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: ["gatsby-remark-prismjs"]
      }
    },
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-emotion",
    "gatsby-plugin-netlify",
    {
      resolve: `gatsby-plugin-feed`
    }
  ]
};
