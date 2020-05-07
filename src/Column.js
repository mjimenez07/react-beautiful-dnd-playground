import React  from "react";
import { Droppable } from "react-beautiful-dnd";
import memoizeOne from 'memoize-one';
import Task from './Task';

const getSelectedMap = memoizeOne((selectedTaskIds) =>
  selectedTaskIds.reduce((previous, current)=> {
    previous[current] = true;
    return previous;
  }, {}),
);

function Column({ column, columnId, multiSelectTo, toggleSelection, toggleSelectionInGroup, selectedTasksIds, draggingTaskId}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}
  >
      <h2>{column.name}</h2>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => {
          return (
            <div
              ref={provided.innerRef}
              isDraggingOver={snapshot.isDraggingOver}
              {...provided.droppableProps}
              style={{
                background: snapshot.isDraggingOver
                  ? "lightblue"
                  : "lightgrey",
                padding: 4,
                width: 250,
                minHeight: 500
              }}
            >
                {column.items.map((item, index) => {
                  const isSelected = Boolean(
                    getSelectedMap(selectedTasksIds)[item.id],
                  );
                  const isGhosting = isSelected && Boolean(draggingTaskId) && draggingTaskId !== item.id;
                  return (
                    <Task
                      isSelected={isSelected}
                      isGhosting={isGhosting}
                      key={`task-${item.id}`}
                      task={item}
                      index={index}
                      toggleSelection={toggleSelection}
                      toggleSelectionInGroup={toggleSelectionInGroup}
                      multiSelectTo={multiSelectTo}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
            );
          }}
      </Droppable>
    </div>
  )
}

export default Column;
