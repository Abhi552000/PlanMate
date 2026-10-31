import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Check,
  CheckCircle2,
  AlertCircle,
  Save,
  Users,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import { planService } from "../../../services/planService";
import { IPlan, PlanManagementModalProps } from "../../../types";

export const PlanManagementModal: React.FC<PlanManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState<IPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formPlanId, setFormPlanId] = useState("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formMaxMembers, setFormMaxMembers] = useState<number>(5);
  const [formDescription, setFormDescription] = useState("");
  const [formFeaturesText, setFormFeaturesText] = useState("");
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formBillingCycle, setFormBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await planService.getAllPlansForAdmin();
      if (res?.success) {
        setPlans(res.plans);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPlans();
      setEditingPlan(null);
      setIsCreatingNew(false);
    }
  }, [isOpen]);

  const handleStartEdit = (plan: IPlan) => {
    setEditingPlan(plan);
    setIsCreatingNew(false);
    setFormName(plan.name);
    setFormPlanId(plan.planId);
    setFormPrice(plan.price);
    setFormMaxMembers(plan.maxMembers);
    setFormDescription(plan.description || "");
    setFormFeaturesText((plan.features || []).join("\n"));
    setFormIsPopular(Boolean(plan.isPopular));
    setFormBillingCycle(plan.billingCycle || "monthly");
  };

  const handleStartCreate = () => {
    setEditingPlan(null);
    setIsCreatingNew(true);
    setFormName("");
    setFormPlanId("");
    setFormPrice(0);
    setFormMaxMembers(10);
    setFormDescription("");
    setFormFeaturesText("Up to 10 team members\nUnlimited active sprints\nStandard CSV export");
    setFormIsPopular(false);
    setFormBillingCycle("monthly");
  };

  const handleCancelForm = () => {
    setEditingPlan(null);
    setIsCreatingNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPlanId.trim()) {
      toast.error("Plan Name and Plan ID are required");
      return;
    }

    const featuresArray = formFeaturesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      if (isCreatingNew) {
        const res = await planService.createPlan({
          planId: formPlanId.toLowerCase().trim(),
          name: formName.trim(),
          price: Number(formPrice),
          maxMembers: Number(formMaxMembers),
          description: formDescription.trim(),
          features: featuresArray,
          isPopular: formIsPopular,
          billingCycle: formBillingCycle,
          currency: "INR",
        });

        if (res?.success) {
          toast.success("New subscription tier created!");
          handleCancelForm();
          loadPlans();
        }
      } else if (editingPlan?._id) {
        const res = await planService.updatePlan(editingPlan._id, {
          name: formName.trim(),
          price: Number(formPrice),
          maxMembers: Number(formMaxMembers),
          description: formDescription.trim(),
          features: featuresArray,
          isPopular: formIsPopular,
          billingCycle: formBillingCycle,
        });

        if (res?.success) {
          toast.success("Plan updated successfully!");
          handleCancelForm();
          loadPlans();
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-sky-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                Superadmin Plans & Pricing Configuration
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Define and edit subscription tiers, pricing, and member capacity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Create or Edit Form */}
          {(isCreatingNew || editingPlan) && (
            <form
              onSubmit={handleSave}
              className="p-5 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/20 dark:bg-sky-950/20 space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between border-b border-sky-100 dark:border-gray-800 pb-3">
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  {isCreatingNew ? "Create New Subscription Tier" : `Edit Plan: ${editingPlan?.name}`}
                </h4>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  Cancel Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Plan Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Plan Display Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Pro Growth"
                    className="w-full h-[38px] px-3 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>

                {/* Plan ID */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Plan Slug / ID (Unique)
                  </label>
                  <input
                    type="text"
                    value={formPlanId}
                    onChange={(e) => setFormPlanId(e.target.value)}
                    disabled={!isCreatingNew}
                    placeholder="e.g. pro"
                    className="w-full h-[38px] px-3 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full h-[38px] px-3 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>

                {/* Max Members Limit */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Max Team Members Allowed
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formMaxMembers}
                    onChange={(e) => setFormMaxMembers(Number(e.target.value))}
                    className="w-full h-[38px] px-3 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Target audience or key value proposition"
                  className="w-full h-[38px] px-3 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Features List (one per line) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Features & Facilities (1 item per line)
                </label>
                <textarea
                  rows={4}
                  value={formFeaturesText}
                  onChange={(e) => setFormFeaturesText(e.target.value)}
                  placeholder="Up to 25 team members&#10;Unlimited active sprints&#10;Custom workflows"
                  className="w-full p-2.5 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none font-sans"
                />
              </div>

              {/* Checkbox Popular */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="popularCheckbox"
                  checked={formIsPopular}
                  onChange={(e) => setFormIsPopular(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500 cursor-pointer"
                />
                <label
                  htmlFor="popularCheckbox"
                  className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Mark as &quot;Most Popular&quot; tier (Highlight badge in Org Admin)
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-3.5 py-2 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Plan Configuration"}</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Defined Plans */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Configured Subscription Tiers ({plans.length})
              </h4>
              {!isCreatingNew && !editingPlan && (
                <button
                  onClick={handleStartCreate}
                  className="h-8 px-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tier</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-10 text-center text-xs text-gray-400">Loading plan configs...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <div
                    key={p.planId}
                    className="p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950/60 shadow-2xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                          {p.name}
                        </span>
                        {p.isPopular && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            Popular
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-gray-400">ID: {p.planId}</span>

                      <div className="my-2.5 text-base font-black text-gray-900 dark:text-white">
                        ₹{p.price.toLocaleString()}{" "}
                        <span className="text-[11px] font-normal text-gray-400">/mo</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 mb-2">
                        <Users className="w-3.5 h-3.5" />
                        <span>Up to {p.maxMembers} members</span>
                      </div>

                      <ul className="space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                        {p.features?.slice(0, 3).map((f, i) => (
                          <li key={i} className="truncate flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                        {(p.features?.length || 0) > 3 && (
                          <li className="text-[10px] text-gray-400 italic">
                            + {(p.features?.length || 0) - 3} more facilities
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="h-7 px-2.5 rounded border border-slate-200 dark:border-gray-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
