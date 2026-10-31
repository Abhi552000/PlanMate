import React from "react";
import { TenantDetailModal } from "./TenantDetailModal";
import { TenantDetailModalProps } from "../../../types";

export const TenantDetailDrawer: React.FC<TenantDetailModalProps> = (props) => {
  return <TenantDetailModal {...props} />;
};

export default TenantDetailDrawer;
