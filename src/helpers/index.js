export const getHomeColumn = (columns, taskId) => {
  const columnId = Object.keys(columns).find(column => {
    return columns[column].items.find(item => item.id === taskId);
  });

  return columns[columnId];
};

export const multiSelectTo = (columns, selectedTaskIds, newTaskId ) => {
  //verify this function after adding the first item the next tasks gets added as an object instead of just ids
  // Nothing already selected
  if (!selectedTaskIds.length) {
    return [newTaskId];
  }

  const columnOfNew = getHomeColumn(columns, newTaskId);
  const indexOfNew = columnOfNew.items.map(item => item.id).indexOf(newTaskId);

  const lastSelected = selectedTaskIds[selectedTaskIds.length - 1];
  const columnOfLast = getHomeColumn(columns, lastSelected);
  const indexOfLast = columnOfLast.items.map(item => item.id).indexOf(lastSelected);

  // multi selecting to another column
  // select everything up to the index of the current item
  if (columnOfNew !== columnOfLast) {
    return columnOfNew.items.slice(0, indexOfNew + 1);
  }

  // multi selecting in the same column
  // need to select everything between the last index and the current index inclusive

  // nothing to do here
  if (indexOfNew === indexOfLast) {
    return null;
  }

  const isSelectingForwards = indexOfNew > indexOfLast;
  const start = isSelectingForwards ? indexOfLast : indexOfNew;
  const end = isSelectingForwards ? indexOfNew : indexOfLast;

  const inBetween = columnOfNew.items.slice(start, end + 1);

  // everything inbetween needs to have it's selection toggled.
  // with the exception of the start and end values which will always be selected
  const toAdd = inBetween.filter(({ id }) => {
    // if already selected: then no need to select it again
    if (selectedTaskIds.includes(id)) {
      return false;
    }
    return true;
  });

  const sorted = isSelectingForwards ? toAdd : [...toAdd].reverse();
  const combined = [...selectedTaskIds, ...sorted.map(sorted => sorted.id)];

  return combined;
};