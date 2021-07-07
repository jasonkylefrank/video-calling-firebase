import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import { unstable_createMuiStrictModeTheme } from '@material-ui/core';



const GlobalStyle = createGlobalStyle`
  html,
  body {
    padding: 0;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
  }

  h2, h3, h4, h5, h6 {
    font-weight: normal;
  }
`;

const styledComponentsTheme = {
  colors: {
    primary: '#0070f3'
  }
};

console.log("In _app.js, process.env.NODE_ENV: ");
console.log(process.env.NODE_ENV);

const createMuiThemeForEnvironment = 
  process.env.NODE_ENV === 'production' ? 
    createMuiTheme : 
    // For dev environments, we need to use a newer version that solves the strict mode console warning for components like the Dialog.  See: https://github.com/mui-org/material-ui/issues/13394#issuecomment-815452717
    unstable_createMuiStrictModeTheme;

const muiTheme = createMuiThemeForEnvironment({
  palette: {
    primary: {
      main: styledComponentsTheme.colors.primary
    }
  }
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={styledComponentsTheme}>
        <MuiThemeProvider theme={muiTheme} >
          <Component {...pageProps} />
        </MuiThemeProvider>
      </ThemeProvider>
    </>
  ); 
}

export default MyApp
