import React from "react";
import { graphql } from "gatsby";
import { Helmet } from "react-helmet";
import DefaultLayout from "../layouts/DefaultLayout";
import HomeLink from "../components/HomeLink";

const NotFoundPage = props => (
  <DefaultLayout>
    <Helmet>
      <title>{`Not Found - ${props.data.site.siteMetadata.title}`}</title>
      <meta
        name="description"
        content={props.data.site.siteMetadata.description}
      />
      <link rel="canonical" href={props.data.site.siteMetadata.url} />
    </Helmet>
    <HomeLink />
    <h1>Thonk!</h1>
    <p>
      Terribly sorry, but it would seem that the page you've requested doesn't
      exist in this version of reality.
    </p>
  </DefaultLayout>
);

export default NotFoundPage;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        url
        title
        description
      }
    }
  }
`;
