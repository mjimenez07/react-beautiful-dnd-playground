import React, { useState, useEffect } from "react";
import { Draggable } from "react-beautiful-dnd";

const keyCodes = {
  enter: 13,
  escape: 27,
  arrowDown: 40,
  arrowUp: 38,
  tab: 9,
};
// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const primaryButton = 0;

function Task({
  index,
  task,
  toggleSelection,
  toggleSelectionInGroup,
  multiSelectTo,
  isSelected,
  selectionCount,
  isGhosting
}) {

  function performAction(event) {

    if (wasToggleInSelectionGroupKeyUsed(event)) {
      toggleSelectionInGroup(task.id);
      return;
    }

    if (wasMultiSelectKeyUsed(event)) {
      multiSelectTo(task.id);
      return;
    }

    toggleSelection(task.id);
  };

  function handleOnKeyDown (event, provided, snapshot) {
    if (event.defaultPrevented) {
      return;
    }

    if (snapshot.isDragging) {
      return;
    }

    if (event.keyCode !== keyCodes.enter) {
      return;
    }

    // we are using the event for selection
    event.preventDefault();

    performAction(event);
  };

  // Using onClick as it will be correctly
  // preventing if there was a drag
  function handleOnClick(event) {
    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== primaryButton) {
      return;
    }

    // marking the event as used
    event.preventDefault();

    performAction(event);
  };


  function handleOnTouchEnd(event) {
    if (event.defaultPrevented) {
      return;
    }

    // marking the event as used
    // we would also need to add some extra logic to prevent the click
    // if this element was an anchor
    event.preventDefault();
    toggleSelectionInGroup(task.id);
  };

  // Determines if the platform specific toggle selection in group key was used
  function wasToggleInSelectionGroupKeyUsed(event) {
    const isUsingWindows = navigator.platform.indexOf('Win') >= 0;
    return isUsingWindows ? event.ctrlKey : event.metaKey;
  };

  // Determines if the multiSelect key was used
  const wasMultiSelectKeyUsed = (event) => event.shiftKey;
  return (
    <Draggable
      key={task.id}
      draggableId={task.id}
      index={index}
    >
    {(provided, snapshot) => {
      return (
        <div

        onClick={handleOnClick}
        onTouchEnd={handleOnTouchEnd}
        onKeyDown={(event) => handleOnKeyDown(event, provided, snapshot)
        }
        isDragging={snapshot.isDragging}
        isSelected={isSelected}
        isGhosting={isGhosting}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: "none",
            padding: 16,
            margin: "0 0 8px 0",
            minHeight: "50px",
            backgroundColor: snapshot.isDragging
              ? "#263B4A"
              : "#456C86",
            color: "white",
            ...provided.draggableProps.style
          }}
        >
          {task.content}
        </div>
      );
    }}
  </Draggable>
  );
}

export default Task;