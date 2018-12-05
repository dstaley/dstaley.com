import React from "react";
import styled from "@emotion/styled";
import Link from "gatsby-link";

const Container = styled("div")`
  position: absolute;
  top: 1rem;
  left: 1rem;

  & a {
    text-decoration: none;
  }
`;

const HomeLink = () => (
  <Container>
    <Link to="/">&lt; Home</Link>
  </Container>
);

export default HomeLink;
