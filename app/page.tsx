import { redirect } from "next/navigation";
import React from "react";

const UnknownPage = () => {
  redirect("/onboarding");
  return <></>;
};

export default UnknownPage;
