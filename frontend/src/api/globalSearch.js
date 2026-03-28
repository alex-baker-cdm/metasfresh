import { queryPathsRequest } from './app';
import { flattenLastElem } from '../actions/MenuActions';

export function searchMenuItems(query) {
  return queryPathsRequest(query, 9).then((response) =>
    flattenLastElem(response.data)
  );
}
