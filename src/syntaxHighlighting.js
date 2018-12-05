import { css } from "@emotion/core";

const syntaxHighlighting = css`
  pre[class*="language-"] > code[class*="language-"] {
    color: #abb2bf;
    background: none;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    tab-size: 4;
    hyphens: none;
    padding: 0;
  }

  pre[class="language-js"] > code[class="language-js"] {
    color: #e06c75;
  }

  pre[class*="language-"] {
    background-color: #282c34;
  }

  code {
    padding: 0.2em 0.4em;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #5c6370;
  }

  .token.punctuation {
    color: #abb2bf;
  }

  .token.selector,
  .token.tag {
    color: #e06c75;
  }

  .token.property,
  .token.boolean,
  .token.number,
  .token.constant,
  .token.symbol,
  .token.attr-name,
  .token.deleted {
    color: #d19a66;
  }

  .token.string,
  .token.char,
  .token.attr-value,
  .token.builtin,
  .token.inserted {
    color: #98c379;
  }

  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: #56b6c2;
  }

  .token.atrule,
  .token.keyword {
    color: #c678dd;
  }

  .token.function {
    color: #61afef;
  }

  .token.regex,
  .token.important,
  .token.variable {
    color: #c678dd;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.italic {
    font-style: italic;
  }
`;

export default syntaxHighlighting;
