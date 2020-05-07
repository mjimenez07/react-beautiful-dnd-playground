import React, { useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { multiSelectTo as multiSelect } from './helpers';
import Column from './Column';
import uuid from "uuid/v4";

const itemsFromBackend = [
  { id: uuid(), content: "First task", status: 'To Do' },
  { id: uuid(), content: "Second task" },
  { id: uuid(), content: "Third task" },
  { id: uuid(), content: "Fourth task" },
  { id: uuid(), content: "Fifth task" }
];

const columnsFromBackend = {
  [uuid()]: {
    name: "To do",
    items: itemsFromBackend
  },
  [uuid()]: {
    name: "In Progress",
    items: []
  },
  [uuid()]: {
    name: "Done",
    items: []
  }
};

function App() {
  const [columns, setColumns] = useState(columnsFromBackend);
  const [selectedTasksIds, setSelectedTasksIds] = useState([]);
  const [draggingTaskId, setDragginTaskId] = useState(null)

  const onDragStart = (start) => {
    const id = start.draggableId;
    const selected = selectedTasksIds.find(
      (taskId)  => taskId === id,
    );
    // if dragging an item that is not selected - unselect all items
    if (!selected) {
      unselectAll();
    }
    setDragginTaskId(start.draggableId);
  };

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];

      if(selectedTasksIds.length > 1) {
        setColumns({
          ...columns,
          [source.droppableId]: {
            ...sourceColumn,
            items: sourceColumn.items.filter(item => !selectedTasksIds.includes(item.id))
          },
          [destination.droppableId]: {
            ...destColumn,
            items: [...destColumn.items, ...sourceColumn.items.filter(item => selectedTasksIds.includes(item.id))]
          }
        });
        setDragginTaskId(null);
        setSelectedTasksIds([]);
        return;
      }
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceColumn.items.filter(item => item.id !== draggingTaskId)
        },
        [destination.droppableId]: {
          ...destColumn,
          items: [...destColumn.items, sourceColumn.items.find(item => item.id === draggingTaskId)]
        }
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      });
    }
    setDragginTaskId(null);
    setSelectedTasksIds([]);
  };


  const unselectAll = () => setSelectedTasksIds([]);

  const toggleSelection = (taskId) => {
    const wasSelected = selectedTasksIds.includes(taskId);

    const newTaskIds = (() => {
      // Task was not previously selected
      // now will be the only selected item
      if (!wasSelected) {
        return [taskId];
      }

      // Task was part of a selected group
      // will now become the only selected item
      if (selectedTasksIds.length > 1) {
        return [taskId];
      }

      // task was previously selected but not in a group
      // we will now clear the selection
      return [];
    })();

    setSelectedTasksIds(newTaskIds);
  };


  const toggleSelectionInGroup = (taskId) => {
    const index = selectedTasksIds.indexOf(taskId);

    // if not selected - add it to the selected items
    if (index === -1) {
      setSelectedTasksIds([...selectedTasksIds, taskId]);
      return;
    }

    // it was previously selected and now needs to be removed from the group
    const shallow = [...selectedTasksIds];
    shallow.splice(index, 1);
    setSelectedTasksIds(shallow);
  };

    // This behaviour matches the MacOSX finder selection
   const multiSelectTo = (newTaskId) => {
      const updated = multiSelect(
        columns,
        selectedTasksIds,
        newTaskId,
      );

      if (updated == null) {
        return;
      }

      setSelectedTasksIds(updated)
    };

  function onWindowKeyDown (event) {
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === 'Escape') {
      unselectAll();
    }
  };

  function onWindowClick (event) {
    if (event.defaultPrevented) {
      return;
    }
    unselectAll();
  };

  function onWindowTouchEnd (event) {
    if (event.defaultPrevented) {
      return;
    }
    unselectAll();
  };

  useEffect(() => {
    window.addEventListener('click', onWindowClick);
    window.addEventListener('keydown', onWindowKeyDown);
    window.addEventListener('touchend', onWindowTouchEnd);
    return () => {
      window.removeEventListener('click', onWindowClick);
      window.removeEventListener('keydown', onWindowKeyDown);
      window.removeEventListener('touchend', onWindowTouchEnd);
    }
  }, []);


  return (
    <div style={{ display: "flex", justifyContent: "center", height: "100%" }}>
      <DragDropContext
        onDragStart={onDragStart}
        onDragEnd={result => onDragEnd(result, columns, setColumns)}
      >
        {Object.entries(columns).map(([columnId, column], index) => {
          return (
            <Column
              draggingTaskId={draggingTaskId}
              selectedTasksIds={selectedTasksIds}
              key={column.name}
              column={column}
              columnId={columnId}
              multiSelectTo={multiSelectTo}
              toggleSelection={toggleSelection}
              toggleSelectionInGroup={toggleSelectionInGroup}
            />
          );
        })}
      </DragDropContext>
    </div>
  );
}

export default App;
