import { createStore, applyMiddleware, compose } from 'redux';
import reducers from './reducers';
import thunk from 'redux-thunk';
import promise from 'redux-promise-middleware';

// export default function configureStore(initialState) {
function configureStore(initialState) {
  const finalCreateStore = compose(
      applyMiddleware(promise()),
      applyMiddleware(thunk),
  )(createStore);

  const store = finalCreateStore(reducers, initialState);

  return store;
}
