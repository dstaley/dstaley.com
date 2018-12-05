import React from "react";
import styled from "@emotion/styled";
import PostHeader from "./PostHeader";

const PostListContainer = styled("div")``;

const PostList = props => {
  return (
    <PostListContainer>
      {props.posts.map(({ node }) => (
        <PostHeader
          key={node.fields.slug}
          date={node.frontmatter.date}
          permalink={node.fields.permalink}
          title={node.frontmatter.title}
          subtitle={node.frontmatter.subtitle}
        />
      ))}
    </PostListContainer>
  );
};

export default PostList;
