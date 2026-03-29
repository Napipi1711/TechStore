import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, message, Modal, Tag } from "antd";
import {
  ArrowLeft,
  Users,
  User as UserIcon,
  ShieldCheck,
  Search,
  X,
  Trash2,
  UserPlus,
  Info
} from "lucide-react";

import branchApi from "../../api/branchApi";
import accountApi from "../../api/accountApi";
import userBranchApi from "../../api/userApi";

const normalizeRole = (role) => String(role || "").trim().toLowerCase();
const isManagerRole = (role) => normalizeRole(role) === "branch_manager";

export default function BranchPersonnelUpdate() {
  const { id: branchId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState(null);
  const [personnel, setPersonnel] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(null);
  const [assignedUserIds, setAssignedUserIds] = useState(new Set());
  const [pickOpen, setPickOpen] = useState(false);
  const [pickUser, setPickUser] = useState(null);
  const [pickRole, setPickRole] = useState("staff");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchRes, personnelRes, accountsRes, assignedRes] =
        await Promise.all([
          branchApi.getById(branchId),
          userBranchApi.getPersonnel(branchId),
          accountApi.getAll(),
          userBranchApi.getAssignedUserIds(),
        ]);

      setBranch(branchRes.data);
      setPersonnel(personnelRes.data || []);
      setAccounts(accountsRes.data?.users || []);
      const ids = (assignedRes.data?.userIds || []).map((x) => String(x));
      setAssignedUserIds(new Set(ids));
    } catch (e) {
      console.error(e);
      message.error("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [branchId]);

  const hasManager = useMemo(() => personnel.some((p) => isManagerRole(p?.role)), [personnel]);
  const currentManager = useMemo(() => personnel.find((p) => isManagerRole(p?.role)) || null, [personnel]);
  const assignedIds = useMemo(() => new Set(personnel.map((p) => p?.userId?._id).filter(Boolean)), [personnel]);
  const normalizedQ = q.trim().toLowerCase();

  const candidates = useMemo(() => {
    return accounts
      .filter((u) => u?.isActive !== false)
      .filter((u) => normalizeRole(u?.role) !== "admin")
      .filter((u) => !assignedIds.has(u?._id))
      .filter((u) => !assignedUserIds.has(String(u?._id)))
      .filter((u) => {
        if (!normalizedQ) return true;
        const name = (u?.name || "").toLowerCase();
        const email = (u?.email || "").toLowerCase();
        const code = (u?.userCode || "").toLowerCase();
        return name.includes(normalizedQ) || email.includes(normalizedQ) || code.includes(normalizedQ);
      });
  }, [accounts, assignedIds, assignedUserIds, normalizedQ]);

  const confirmRemove = (mapping) => {
    Modal.confirm({
      title: "Gỡ nhân sự khỏi chi nhánh?",
      content: "Thao tác này sẽ xóa liên kết giữa nhân sự và chi nhánh này.",
      okText: "Xác nhận gỡ",
      okType: 'danger',
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setBusy(mapping?._id);
          await userBranchApi.remove(mapping?._id);
          message.success("Đã gỡ nhân sự.");
          fetchData();
        } catch (e) {
          message.error("Gỡ thất bại.");
        } finally {
          setBusy(null);
        }
      },
    });
  };

  const addStaff = async (userId) => {
    try {
      setBusy(userId);
      await userBranchApi.addStaff({ branchId, userId });
      message.success("Đã thêm nhân viên.");
      fetchData();
    } catch (e) {
      message.error("Thêm thất bại.");
    } finally {
      setBusy(null);
    }
  };

  const assignManager = async (userId) => {
    try {
      setBusy(userId);
      await userBranchApi.assignManager({ branchId, userId });
      message.success("Đã gán quản lý.");
      fetchData();
    } catch (e) {
      message.error("Gán quản lý thất bại.");
    } finally {
      setBusy(null);
    }
  };

  const openPickRole = (u) => {
    setPickUser(u);
    setPickRole("staff");
    setPickOpen(true);
  };

  const closePickRole = () => {
    if (busy) return;
    setPickOpen(false);
    setPickUser(null);
  };

  const confirmPickRole = async () => {
    if (!pickUser?._id) return;
    try {
      setBusy(pickUser._id);
      if (pickRole === "branch_manager") {
        await assignManager(pickUser._id);
      } else {
        await addStaff(pickUser._id);
      }
      setPickOpen(false);
      setPickUser(null);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white gap-3">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      <span className="font-black text-[10px] uppercase tracking-widest text-black/40">Synchronizing...</span>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 bg-white min-h-screen text-black">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
          <div className="space-y-1">
            <button
              onClick={() => navigate(`/branches/view/${branchId}`)}
              className="group flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-3 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Quay lại chi nhánh
            </button>
            <h1 className="text-3xl lg:text-4xl font-black text-black tracking-tighter uppercase italic">
              Personnel <span className="text-blue-600">Update</span>
            </h1>
            <p className="text-[11px] font-bold text-black/30 uppercase tracking-widest">
              {branch?.name} • Quản lý đội ngũ nhân sự tập trung
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="px-5 py-2 border-2 border-black rounded-full text-[10px] font-black uppercase tracking-widest">
              System Verified Case
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* LEFT: CANDIDATES SEARCH */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[12px] font-black uppercase tracking-[0.25em] flex items-center gap-3">
                  <Users size={18} /> Ứng viên tự do
                </h2>
                <span className="text-[10px] font-black text-black/20 uppercase tracking-widest italic">
                  {candidates.length} Available
                </span>
              </div>

              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  className="w-full pl-14 pr-12 py-5 bg-slate-50 rounded-3xl border-2 border-transparent focus:bg-white focus:border-black outline-none text-sm font-bold tracking-tight transition-all placeholder:text-black/20"
                  placeholder="Tìm theo tên, email hoặc mã nhân viên..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                {q && (
                  <button onClick={() => setQ("")} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-black hover:text-white rounded-xl transition-all">
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {candidates.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                    <p className="text-black/20 text-[10px] font-black uppercase tracking-widest">No candidates found</p>
                  </div>
                ) : (
                  candidates.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:border-black transition-all group shadow-sm hover:shadow-xl hover:shadow-slate-100">
                      <div className="flex items-center gap-5">
                        <Avatar size={52} src={u?.avatar} icon={<UserIcon />} className="bg-slate-50 border border-slate-100" />
                        <div>
                          <p className="text-sm font-black text-black uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors">{u?.name}</p>
                          <p className="text-[11px] font-bold text-black/30 truncate uppercase tracking-tighter italic">
                            {u?.email} <span className="mx-2 text-black/10">|</span> #{u?.userCode || '---'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openPickRole(u)}
                        disabled={busy === u?._id}
                        className="bg-black text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
                      >
                        Thêm
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: CURRENT STAFF */}
          <div className="lg:col-span-5 space-y-10">

            {/* MANAGER CARD - NOW WHITE STYLE */}
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-black shadow-2xl shadow-slate-100 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-blue-600 font-black text-[11px] uppercase tracking-[0.25em]">
                  <ShieldCheck size={20} />
                  <span>Manager In Charge</span>
                </div>
                {currentManager && (
                  <Tag color="black" className="m-0 text-[9px] font-black uppercase px-3 py-0.5 rounded-full border-none">Verified</Tag>
                )}
              </div>

              {currentManager ? (
                <div className="flex items-center justify-between bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar size={60} src={currentManager?.userId?.avatar} className="border-2 border-white shadow-md" />
                    <div className="min-w-0">
                      <p className="text-sm font-black uppercase tracking-tight truncate leading-none mb-1.5">{currentManager?.userId?.name}</p>
                      <p className="text-[11px] text-black/40 font-bold truncate italic">{currentManager?.userId?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => confirmRemove(currentManager)}
                    disabled={busy === currentManager?._id}
                    className="ml-4 p-3 bg-white border border-slate-200 text-black rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <p className="text-black/20 text-[10px] font-black uppercase tracking-widest mb-2">Chưa gán quản lý</p>
                  <p className="text-[9px] text-black/30 font-bold uppercase tracking-tighter italic">Vui lòng chọn nhân sự bên trái</p>
                </div>
              )}
            </div>

            {/* STAFF LIST CARD */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em]">Cơ cấu nhân sự</h3>
                <span className="text-[11px] font-black bg-slate-50 px-3 py-1 rounded-full">{personnel.length} Member</span>
              </div>

              <div className="space-y-4">
                {personnel.length === 0 ? (
                  <p className="text-black/20 text-[11px] font-black text-center py-6 uppercase tracking-widest italic">No members assigned</p>
                ) : (
                  personnel.map((p) => (
                    <div key={p._id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-black transition-all group">
                      <div className="flex items-center gap-4">
                        <Avatar size={40} src={p?.userId?.avatar} icon={<UserIcon />} className="bg-slate-50" />
                        <div>
                          <p className="text-[12px] font-black text-black uppercase leading-none mb-1.5">{p?.userId?.name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isManagerRole(p?.role) ? "bg-blue-600" : "bg-slate-300"}`} />
                            <span className="text-[9px] font-black uppercase text-black/40 tracking-widest">
                              {isManagerRole(p?.role) ? "Branch Manager" : "Staff Member"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => confirmRemove(p)}
                        disabled={busy === p?._id}
                        className="p-2 text-black/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="text-center space-y-2 opacity-20 group hover:opacity-100 transition-opacity">
              <p className="text-[9px] text-black font-black uppercase tracking-[0.4em]">Tech Store Management</p>
              <div className="h-[1px] w-12 bg-black mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL ROLE - MINIMALIST STYLE */}
      <Modal
        open={pickOpen}
        onCancel={closePickRole}
        footer={null}
        centered
        width={400}
        closeIcon={<X size={18} className="text-black/20" />}
      >
        <div className="p-2 text-center">
          <div className="mb-8">
            <Avatar size={80} src={pickUser?.avatar} icon={<UserIcon />} className="border-4 border-white shadow-2xl mb-4 bg-slate-50" />
            <h2 className="text-xl font-black text-black uppercase tracking-tight">{pickUser?.name}</h2>
            <p className="text-[11px] text-black/30 font-bold uppercase tracking-widest italic">{pickUser?.email}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setPickRole("staff")}
              className={`w-full py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${pickRole === "staff" ? "border-black bg-black text-white shadow-xl shadow-slate-200" : "border-slate-100 text-black/30 hover:border-slate-200"
                }`}
            >
              <UserIcon size={16} /> Assign As Staff
            </button>

            <button
              onClick={() => !hasManager && setPickRole("branch_manager")}
              disabled={hasManager}
              className={`w-full py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${pickRole === "branch_manager" ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-100" : "border-slate-100 text-black/30"
                } ${hasManager ? "opacity-20 cursor-not-allowed" : "hover:border-slate-200 hover:text-black"}`}
            >
              <ShieldCheck size={16} /> Assign As Manager
            </button>

            {hasManager && (
              <p className="text-[9px] font-bold text-red-400 uppercase tracking-tighter mt-2 flex items-center justify-center gap-1">
                <Info size={10} /> Chi nhánh đã có quản lý trực thuộc
              </p>
            )}

            <button
              onClick={confirmPickRole}
              disabled={!!busy}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] mt-8 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              {busy ? "Processing..." : "Xác nhận thiết lập"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}