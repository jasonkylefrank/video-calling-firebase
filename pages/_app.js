import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import { unstable_createMuiStrictModeTheme } from '@material-ui/core';
// Need this so we can tell Material UI to inject their styles
//  NOT at the end of the head, thus allowing us to override their styles. See: https://gist.github.com/Danilo-Araujo-Silva/2ce11fd0540dcc7eb3ad3e67fd75d02a#gistcomment-2935337
import { StylesProvider } from '@material-ui/styles';



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

//console.log("In _app.js, process.env.NODE_ENV: ");
//console.log(process.env.NODE_ENV);

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
        <StylesProvider injectFirst>
          <MuiThemeProvider theme={muiTheme} >
            <Component {...pageProps} />
          </MuiThemeProvider>
        </StylesProvider>
      </ThemeProvider>
    </>
  ); 
}

export default MyApp
