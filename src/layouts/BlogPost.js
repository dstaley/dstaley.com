import React, { Component } from "react";
import { graphql } from "gatsby";
import styled from "@emotion/styled";
import { Helmet } from "react-helmet";
import DefaultLayout from "./DefaultLayout";
import OpenGraph from "../components/OpenGraph";
import syntaxHighlighting from "../syntaxHighlighting";
import PostHeader from "../components/PostHeader";
import HomeLink from "../components/HomeLink";

const PostHeaderContainer = styled("header")`
  font-size: 18px;
`;

const PostBody = styled("main")`
  & img {
    max-width: 100%;
  }

  & .gigabit-map {
    margin: 0;

    iframe {
      width: 100%;
      height: 500px;
      border: 0;
    }

    figcaption {
      text-align: right;
      font-style: italic;
      color: #808080;
      font-size: 12px;
    }

    a {
      color: lighten($body-color, 30%);

      &:hover {
        color: $body-color;
      }
    }
  }

  & pre {
    border: 1px solid #e5e9ef;
    padding: 0.5rem;
    font-size: 0.75rem;
    overflow-x: scroll;

    & code {
      background: none;
    }
  }

  & code {
    font-family: Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
      monospace;
    white-space: pre-wrap;
    background: #f3f3f3;
  }

  ${props => (props.hasCode ? syntaxHighlighting : null)}
`;

const Header = ({ slug, date, permalink, title, subtitle }) => (
  <PostHeaderContainer>
    <HomeLink />
    <PostHeader
      slug={slug}
      date={date}
      permalink={permalink}
      title={title}
      subtitle={subtitle}
      isPostPage={true}
    />
  </PostHeaderContainer>
);

class BlogPostTemplate extends Component {
  render() {
    const post = this.props.data.markdownRemark;

    return (
      <DefaultLayout>
        <Helmet>
          <title>{post.frontmatter.title}</title>
          <meta name="description" content={post.frontmatter.subtitle} />
          <meta name="theme-color" content="tomato" />
        </Helmet>
        {post.frontmatter.hasOpengraph ? (
          <OpenGraph
            title={post.frontmatter.title}
            subtitle={post.frontmatter.subtitle}
            url={`${this.props.data.site.siteMetadata.url}${
              post.fields.permalink
            }`}
          />
        ) : null}
        <Header
          slug={post.fields.slug}
          date={post.frontmatter.date}
          permalink={post.fields.permalink}
          title={post.frontmatter.title}
          subtitle={post.frontmatter.subtitle}
        />
        <PostBody
          hasCode={post.frontmatter.hasCode}
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </DefaultLayout>
    );
  }
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        url
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      fields {
        permalink
        slug
      }
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        subtitle
        hasCode
        hasOpengraph
      }
    }
  }
`;
