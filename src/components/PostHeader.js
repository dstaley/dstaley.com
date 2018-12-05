import React from "react";
import Link from "gatsby-link";
import styled from "@emotion/styled";

const PostListItem = styled("div")`
  a {
    text-decoration: none;
    color: inherit;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Meta = styled("p")`
  margin: 0;
  margin-top: 45px;
  font-size: 0.75rem;
`;

const MainTitle = styled("h1")`
  margin-top: 7px;
  margin-bottom: 7px;
`;

const Title = styled("h2")`
  margin-top: 7px;
  margin-bottom: 7px;
`;

const Subtitle = styled("p")`
  margin: 0;
  color: ${({ isPostPage }) => (isPostPage ? "#808080" : "inherit")};
`;

const PostHeader = ({
  slug,
  date,
  permalink,
  title,
  subtitle,
  isPostPage = false
}) => {
  return (
    <PostListItem key={slug}>
      <Meta>{date}</Meta>
      {isPostPage ? (
        <MainTitle>{title}</MainTitle>
      ) : (
        <Link to={permalink}>
          <Title>{title}</Title>
        </Link>
      )}
      <Subtitle isPostPage={isPostPage}>{subtitle}</Subtitle>
    </PostListItem>
  );
};

export default PostHeader;
