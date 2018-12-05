import React from "react";
import { Helmet } from "react-helmet";

const OpenGraph = props => (
  <Helmet>
    <meta property="og:site_name" content="Dylan Staley" />
    <meta property="og:title" content={props.title} />
    <meta property="og:type" content="article" />
    <meta property="og:url" content={props.url} />
    <meta property="og:description" content={props.subtitle} />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:url" content={props.url} />
    <meta name="twitter:title" content={props.title} />
    <meta name="twitter:description" content={props.subtitle} />
    <meta name="twitter:site" content="@dstaley" />
  </Helmet>
);

export default OpenGraph;
