import React from "react";
import { Building, Search, Power, Edit, Trash2 } from "lucide-react";

interface OrgListTableProps {
  organizations: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  togglingStatus: boolean;
  onToggleActive: (org: any) => void;
  onEditClick: (org: any) => void;
  onDeleteClick: (org: any) => void;
}

export const OrgListTable: React.FC<OrgListTableProps> = ({
  organizations,
  searchQuery,
  setSearchQuery,
  togglingStatus,
  onToggleActive,
  onEditClick,
  onDeleteClick,
}) => {
  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.admin?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.admin?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-sky-50 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-900/50">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Building className="w-4.5 h-4.5 text-sky-505" /> Active Organizations ({organizations.length})
        </h3>
        
        <div className="flex items-center border border-sky-100 dark:border-gray-800 rounded-lg px-2.5 py-1 bg-white dark:bg-gray-950 focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all text-xs max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-gray-400 mr-1.5 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:outline-none text-gray-700 dark:text-gray-300 bg-transparent py-0.5 w-full font-medium"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-sky-50/70 dark:border-gray-800 text-[10px] font-bold text-gray-400 dark:text-gray-300 uppercase bg-gray-50/30 dark:bg-gray-950/20">
              <th className="px-6 py-4">Organization Name</th>
              <th className="px-6 py-4">Admin Representative</th>
              <th className="px-6 py-4">Admin Email</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50/45 dark:divide-gray-800 text-sm">
            {filteredOrgs.map((org) => (
              <tr 
                key={org._id} 
                className={`hover:bg-sky-50/20 dark:hover:bg-gray-800/20 transition-all ${
                  !org.isActive ? "bg-red-50/[0.07]" : ""
                }`}
              >
                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">
                  {org.name}
                </td>
                <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-300">
                  {org.admin?.name || "N/A"}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {org.admin?.email || "N/A"}
                </td>
                <td className="px-6 py-4">
                  {org.isActive ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                      Active
                    </span>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 self-start">
                        Inactive
                      </span>
                      {org.remark && (
                        <span className="text-[9px] text-red-800 font-semibold italic truncate max-w-[160px]" title={org.remark}>
                          Reason: {org.remark}
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-gray-400 dark:text-gray-500 font-semibold">
                  {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "N/A"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onToggleActive(org)}
                      disabled={togglingStatus}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        org.isActive 
                          ? "text-green-600 hover:text-red-600 hover:bg-red-50 border-transparent hover:border-red-100" 
                          : "text-red-500 hover:text-green-600 hover:bg-green-50 border-transparent hover:border-green-100"
                      }`}
                      title={org.isActive ? "Deactivate Organization" : "Activate Organization"}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditClick(org)}
                      className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100 cursor-pointer"
                      title="Edit Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteClick(org)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                      title="Delete Instance"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredOrgs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 text-xs text-gray-400 font-semibold bg-gray-50/10">
                  No organizations found matching search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
