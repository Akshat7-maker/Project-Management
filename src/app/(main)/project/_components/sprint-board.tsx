"use client";

import React, { useEffect, useState } from "react";
import SprintManager from "./sprint-manager";
import { getIssues, updateIssueStatus } from "@/actions/Issues";
import useFetch from "@/hooks/use-fetch";
import status from "@/data/status.json";
import Columns from "./Cloumns";
import { BarLoader } from "react-spinners";
import IssueCreationDrawer from "./create-issue";
import { closestCorners, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { set } from "date-fns";
import { toast } from "react-hot-toast";

interface Sprint {
  id: string;
  status: string;
  [key: string]: any;
}

interface Issue {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  priority: string;
  description: string;
  assignee: any;
  reporter: { clerkUserId: string };
  projectId: string;
  sprintId: string;
}

interface SprintBoardProps {
  sprints: Sprint[];
  projectId: string;
  orgId: string;
}

const SprintBoard = ({ sprints, projectId, orgId }: SprintBoardProps) => {
  // if(!sprints || !projectId || !orgId) return null

  const [currSprint, setCurrSprint] = useState<Sprint>(
    sprints.find((sprint) => sprint.status === "ACTIVE") || sprints[0]
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [issue, setIssue] = useState<Issue[] | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    loading: issuesLoading,
    error: issuesError,
    data: issues,
    fn: getIssuesFn,
  } = useFetch(getIssues);

  React.useEffect(() => {
    getIssuesFn(currSprint.id);
  }, [currSprint]);

  const handleIssueCreated = () => {
    getIssuesFn(currSprint.id);
  };

  useEffect(() => {
    if (issues) {
      setIssue(issues);
    }
  }, [issues]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const issueId = active.id;
    const newStatus = over.id;

    // Check if the issue is being dropped in a different status column
    const currentIssue = issue?.find((i) => i.id === issueId);
    if (!currentIssue || currentIssue.status === newStatus) {
      return; // No change needed
    }

    setIsUpdating(true);

    try {
      // Optimistically update the UI first
      setIssue((prevIssue: any) => {
        if (!prevIssue) return prevIssue;
        return prevIssue.map((i: any) => {
          if (i.id === issueId) {
            return {
              ...i,
              status: newStatus,
            };
          }
          return i;
        });
      });

      // Call the API to update the issue status
      await updateIssueStatus(issueId, newStatus, projectId);
      
      // Refresh the issues to get the updated data with proper ordering
      await getIssuesFn(currSprint.id);
      
      toast.success(`Issue moved to ${newStatus}`);
    } catch (error) {
      console.error("Error updating issue status:", error);
      
      // Revert the optimistic update on error
      setIssue((prevIssue) => {
        if (!prevIssue) return prevIssue;
        return prevIssue.map((i) => {
          if (i.id === issueId) {
            return {
              ...i,
              status: currentIssue.status,
            };
          }
          return i;
        });
      });
      
      toast.error("Failed to update issue status");
    } finally {
      setIsUpdating(false);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <div>
      <SprintManager
        sprint={currSprint}
        setSprint={setCurrSprint}
        sprints={sprints}
        projectId={projectId}
        orgId={orgId}
      />

      {/* fetch issues for selected sprint */}

      {(issuesLoading || isUpdating) && (
        <>
        <BarLoader color="#36d7b7" width="100%" />
        <h1 className="text-white text-center ">
          {isUpdating ? "Updating issue..." : "Fetching issues"}
        </h1>
        </>
      )}

      {/* render columns */}

      {issue && (
        <div className="flex gap-8 justify-around">
          <DndContext
          sensors={sensors}
          collisionDetection={closestCorners} 
          onDragEnd={handleDragEnd}>
          {status.map((status) => (
            <Columns key={status.key} column={status} issues={issue}  addIssue={() => setIsDrawerOpen(true)} handleIssueCreated={handleIssueCreated}/>
          ))}
          </DndContext>
        </div>
      )}

       <IssueCreationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sprintId={currSprint.id}
        status={currSprint.status}
        projectId={projectId}
        onIssueCreated={handleIssueCreated}
        orgId={orgId}
      />
    </div>
  );
};

export default SprintBoard;

// import React, { useState } from "react";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   useDroppable,
//   useDraggable,
//   DragOverlay,
// } from "@dnd-kit/core";

// const initialColumns = {
//   todo: ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5", "Task 6", "Task 7", "Task 8","Task 9"],
//   inprogress: ["Task 10","Task 11"],
//   done: [],
// };

// const Column = ({ id, items }) => {
//   const { setNodeRef } = useDroppable({ id });
//   return (
//     <div
//       ref={setNodeRef}
//       style={{
//         width: 500,
//         minHeight: 500,
//         margin: "0 8px",
//         padding: 8,
//         backgroundColor: "",
//         border: "1px solid #ddd",
//       }}
//     >
//       <h4 style={{ textAlign: "center" }}>{id.toUpperCase()}</h4>
//       {items.map((item) => (
//         <DraggableItem key={item} id={item} />
//       ))}
//     </div>
//   );
// };

// const DraggableItem = ({ id }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useDraggable({ id });
//   return (
//     <div
//       ref={setNodeRef}
//       {...attributes}
//       {...listeners}
//       style={{
//         transform: transform
//           ? `translate(${transform.x}px, ${transform.y}px)`
//           : undefined,
//         transition,
//         padding: "8px",
//         margin: "4px 0",
//         backgroundColor: "black",
//         border: "1px solid gray",
//         cursor: "grab",
//       }}
//     >
//       {id}
//     </div>
//   );
// };

// export default function KanbanBoard() {
//   const [columns, setColumns] = useState(initialColumns);
//   const [activeId, setActiveId] = useState(null);

//   const sensors = useSensors(useSensor(PointerSensor));

//   const handleDragStart = (event) => {
//     setActiveId(event.active.id);
//   };

//   const handleDragEnd = (event) => {
//     const { active, over } = event;

//     if (!over) {
//       setActiveId(null);
//       return;
//     }

//     if (active.id !== over.id) {
//       let sourceCol, destCol;

//       for (const [col, items] of Object.entries(columns)) {
//         if (items.includes(active.id)) sourceCol = col;
//         if (col === over.id) destCol = col;
//       }

//       if (sourceCol && destCol) {
//         setColumns((prev) => {
//           const newCols = { ...prev };
//           newCols[sourceCol] = newCols[sourceCol].filter((item) => item !== active.id);
//           newCols[destCol] = [...newCols[destCol], active.id];
//           return newCols;
//         });
//       }
//     }

//     setActiveId(null);
//   };

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={closestCenter}
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//     >
//       <div style={{ display: "flex", justifyContent: "space-around" ,backgroundColor:"red"}}>
//         {Object.keys(columns).map((columnId) => (
//           <Column key={columnId} id={columnId} items={columns[columnId]} />
//         ))}
//       </div>
//       <DragOverlay>
//         {activeId ? (
//           <div
//             style={{
//               padding: "8px",
//               backgroundColor: "black",
//               border: "1px solid gray",
//             }}
//           >
//             {activeId}
//           </div>
//         ) : null}
//       </DragOverlay>
//     </DndContext>
//   );
// }
