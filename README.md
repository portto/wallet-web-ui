# Project Description

This project is a new version of the blocto wallet for the web user to interact with dApps.

We've separated the client side and server side apart to two different repos currently, this repo is only the client side part of the blocto wallet's web service.  

See the old repo of blocto web wallet [here](https://github.com/portto/wallet-webapp).

And in this new repo we use x-state to do the states management. See the document [here](https://xstate.js.org/docs/guides/states.html#api).

## Project Structure

There're a couple of folders under `src`:

- `apis`: Functions of wallet api and BE proxies.
- `component`: React components that might be shared across pages/views, e.g. a button or a input.
- `features`: A separated view with a top feature of dApp related interaction, like **SendTransaction** or **SignMessage**.
- `machines`: x-state and react binding logics.
- `utils`: Simple utils functions.
- `services` : A bunch of utils that might be more complex than a simple util function.
- `translations`: i18n strings.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
