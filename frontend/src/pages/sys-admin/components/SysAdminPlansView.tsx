import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Users,
  Sparkles,
  Save,
  RotateCw,
} from "lucide-react";
import { toast } from "react-toastify";
import { planService } from "../../../services/planService";
import { IPlan, SysAdminPlansViewProps } from "../../../types";
import { SYSADMIN_PLANS_TEXTS } from "../../../constants/billingTexts";

export const SysAdminPlansView: React.FC<SysAdminPlansViewProps> = () => {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingPlan, setEditingPlan] = useState<IPlan | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<IPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formPlanId, setFormPlanId] = useState("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formMaxMembers, setFormMaxMembers] = useState<number>(5);
  const [formDescription, setFormDescription] = useState("");
  const [formFeaturesText, setFormFeaturesText] = useState("");
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formBillingCycle, setFormBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const loadPlans = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await planService.getAllPlansForAdmin();
      if (res?.success) {
        setPlans(res.plans);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load plans");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    setEditingPlan(null);
    setIsCreatingNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPlanId.trim()) {
      toast.error(SYSADMIN_PLANS_TEXTS.ERR_REQUIRED_FIELDS);
      return;
    }

    const numPrice = Number(formPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error(SYSADMIN_PLANS_TEXTS.ERR_INVALID_PRICE);
      return;
    }

    const numMembers = Number(formMaxMembers);
    if (isNaN(numMembers) || numMembers < 1) {
      toast.error(SYSADMIN_PLANS_TEXTS.ERR_INVALID_MEMBERS);
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
          toast.success(SYSADMIN_PLANS_TEXTS.SUCCESS_CREATED);
          handleCancelForm();
          loadPlans(true);
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
          toast.success(SYSADMIN_PLANS_TEXTS.SUCCESS_UPDATED);
          handleCancelForm();
          loadPlans(true);
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeletePlan = async () => {
    if (!planToDelete?._id) return;
    setDeleting(true);
    try {
      const res = await planService.deletePlan(planToDelete._id);
      if (res?.success) {
        toast.success(SYSADMIN_PLANS_TEXTS.SUCCESS_DELETED);
        setPlanToDelete(null);
        loadPlans(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete plan");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-3.5 w-64 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="flex gap-2">
            <div className="h-[38px] w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-[38px] w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="flex gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
              <div className="h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-800/60" />
              <div className="py-3 border-y border-gray-100 dark:border-gray-800 space-y-1">
                <div className="h-7 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-8 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
              <div className="space-y-2 pt-1">
                {[1, 2, 3].map((f) => (
                  <div key={f} className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SIMPLE HEADER */}
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-500" />
            {SYSADMIN_PLANS_TEXTS.HEADER_TITLE}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {SYSADMIN_PLANS_TEXTS.HEADER_SUBTITLE}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadPlans(true)}
            disabled={refreshing}
            className="h-[38px] px-3 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            title={SYSADMIN_PLANS_TEXTS.BTN_REFRESH_TITLE}
          >
            <RotateCw className={`w-3.5 h-3.5 text-sky-500 ${refreshing ? "animate-spin" : ""}`} />
            <span>{SYSADMIN_PLANS_TEXTS.BTN_REFRESH_TITLE}</span>
          </button>

          {!isCreatingNew && !editingPlan && (
            <button
              onClick={handleStartCreate}
              className="h-[38px] px-4 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{SYSADMIN_PLANS_TEXTS.BTN_NEW_TIER}</span>
            </button>
          )}
        </div>
      </div>

      {/* PLAN CREATE / EDIT FORM */}
      {(isCreatingNew || editingPlan) && (
        <form
          onSubmit={handleSave}
          className="p-6 rounded-2xl border border-sky-300 dark:border-sky-900 bg-sky-50/20 dark:bg-sky-950/20 shadow-sm space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-sky-100 dark:border-gray-800 pb-3">
            <h4 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              {isCreatingNew
                ? SYSADMIN_PLANS_TEXTS.FORM_TITLE_CREATE
                : `${SYSADMIN_PLANS_TEXTS.FORM_TITLE_EDIT}: ${editingPlan?.name}`}
            </h4>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {SYSADMIN_PLANS_TEXTS.BTN_CANCEL}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {SYSADMIN_PLANS_TEXTS.LABEL_NAME}
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={SYSADMIN_PLANS_TEXTS.PLACEHOLDER_NAME}
                className="w-full h-[38px] px-3 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {SYSADMIN_PLANS_TEXTS.LABEL_PLAN_ID}
              </label>
              <input
                type="text"
                value={formPlanId}
                onChange={(e) => setFormPlanId(e.target.value)}
                disabled={!isCreatingNew}
                placeholder={SYSADMIN_PLANS_TEXTS.PLACEHOLDER_PLAN_ID}
                className="w-full h-[38px] px-3 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {SYSADMIN_PLANS_TEXTS.LABEL_PRICE}
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

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {SYSADMIN_PLANS_TEXTS.LABEL_MAX_MEMBERS}
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

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {SYSADMIN_PLANS_TEXTS.LABEL_DESCRIPTION}
            </label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={SYSADMIN_PLANS_TEXTS.PLACEHOLDER_DESC}
              className="w-full h-[38px] px-3 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {SYSADMIN_PLANS_TEXTS.LABEL_FEATURES}
            </label>
            <textarea
              rows={3}
              value={formFeaturesText}
              onChange={(e) => setFormFeaturesText(e.target.value)}
              placeholder={SYSADMIN_PLANS_TEXTS.PLACEHOLDER_FEATURES}
              className="w-full p-2.5 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none font-sans"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="popularCheckSuper"
              checked={formIsPopular}
              onChange={(e) => setFormIsPopular(e.target.checked)}
              className="rounded text-sky-500 focus:ring-sky-500 cursor-pointer"
            />
            <label
              htmlFor="popularCheckSuper"
              className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              {SYSADMIN_PLANS_TEXTS.LABEL_POPULAR_BADGE}
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-sky-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-3.5 py-2 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              {SYSADMIN_PLANS_TEXTS.BTN_CANCEL}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? SYSADMIN_PLANS_TEXTS.BTN_SAVING : SYSADMIN_PLANS_TEXTS.BTN_SAVE}</span>
            </button>
          </div>
        </form>
      )}

      {/* PLAN TIERS GRID */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          {SYSADMIN_PLANS_TEXTS.HEADER_TITLE}
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading plan tiers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div
                key={p.planId}
                className="p-5 rounded-2xl border border-slate-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-gray-900 dark:text-white">
                      {p.name}
                    </span>
                    {p.isPopular && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        Popular
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-gray-400">Plan ID: {p.planId}</span>

                  <div className="my-3 py-2 border-y border-gray-100 dark:border-gray-800 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      ₹{p.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400">{SYSADMIN_PLANS_TEXTS.CARD_MONTH_SUFFIX}</span>
                  </div>

                  <div className="mb-3 p-2.5 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-sky-500" />
                    <span>{SYSADMIN_PLANS_TEXTS.CARD_MEMBERS_CAPACITY(p.maxMembers)}</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                    {p.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  {p.planId !== "free" && (
                    <button
                      onClick={() => setPlanToDelete(p)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title={SYSADMIN_PLANS_TEXTS.BTN_DELETE}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleStartEdit(p)}
                    className="ml-auto h-8 px-3 rounded-lg border border-slate-200 dark:border-gray-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Tier</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE PLAN CONFIRMATION MODAL */}
      {planToDelete && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => !deleting && setPlanToDelete(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-sky-100 dark:border-gray-800 max-w-sm w-full p-6 space-y-4 animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {SYSADMIN_PLANS_TEXTS.DELETE_MODAL_TITLE}
                </h3>
                <p className="text-xs text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {SYSADMIN_PLANS_TEXTS.DELETE_CONFIRM_QUESTION(planToDelete.name)}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setPlanToDelete(null)}
                className="px-4 py-2 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                {SYSADMIN_PLANS_TEXTS.BTN_CANCEL}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDeletePlan}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                {deleting ? SYSADMIN_PLANS_TEXTS.BTN_DELETING : SYSADMIN_PLANS_TEXTS.BTN_DELETE}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SysAdminPlansView;
