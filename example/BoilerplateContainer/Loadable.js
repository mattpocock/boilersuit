/**
 *
 * Asynchronously loads the component for BoilerplateContainer
 *
 */

import Loadable from 'react-loadable';

export default Loadable({
  loader: () => import('./index'),
  loading: () => null,
});
