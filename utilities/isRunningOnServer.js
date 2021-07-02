/*
*  Summary: Returns true if this code is currently running server-side.
*
*  This is needed in Next.js apps since Next will attempt to execute your
*  React-based code first on the server.  That can cause server errors
*  if you're using browser APIs such as those that use things like 'navigator', etc.
*/
export default function isRunningOnServer() {
    return typeof window === 'undefined';
}