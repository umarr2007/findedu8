import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const LikedCenters = () => {
  const [likedCentersData, setLikedCentersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedItemsMap, setLikedItemsMap] = useState({}); // centerId: likedItemId

  useEffect(() => {
    fetchLikedCenters();
  }, []);

  const fetchLikedCenters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Avval tizimga kiring");
        setLoading(false);
        return;
      }

      const userData = JSON.parse(localStorage.getItem("user"));
      const currentUserId = userData?.id;

      if (!currentUserId) {
        toast.error("Foydalanuvchi ma'lumotlari topilmadi. Qayta kiring.");
        setLoading(false);
        return;
      }

      const res = await axios.get("https://findcourse.net.uz/api/liked", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && Array.isArray(res.data.data)) {
        const userLikedItems = res.data.data.filter(item => item.userId === currentUserId);
        setLikedCentersData(userLikedItems);

        const tempLikedItemsMap = {};
        userLikedItems.forEach(item => {
          tempLikedItemsMap[item.centerId] = item.id;
        });
        setLikedItemsMap(tempLikedItemsMap);

      } else {
        setLikedCentersData([]);
      }
    } catch (err) {
      console.error("Yoqtirilgan markazlarni yuklashda xatolik:", err);
      setError(err.response?.data?.message || "Sevimlilarni yuklashda xatolik yuz berdi.");
      setLikedCentersData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (centerId, likedItemId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Avval tizimga kiring");
      return;
    }

    try {
      if (likedItemId) {
        // Sevimlilardan olib tashlash
        await axios.delete(`https://findcourse.net.uz/api/liked/${likedItemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Sevimlilardan olib tashlandi!");
      } else {
        // Sevimlilarga qo'shish (bu holatda sodir bo'lmasligi kerak, chunki bu sahifada faqat mavjud sevimlilar ko'rsatiladi)
        await axios.post("https://findcourse.net.uz/api/liked", { centerId }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Sevimlilarga qo'shildi!");
      }
      // Ma'lumotlarni yangilash
      fetchLikedCenters();
    } catch (err) {
      console.error("Sevimlilar xizmatida xatolik:", err);
      toast.error(err.response?.data?.message || "Sevimlilar xizmatida xatolik yuz berdi.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Sevimlilarim
      </h1>

      {likedCentersData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Sizda yoqtirilgan markazlar yo'q.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {likedCentersData.map((item) => (
            <div
              key={item.id} // Sevimli elementning ID'si
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                {item.center?.image ? (
                  <img
                    src={`https://findcourse.net.uz/api/image/${item.center.image}`}
                    alt={item.center?.name || "Markaz rasmi"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    Rasm mavjud emas
                  </div>
                )}
                <button
                  onClick={() => handleLikeToggle(item.centerId, item.id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 transition-opacity"
                >
                  <svg
                    className={`h-6 w-6 text-red-500`} // Har doim qizil, chunki bu yoqtirilgan markazlar sahifasi
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 22.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.center?.name}
                </h2>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm">
                      {typeof item.center?.address === "string"
                        ? item.center.address
                        : JSON.stringify(item.center?.address) || "Manzil mavjud emas"}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-sm">
                      {typeof item.center?.phone === "string"
                        ? item.center.phone
                        : JSON.stringify(item.center?.phone) ||
                          "Telefon raqam mavjud emas"}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/center/${item.center?.id}`}
                  className="block w-full text-center py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  Batafsil
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedCenters; 