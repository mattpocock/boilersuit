import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the boilerplateContainer state domain
 */

const selectBoilerplateContainerDomain = state =>
  state.get('boilerplateContainer', initialState);

/**
 * Other specific selectors
 */

/**
 * Default selector used by BoilerplateContainer
 */

const makeSelectBoilerplateContainer = () =>
  createSelector(selectBoilerplateContainerDomain, substate => substate.toJS());

export default makeSelectBoilerplateContainer;
export { selectBoilerplateContainerDomain };
