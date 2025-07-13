"use client";

import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeSprintStatus } from "@/actions/Sprints";
import useFetch from "@/hooks/use-fetch";
import { isBefore, isAfter, format, isEqual } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function SprintManager({ sprints, projectId, orgId, setSprint, sprint }) {
  console.log("sprints", sprints);

  const router = useRouter();

  const {
    loading: changeSprintStatusLoading,
    error: sprintError,
    data: updatedSprint,
    fn: updatedSprintFn,
  } = useFetch(changeSprintStatus);

  let today = new Date();
  let sprintStart = new Date(sprint.startDate);
  let sprintEnd = new Date(sprint.endDate);

  console.log("today", today);
  console.log("sprintStart", sprintStart);
  console.log("sprintEnd", sprintEnd);

  let canStart =
    isBefore(today, sprintEnd) &&
    (isEqual(today, sprintStart) || isAfter(today, sprintStart)) &&
    sprint.status === "PLANNED";
  console.log("canStart", canStart);

  let canEnd = sprint.status === "ACTIVE";
  console.log("canEnd", canEnd);

  //   handle sprint change
  const handleSprintChange = (value) => {
    const selectedSprint = sprints.find((sprint) => sprint.id === value);
    setSprint(selectedSprint);
  };

  //   handle sprint status change
  const handleSprintStatusChange = async (sprintId, status) => {
    try {
      const result = await updatedSprintFn(sprintId, projectId, status);
      if (result) {
        toast.success("Sprint status updated successfully");
        router.refresh();
        setSprint((prevSprint) => ({
          ...prevSprint,
          status: result.status,
        }));
      }
    } catch (err) {
      toast.error("Failed to update sprint status");
    }
  };

  return (
    <div>
      <h1>Sprint Manager{sprint.name}</h1>

      <div className="flex justify-between p-4">
        <Select onValueChange={handleSprintChange} defaultValue={sprint.id}>
          <SelectTrigger className="w-[90%]">
            <SelectValue placeholder="Select a Sprint" />
          </SelectTrigger>
          <SelectContent>
            {sprints.map((sprint) => (
              <SelectItem key={sprint.id} value={sprint.id}>
                {sprint.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* BUTTONS */}

        {canStart && (
          <Button
            onClick={() => handleSprintStatusChange(sprint.id, "ACTIVE")}
            disabled={changeSprintStatusLoading}
          >
            Start Sprint
          </Button>
        )}

        {canEnd && (
          <Button
            variant="destructive"
            onClick={() => handleSprintStatusChange(sprint.id, "COMPLETED")}
            disabled={changeSprintStatusLoading}
          >
            End Sprint
          </Button>
        )}
      </div>
    </div>
  );
}

export default SprintManager;
