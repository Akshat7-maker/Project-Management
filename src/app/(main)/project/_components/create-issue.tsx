"use client";

import { JSX, useEffect } from "react";
import { BarLoader } from "react-spinners";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MDEditor from "@uiw/react-md-editor";
import useFetch from "@/hooks/use-fetch";
import { createIssue } from "@/actions/Issues";
import { getOrganizationUsers } from "@/actions/organizations";
import { issueSchema } from "@/lib/validators";

interface IssueCreationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId: string;
  status: string;
  projectId: string;
  onIssueCreated: () => void;
  orgId: string;
}

interface User {
  id: string;
  name: string;
}

export default function IssueCreationPopup({
  isOpen,
  onClose,
  sprintId,
  status,
  projectId,
  onIssueCreated,
  orgId,
}: IssueCreationPopupProps) {
  const {
    loading: createIssueLoading,
    fn: createIssueFn,
    error,
    data: newIssue,
  } = useFetch(createIssue);

  const {
    loading: usersLoading,
    fn: fetchUsers,
    data: users,
  } = useFetch(getOrganizationUsers) as {
    loading: boolean;
    fn: (orgId: string) => void;
    data: User[] | null;
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      priority: "MEDIUM",
      description: "",
      assigneeId: "",
      status: "TODO",
    },
  });

  useEffect(() => {
    if (isOpen && orgId) {
      fetchUsers(orgId);
    }
  }, [isOpen, orgId]);

  const onSubmit = async (data: Record<string, any>) => {
    console.log("Submit triggered");
    console.log("data", data);
    await createIssueFn(projectId, {
      ...data,
      sprintId,
    });
  };

  useEffect(() => {
    if (newIssue) {
      reset();
      onClose();
      onIssueCreated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newIssue, createIssueLoading]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50">
          <div className="relative bg-black rounded-lg w-full max-w-lg mx-4 p-6 overflow-y-auto max-h-[90vh]">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Issue</h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-black"
              >
                ✕
              </button>
            </div>

            {usersLoading && <BarLoader width={"100%"} color="#36d7b7" />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium">
                  Title
                </label>
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="assigneeId"
                  className="block text-sm font-medium"
                >
                  Assignee
                </label>
                <Controller
                  name="assigneeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.map((user: User) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.assigneeId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.assigneeId.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium"
                >
                  Description
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <MDEditor value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">Todo</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="IN_REVIEW">In Review</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium">
                  Priority
                </label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* {error && <p className="text-red-500 mt-2">{error.message}</p>} */}

              <button
                type="submit"
                // disabled={createIssueLoading}
                className="w-full bg-blue-600 text-white py-2 rounded"
              >
                {createIssueLoading ? "Creating..." : "Create Issue"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
