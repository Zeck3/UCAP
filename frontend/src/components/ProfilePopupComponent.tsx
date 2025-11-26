import { useEffect, useRef, useState } from "react";
import { changePasswordRequest } from "../api/authApi";
import { toast } from "react-toastify";
import type { CurrentUser } from "../types/userTypes";
import type { AxiosError } from "axios";
import { useInitialInfo } from "../context/useInitialInfo";
import XIcon from "../assets/x-solid-full.svg?react";
import UserInputComponent from "./UserInputComponent";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: CurrentUser | null;
};

type ChangePasswordError = {
  old_password?: string[];
  new_password?: string[];
  detail?: string;
};

export default function ProfilePopupComponent({
  isOpen,
  onClose,
  user,
}: Props) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);
  const noopChange = () => {};
  const { initialInfo } = useInitialInfo();

  const effectiveInitial =
    initialInfo && initialInfo.user_id === user?.user_id ? initialInfo : null;

  useEffect(() => {
    if (!err) return;
    const t = setTimeout(() => setErr(""), 3000);
    return () => clearTimeout(t);
  }, [err]);

  if (!isOpen) return null;

  const userIdDisplay = effectiveInitial?.user_id ?? user?.user_id ?? "—";

  const nameDisplay =
    [
      effectiveInitial?.last_name ?? user?.last_name,
      effectiveInitial?.first_name ?? user?.first_name,
    ]
      .filter(Boolean)
      .join(", ") || "—";

  const emailDisplay = effectiveInitial?.email ?? user?.email ?? "—";

  const roleTypeDisplay = effectiveInitial?.user_role_type ?? "N/A";

  const deptNamesDisplay = effectiveInitial?.departments?.length
    ? effectiveInitial.departments.map((d) => d.department_name).join(", ")
    : "None";

  const designationDisplay = effectiveInitial?.leadership?.name ?? "N/A";

  const resetPasswordFields = () => {
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    setErr("");
  };

  const handleClose = () => {
    resetPasswordFields();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");

    if (!oldPass.trim() || !newPass.trim() || !confirmPass.trim()) {
      setErr("Please fill all password fields.");
      return;
    }
    if (newPass !== confirmPass) {
      setErr("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      await changePasswordRequest(oldPass, newPass);
      toast.success("Password updated successfully");
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
      handleClose();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<ChangePasswordError>;
      const data = axiosErr.response?.data;

      const msg =
        data?.old_password?.[0] ||
        data?.new_password?.[0] ||
        data?.detail ||
        "Failed to update password. Please check your old password.";

      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-4000 flex items-center justify-center bg-[#3e3e3e30]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl flex flex-col w-150 h-125 max-w-full border border-[#E9E6E6] shadow-sm"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 px-8 pt-8 border-b border-[#E9E6E6]">
          <h2 className="text-lg">Profile</h2>
          <button
            type="button"
            onClick={handleClose}
            className=""
            aria-label="Close profile"
          >
            <XIcon className="h-5 w-5 text-[#767676]" />
          </button>
        </div>
        <div className="overflow-y-auto p-8 pr-5 mb-8">
          <div className="flex flex-col">
            <p className="text-[#767676]">Basic Information</p>
            <br />
            <UserInputComponent
              label="User ID"
              name="profile_user_id"
              value={String(userIdDisplay)}
              readOnly
              onChange={noopChange}
            />
            <UserInputComponent
              label="Name"
              name="profile_name"
              value={nameDisplay}
              readOnly
              onChange={noopChange}
            />
            <UserInputComponent
              label="Email"
              name="profile_email"
              value={emailDisplay}
              readOnly
              onChange={noopChange}
            />
            <UserInputComponent
              label="Role"
              name="profile_role"
              value={roleTypeDisplay}
              readOnly
              onChange={noopChange}
            />
            <UserInputComponent
              label="Designation"
              name="profile_designation"
              value={designationDisplay}
              readOnly
              onChange={noopChange}
            />
            <UserInputComponent
              label="Teaching Departments"
              name="profile_depts"
              value={deptNamesDisplay}
              readOnly
              onChange={noopChange}
            />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <br />
            <p className="text-[#767676]">Change Password</p>
            <br />
            <UserInputComponent
              label="Old Password"
              name="oldPass"
              type="password"
              value={oldPass}
              onChange={(_, v) => setOldPass(v)}
              loading={loading}
              error={err ? "" : undefined}
            />
            <UserInputComponent
              label="New Password"
              name="newPass"
              type="password"
              value={newPass}
              onChange={(_, v) => setNewPass(v)}
              loading={loading}
            />
            <UserInputComponent
              label="Confirm New Password"
              name="confirmPass"
              type="password"
              value={confirmPass}
              onChange={(_, v) => setConfirmPass(v)}
              loading={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-ucap-yellow bg-ucap-yellow-hover cursor-pointer text-white rounded-md disabled:opacity-60"
            >
              {loading ? "Saving..." : "Update Password"}
            </button>
            {err && (
              <p className="text-red-500 text-sm mt-2 text-center">{err}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
