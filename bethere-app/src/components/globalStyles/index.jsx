import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;

    color: var(--black)
  }
  html, body, #root {
    max-height: 100vh;
    max-width: 100vw;

    height: 100%;
    width: 100%;
  }
  *, button, input {
    border: 0;
    background: none;
    font-family: 'Century Gothic', sans-serif;
  }
  html {
    background: var(--secondary);
  }
  :root {
    --primary: #f4511e;
    --secondary: #EFEFEF;
    --tertiary: #1491A8;
    --gray: #8B8B8B;
    --green: #A4C967;
    --red: #D77878;
    --white: #ffffff;
    --black: #000000;
    --white-half-opacity: #ffffff80;
    --white-twenty-opacity: #ffffff33;
    --white-ten-opacity: #ffffff1a;
    --black-twenty-opacity: #00000024;
    --blue-forty-five-opacity: #1491a873;
    --primary-twenty-opacity: #f4511e33;
    --primary-ninety-opacity: #f4511ee6;
  }
`