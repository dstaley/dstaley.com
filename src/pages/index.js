import React from "react";
import { graphql } from "gatsby";
import styled from "@emotion/styled";
import { Helmet } from "react-helmet";
import DefaultLayout from "../layouts/DefaultLayout";
import PostList from "../components/PostList";
import ProfilePicture from "../components/ProfilePicture";

const Header = styled("header")`
  text-align: center;
  @media (min-width: 1024px) {
    text-align: left;
  }
`;

const MyName = styled("h1")`
  margin: 0;
  margin-bottom: 0.5rem;
  font-size: 3rem;
  line-height: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (min-width: 1024px) {
    flex-direction: row;
    justify-content: flex-start;
  }
  & img {
    width: 75px;
    border-radius: 75px;
    margin-right: 25px;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.15), 0 4px 4px 0 rgba(0, 0, 0, 0.1),
      0 -0.1px 3px 0 rgba(0, 0, 0, 0.08);
  }
`;

const Links = styled("p")`
  font-size: 0.8rem;
  margin-top: 0;

  & a {
    margin-right: 10px;
  }
`;

const Bio = styled("p")`
  margin-bottom: 4rem;
`;

const IndexPage = props => (
  <DefaultLayout>
    <Helmet>
      <title>{props.data.site.siteMetadata.title}</title>
      <meta
        name="description"
        content={props.data.site.siteMetadata.description}
      />
      <link rel="canonical" href={props.data.site.siteMetadata.url} />
      <meta name="theme-color" content="tomato" />
    </Helmet>
    <Header>
      <MyName>
        <ProfilePicture />
        Dylan Staley
      </MyName>
      <Links>
        <a href="https://twitter.com/dstaley">twitter</a>{" "}
        <a href="https://github.com/dstaley">github</a>{" "}
      </Links>
    </Header>

    <Bio>
      Hey there, my name's Dylan, and I currently reside in Eastern Washington,
      where I live with my corgi{" "}
      <a href="https://twitter.com/jpegthecorgi">Jpeg</a>. Currently, I'm
      breaking things on the web at <a href="https://andyet.com/">&amp;yet</a>.
      Previously, I was a Systems Engineer at{" "}
      <a href="https://maruccisports.com/">Marucci Sports</a>.
    </Bio>
    <PostList posts={props.data.allMarkdownRemark.edges} />
  </DefaultLayout>
);

export default IndexPage;

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        url
        title
        description
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            permalink
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            subtitle
          }
        }
      }
    }
  }
`;
