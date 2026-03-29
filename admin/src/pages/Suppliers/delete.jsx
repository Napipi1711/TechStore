import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supplierApi from "../../api/supplierApi";

export default function DeleteSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Delete this supplier?");

    if (!confirmDelete) {
      navigate("/suppliers");
      return;
    }

    try {
      await supplierApi.remove(id);
      alert("Supplier deleted successfully");
      navigate("/suppliers");
    } catch (error) {
      console.error("Delete supplier error:", error);
      alert(error?.response?.data?.message || "Delete failed");
      navigate("/suppliers");
    }
  };

  useEffect(() => {
    if (id) {
      handleDelete();
    }
  }, [id]);

  return (
    <div className="p-6 text-slate-600">
      Processing delete supplier...
    </div>
  );
}