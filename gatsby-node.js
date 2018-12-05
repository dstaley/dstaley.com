const _ = require("lodash");
const path = require("path");
const { createFilePath } = require("gatsby-source-filesystem");

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

function calculatePath(frontmatter) {
  const postDate = new Date(frontmatter.date);
  const postTitle = frontmatter.title;
  const slug = slugify(postTitle);

  return `/${postDate.getUTCFullYear()}/${(postDate.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}/${postDate
    .getUTCDate()
    .toString()
    .padStart(2, "0")}/${slug}/`;
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return new Promise((resolve, reject) => {
    const blogPost = path.resolve("./src/layouts/BlogPost.js");
    resolve(
      graphql(
        `
          {
            allMarkdownRemark(
              sort: { fields: [frontmatter___date], order: DESC }
              limit: 1000
            ) {
              edges {
                node {
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                    date
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors);
          reject(result.errors);
        }

        // Create blog posts pages.
        const posts = result.data.allMarkdownRemark.edges;

        _.each(posts, (post, index) => {
          const pathToPost = calculatePath(post.node.frontmatter);

          createPage({
            path: pathToPost,
            component: blogPost,
            context: {
              slug: post.node.fields.slug
            }
          });
        });
      })
    );
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const pathToPost = calculatePath(node.frontmatter);
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value
    });
    createNodeField({
      name: "permalink",
      node,
      value: pathToPost
    });
  }
};
