import React, { useEffect, useState } from "react";
import {
  UserPlus,
  ArrowLeft,
  Building,
  User,
  Mail,
  Lock,
  Check,
} from "lucide-react";
import { authService } from "../services/authService";
import { orgService } from "../services/orgService";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
import { TOAST_MESSAGES } from "../constants/messages";
import { AUTH_TEXTS } from "../constants/uiTexts";

import { SignupProps, Organization } from "../types";

export const Signup: React.FC<SignupProps> = ({ onSwitchMode }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organization: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const data = await orgService.getPublicOrgs();
        if (data?.success && data?.organizations) {
          setOrganizations(data.organizations);
        }
      } catch (err) {
        console.error(TOAST_MESSAGES.AUTH_ORG_LIST_ERROR, err);
      }
    };
    fetchOrgs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.organization
    ) {
      setError(AUTH_TEXTS.ERROR_FILL_DETAILS);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const data = await authService.register(formData);
      if (data?.success) {
        setSuccessMessage(data.message || AUTH_TEXTS.SIGNUP_SUCCESS_DEFAULT);
        setFormData({ name: "", email: "", password: "", organization: "" });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || AUTH_TEXTS.ERROR_REGISTRATION_FAILED
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" max-w-md w-full bg-white shadow-lg border border-sky-100 rounded-xl p-8 space-y-5">
      <div className="text-center">
        <div className=" w-14 h-14 bg-gradient-to-r from-cyan-500 to-sky-600 rounded-full mx-auto flex items-center justify-center mb-3">
          <UserPlus className=" w-7 h-7 text-white" />
        </div>
        <h2 className=" text-2xl font-bold text-gray-800">
          {AUTH_TEXTS.SIGNUP_TITLE}
        </h2>
        <p className=" text-gray-400 text-xs mt-1">
          {AUTH_TEXTS.SIGNUP_SUBTITLE}
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-655 bg-red-50 p-3 rounded-lg border border-red-100 font-medium animate-fadeIn">
          {error}
        </div>
      )}

      {successMessage ? (
        <div className="space-y-4 py-2 text-center animate-fadeIn">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-200">
            <Check className="w-6 h-6 text-green-650" />
          </div>
          <p className="text-xs text-green-800 bg-green-50/50 p-4 rounded-xl border border-green-100 font-bold leading-relaxed">
            {successMessage}
          </p>
          <Button
            type="button"
            onClick={onSwitchMode}
            className="w-full"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            {AUTH_TEXTS.SIGNUP_BTN_BACK}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className=" space-y-4">
          <Input
            label={AUTH_TEXTS.SIGNUP_INPUT_NAME}
            type="text"
            placeholder={AUTH_TEXTS.SIGNUP_PLACEHOLDER_NAME}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            icon={<User className="w-4.5 h-4.5" />}
            required
          />

          <Input
            label={AUTH_TEXTS.SIGNUP_INPUT_EMAIL}
            type="email"
            placeholder={AUTH_TEXTS.SIGNUP_PLACEHOLDER_EMAIL}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            icon={<Mail className="w-4.5 h-4.5" />}
            required
          />

          <Input
            label={AUTH_TEXTS.SIGNUP_INPUT_PASSWORD}
            type="password"
            placeholder={AUTH_TEXTS.SIGNUP_PLACEHOLDER_PASSWORD}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            icon={<Lock className="w-4.5 h-4.5" />}
            required
          />

          <Select
            label={AUTH_TEXTS.SIGNUP_INPUT_ORG}
            value={formData.organization}
            onChange={(e) =>
              setFormData({ ...formData, organization: e.target.value })
            }
            icon={<Building className="w-4.5 h-4.5" />}
            options={[
              { label: AUTH_TEXTS.SIGNUP_PLACEHOLDER_ORG, value: "" },
              ...organizations.map((org) => ({
                label: org.name,
                value: org._id,
              })),
            ]}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            loading={loading}
          >
            {AUTH_TEXTS.SIGNUP_BTN_SUBMIT}
          </Button>

          <p className=" text-center text-xs text-gray-550 mt-4">
            {AUTH_TEXTS.SIGNUP_HAS_ACCOUNT}{" "}
            <button
              type="button"
              onClick={onSwitchMode}
              className=" text-sky-600 hover:text-sky-700 hover:underline font-bold transition-colors cursor-pointer"
            >
              {AUTH_TEXTS.SIGNUP_BTN_LOGIN}
            </button>
          </p>
        </form>
      )}
    </div>
  );
};

export default Signup;
