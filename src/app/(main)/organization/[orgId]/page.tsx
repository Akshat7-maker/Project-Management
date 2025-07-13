"use client";

import React, { use, useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { getOrganization } from "@/actions/organizations";
import OrgSwitcher from "@/components/org-swith";
import useFetch from "@/hooks/use-fetch";
import { getProjects } from "@/actions/Project";
import Projectlist from "./_components/projectlist";
import { Button } from "@/components/ui/button";
import AddMembers from "./_components/add-members";
import { getIssuesReportedByUser } from "@/actions/Issues";
import { getIssuesReportedToUser } from "@/actions/Issues";
import OrgIssueCard from "./_components/org-issue-card";

const Organization = ({ params }: { params: Promise<{ orgId: string }> }) => {
  const { orgId } = use(params);

  let [project, setProjects] = useState<any[]>([]);
  const { loading, error, data: organization, fn } = useFetch(getOrganization) as {
    loading: boolean;
    error: any;
    data: { id: string; name: string; slug: string } | null;
    fn: (orgId: string) => void;
  };

  const [openAddMembers, setAddMembersOpen] = useState(false);

  const [issuesToggle, setIssuesToggle] = useState("to user");

  // get projects
  const {
    loading: loadingProjects,
    error: errorProjects,
    data: projects,
    fn: fnProjects,
  } = useFetch(getProjects) as { loading: boolean; error: any; data: any[] | null; fn: (orgId: string) => void };

  // delete project
  function ondelete() {
    fnProjects(orgId);
  }

  // get issues reported by user
  const {
    loading: issuesLoading,
    error: issuesError,
    data: issues,
    fn: getIssuesFn,
  } = useFetch(getIssuesReportedByUser) as { loading: boolean; error: any; data: any[] | null; fn: (orgId: string) => void };

  // get issues reported to user
  const {
    loading: issuesToMeLoading,
    error: issuesToMeError,
    data: issuesToMe,
    fn: getIssuesToMeFn,
  } = useFetch(getIssuesReportedToUser) as { loading: boolean; error: any; data: any[] | null; fn: (orgId: string) => void };

  useEffect(() => {
    fn(orgId);
    fnProjects(orgId);
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    if (issuesToggle === "to user") {
      getIssuesFn(orgId);
    } else {
      getIssuesToMeFn(orgId);
    }
  }, [orgId, issuesToggle]);

  useEffect(() => {
    console.log("organization", organization);
    if (organization) {
      sessionStorage.setItem("userSelectedOrgId", JSON.stringify(organization));
    }
  }, [organization]);

  useEffect(() => {
    if (projects) {
      setProjects(projects as any[]);
    } else {
      setProjects([]);
    }

    console.log("projects", projects);
  }, [projects]);

  const handleIssuesToggle = (toggle: string) => {
    setIssuesToggle(toggle);
  };

  if (loading || loadingProjects) {
    return <BarLoader color="#36d7b7" className="mb-4" width={"100%"} />;
  }

  if (!organization) {
    return (
      <div>
        <h1>Organization not found</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center border-b ">
        <h1 className="md:text-6xl sm:text-5xl text-2xl font-bold gradient-title ml-4">
          {organization.name}&apos;s Projects{" "}
        </h1>

        <div className="flex items-center">
          <OrgSwitcher />

          {/* button to add members in organization */}
          <Button
            onClick={() => setAddMembersOpen((prev) => !prev)}
            className="mr-4"
            variant="outline"
          >
            Add Members
          </Button>
        </div>

        {/* organization switcher */}
      </div>

      {/* project list */}
      <div>
        {project && project.length === 0 ? (
          <p className="text-gray-600">No projects found</p>
        ) : (
          // <div>
          //   <p className="text-white mt-5 mb-5">{project.length} projects found</p>
          //   <h1 className="text-2xl font-bold mb-4 block border-b">Projects</h1>
          //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          //     {/* project cards */}
          //     {project.map((project) => (
          //       <div
          //         key={project.id}
          //         className="bg-black p-4 rounded-lg shadow-md"
          //       >
          //         <h2 className="text-xl font-semibold mb-2">
          //           {project.name}
          //         </h2>
          //         <p className="text-gray-600">{project.description}</p>
          //       </div>
          //     ))}
          //   </div>
          // </div>

          <div className="ml-5">
            <Projectlist projects={project as any[]} ondelete={ondelete} />

          </div>

        )}
      </div>

      {/* my issues list */}

      <div>
        <h1 className="text-2xl font-bold mb-4 block border-b mt-4 ml-5">
          My Issues
        </h1>

        <div>
          {/* 2 buttons */}
          <div className="relative bg-gray-200 p-1 rounded-full w-fit ml-5 flex gap-1">
            <button
              onClick={() => handleIssuesToggle("to user")}
              className={`px-4 py-1 text-sm font-medium rounded-full transition-all duration-300 ${
                issuesToggle === "to user"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700"
              }`}
            >
              Issues Reported By Me
            </button>
            <button
              onClick={() => handleIssuesToggle("from user")}
              className={`px-4 py-1 text-sm font-medium rounded-full transition-all duration-300 ${
                issuesToggle === "from user"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700"
              }`}
            >
              Issues Reported To Me
            </button>
          </div>

          <div className=" min-h-[300px] w-full">
            {(() => {
              const isLoading =
                issuesToggle === "to user" ? issuesLoading : issuesToMeLoading;
              const list = issuesToggle === "to user" ? issues : issuesToMe;

              console.log("list", list);

              if (isLoading) {
                return (
                  <div className="p-4">

                    <BarLoader color="#36d7b7" className="mb-4 " width={"100%"} />
                  </div>
                );
              }

              if (!list || list.length === 0) {
                return <p className="text-gray-600 p-4">No issues found</p>;
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {list && list.map((issue: any) => (
                    <OrgIssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Add Members Form  */}
      {openAddMembers && <AddMembers setAddMembersOpen={setAddMembersOpen} />}
    </div>
  );
};

export default Organization;
