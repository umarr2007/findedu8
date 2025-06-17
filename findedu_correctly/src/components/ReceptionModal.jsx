import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ReceptionModal = ({ isOpen, onClose, centerId, receptionId, initialFormData }) => {
  const [formData, setFormData] = useState(initialFormData || {
    date: "",
    time: "",
    majorId: "",
  });
  const [majors, setMajors] = useState([]);
  const [receptionData, setReceptionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Yo'nalishlarni olish
      axios
        .get("https://findcourse.net.uz/api/major")
        .then((res) => setMajors(res.data.data || []))
        .catch(() => toast.error("Yo'nalishlarni yuklashda xatolik"));

      // Agar receptionId bo'lsa, ma'lumotlarni olish
      if (receptionId) {
        console.log('ReceptionId mavjud:', receptionId);
        fetchReceptionData();
      } else {
        console.log('ReceptionId yo\'q, yangi yozilish formasi ochiladi');
        // Yangi yozilish uchun formani tozalash
        setFormData(initialFormData || {
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          majorId: "",
        });
        setReceptionData(null);
      }
    }
  }, [isOpen, receptionId, initialFormData]);

  const fetchReceptionData = async () => {
    try {
      setLoading(true);
      console.log('Ma\'lumotlar yuklanmoqda...');
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Avval tizimga kiring");
        return;
      }

      const res = await axios.get(`https://findcourse.net.uz/api/reseption/${receptionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('API javobi:', res.data);

      if (res.data) {
        setReceptionData(res.data);
        // Formani to'ldirish
        const visitDate = new Date(res.data.visitDate);
        setFormData({
          date: visitDate.toISOString().split('T')[0],
          time: visitDate.toTimeString().slice(0, 5),
          majorId: res.data.majorId.toString(),
        });
        console.log('Ma\'lumotlar yuklandi:', res.data);
      }
    } catch (err) {
      console.error('Ma\'lumotlarni olishda xatolik:', err);
      toast.error(err.response?.data?.message || "Ma'lumotlarni olishda xatolik yuz berdi");
      setReceptionData(null); // Xatolik bo'lsa receptionData ni null qilish
    } finally {
      setLoading(false);
      console.log('Yuklash tugadi, loading:', false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Avval tizimga kiring");

    if (!formData.majorId) return toast.error("Yo'nalishni tanlang");
    if (!formData.date || !formData.time)
      return toast.error("Sana va vaqtni to'g'ri kiriting");

    const visitDate = `${formData.date}T${formData.time}:00`;
    const data = {
      visitDate,
      centerId: parseInt(centerId),
      majorId: parseInt(formData.majorId),
    };

    try {
      setLoading(true);
      const res = await axios.post(
        "https://findcourse.net.uz/api/reseption",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (res.status === 201 || res.status === 200) {
        setReceptionData(res.data);
        toast.success("Darsga yozildingiz, sizni kutamiz!");
        onClose();
      } else {
        toast.error("Xatolik yuz berdi");
      }
    } catch (err) {
      console.error('Xatolik:', err.response?.data);
      if (err.response?.status === 422) {
        const msg = Object.values(err.response.data.errors || {})
          .flat()
          .join(", ");
        toast.error(msg || "Formani to'ldirishda xatolik");
      } else {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Avval tizimga kiring");

    try {
      setLoading(true);
      await axios.delete(
        `https://findcourse.net.uz/api/reseption/${receptionData.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Yozilish bekor qilindi");
      setReceptionData(null);
      setIsDeleteModalOpen(false);
      onClose();
    } catch (err) {
      toast.error("O'chirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#beb8b8] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {receptionId ? "Navbat ma'lumotlari" : "Darsga yozilish"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Yuklanmoqda...</div>
        ) : receptionData ? (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yozilish ma'lumotlari</h3>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-red-600 hover:text-red-800"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
            <p><b>ID:</b> {receptionData.id}</p>
            <p><b>Yo'nalish:</b> {majors.find(m => m.id === receptionData.majorId)?.name || receptionData.majorId}</p>
            <p><b>Status:</b> {receptionData.status}</p>
            <p><b>Tashrif:</b> {new Date(receptionData.visitDate).toLocaleString()}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Yo'nalish
              </label>
              <select
                name="majorId"
                value={formData.majorId}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Tanlang</option>
                {majors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sana</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vaqt</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? "Yuborilmoqda..." : "Yozilish"}
              </button>
            </div>
          </form>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">
                Yozilishni bekor qilish
              </h3>
              <p className="mb-6">
                Haqiqatdan ham yozilishni bekor qilmoqchimisiz?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Bekor
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                  disabled={loading}
                >
                  {loading ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionModal;
