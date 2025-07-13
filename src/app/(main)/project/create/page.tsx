"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createProject } from "@/actions/Project";

import React from "react";
import { BarLoader } from "react-spinners";
import {
  useAuth,
  useOrganization,
  useOrganizationList,
  useUser,
} from "@clerk/nextjs";
import OrgSwitcher from "@/components/org-swith";
import useFetch from "@/hooks/use-fetch";
import toast from "react-hot-toast";


type Inputs = {
  name: string;
  key: string;
  description: string;
};

const CreateProject = () => {
  const router = useRouter();
  const { isLoaded: orgLoaded, organization, membership } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();
  const { userMemberships, isLoaded: userMembershipsLoaded } =
    useOrganizationList({
      userMemberships: true,
    });

  

  const [isAdmin, setIsAdmin] = useState(false);

  const [onStart, setOnStart] = useState(true);

  // use form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const {
    loading,
    error,
    data: project,
    fn: createProjectFn,
  } = useFetch(createProject);

  // on submit
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!isAdmin) {
      alert("Only organization admins can create projects.");
      return;
    }
    console.log(data);
    createProjectFn(data);
  };

  // redirect to project page
  useEffect(() => {
    console.log("project in useEffect", project);
    if (project) {
      // router.push(`/project/${project.id}`);
      toast.success("Project created successfully.");
      router.push(`/organization/${organization?.slug}`);
    }
  }, [project]);

  // check if user is admin
  useEffect(() => {
    if (orgLoaded && userLoaded && membership) {
      setIsAdmin(membership.role === "org:admin");
    }
  }, [orgLoaded, userLoaded, membership]);

  useEffect(() => {
    if (
      userMembershipsLoaded &&
      !sessionStorage.getItem("userSelectedOrgId") &&
      userMemberships?.data?.length > 1
    ) {
      // Force user to select an org by navigating to an org selection page
      router.push("/onboarding");
    }else{
      setOnStart(false);
    }
  }, [userMembershipsLoaded]);

  if (!userLoaded || onStart) {
    return <BarLoader color="#36d7b7" className="mb-4" width={"100%"} />;
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-2 items-center">
        <span className="text-2xl gradient-title">
          Oops! You are not logged in.
        </span>
      </div>
    );
  }

  if (!orgLoaded || !userMembershipsLoaded) {
    return <BarLoader color="#36d7b7" className="mb-4" width={"100%"} />;
  }

  if (!membership) {
    return (
      <div className="flex flex-col gap-2 items-center">
        <span className="text-2xl gradient-title">
          Oops! You are not a member of any organization.
        </span>
        <OrgSwitcher />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-2 items-center">
        <span className="text-2xl gradient-title">
          Oops! Only Admins can create projects.
        </span>
        <OrgSwitcher />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-6xl text-center font-bold mb-8 gradient-title">
        Create New Project
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        <div>
          <Input
            id="name"
            {...register("name")}
            className="bg-slate-950"
            placeholder="Project Name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Input
            id="key"
            {...register("key")}
            className="bg-slate-950"
            placeholder="Project Key (Ex: RCYT)"
          />
          {errors.key && (
            <p className="text-red-500 text-sm mt-1">{errors.key.message}</p>
          )}
        </div>
        <div>
          <Textarea
            id="description"
            {...register("description")}
            className="bg-slate-950 h-28"
            placeholder="Project Description"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {loading && (
          <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
        )}
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="bg-blue-500 text-white"
        >
          {loading ? "Creating..." : "Create Project"}
        </Button>
        {/* {error && <p className="text-red-500 mt-2">{error.message}</p>} */}
      </form>
    </div>
  );
};

export default CreateProject;
