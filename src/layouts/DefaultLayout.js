import React, { Fragment } from "react";
import styled from "@emotion/styled";
import { Global } from "@emotion/core";
import { Helmet } from "react-helmet";

const globalStyle = {
  html: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: "18px",
    lineHeight: "1.75rem",
    color: "#444444"
  },
  a: {
    color: "tomato",
    textDecoration: "none",
    fontWeight: "bold",
    "&:hover": {
      textDecoration: "underline"
    },
    "&:visited": {
      color: "tomato"
    }
  },
  h1: {
    color: "black",
    fontSize: "3rem",
    lineHeight: "3.25rem"
  },
  h2: { color: "black" }
};

const Container = styled("div")`
  margin: 0 auto;
  padding: 0 20px;
  padding-top: 60px;
  margin-bottom: 12rem;

  @media screen and (min-width: 1024px) {
    width: 650px;
  }
`;

const DefaultLayout = props => (
  <Fragment>
    <Helmet>
      <link rel="shortcut icon" href="/img/rocket.png" />
    </Helmet>
    <Global styles={globalStyle} />
    <Container>{props.children}</Container>
  </Fragment>
);

export default DefaultLayout;
