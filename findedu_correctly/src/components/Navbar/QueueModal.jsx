//QueueModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const statusColors = {
  PENDING: "text-yellow-600",
  APPROVED: "text-green-600",
  REJECTED: "text-red-600",
};

const QueueModal = ({ isOpen, onClose }) => {
  const [receptions, setReceptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      console.log("QueueModal ochildi, navbatlar yuklanmoqda...");
      fetchReceptions();
    }
  }, [isOpen]);

  const fetchReceptions = async () => {
    setLoading(true);
    setError("");
    console.log("fetchReceptions boshlandi");
    try {
      const token = localStorage.getItem("token");
      console.log("Token: ", token);

      if (!token) {
        setError("Avval tizimga kiring");
        setLoading(false);
        console.log("Token yo'q, yuklash bekor qilindi.");
        return;
      }
      const res = await axios.get("https://findcourse.net.uz/api/reseption", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("API javobi: ", res.data);

      if (res.data && Array.isArray(res.data.data)) {
        setReceptions(res.data.data);
        console.log("Navbatlar yuklandi: ", res.data.data);
      } else {
        setReceptions([]);
        console.log("API dan bo'sh ma'lumot yoki noto'g'ri format keldi.");
      }
    } catch (err) {
      console.error("Navbatlarni yuklashda xatolik:", err);
      setError("Navbatlarni yuklashda xatolik yuz berdi.");
      setReceptions([]);
    } finally {
      setLoading(false);
      console.log("fetchReceptions tugadi.");
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) return setError("Avval tizimga kiring");
      await axios.delete(`https://findcourse.net.uz/api/reseption/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Navbat muvaffaqiyatli o'chirildi");
      fetchReceptions();
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
      toast.error("O'chirishda xatolik yuz berdi");
      setError("O'chirishda xatolik yuz berdi");
    } finally {
      setDeleteId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
          Navbatlarim
        </h2>
        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-800 rounded text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Yuklanmoqda...</div>
        ) : receptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Sizda navbatlar yo'q
          </div>
        ) : (
          <div className="grid gap-4">
            {receptions.map((r) => (
              <div
                key={r.id}
                className="bg-purple-50 rounded-xl p-4 shadow flex flex-col gap-2 relative"
              >
                <div className="text-lg font-bold text-purple-700 mb-1">
                  {r.center?.name || "Noma'lum markaz"}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">📍 Manzil:</span>{" "}
                  {r.center?.address || "Manzil ko'rsatilmagan, Noma'lum hudud"}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">📅 Tashrif sanasi:</span>{" "}
                  {r.visitDate
                    ? new Date(r.visitDate).toLocaleString("ru-RU")
                    : "-"}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">🧑‍💻 Yo'nalish:</span>{" "}
                  {r.major?.name || r.majorId || "optional"}
                </div>
                <div className="text-sm flex items-center gap-2">
                  <span className={statusColors[r.status] || "text-gray-600"}>
                    <b>🔖 {r.status}</b>
                  </span>
                </div>
                <button
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm mt-2 self-end"
                  onClick={() => handleDelete(r.id)}
                  disabled={deleteId === r.id}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {deleteId === r.id ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueModal;
