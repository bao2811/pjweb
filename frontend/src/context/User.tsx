// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";

// type User = {
//   id: number;
//   username: string;
//   email: string;
//   image: string; // Add image property
//   role: string;
// };

// type UserContextType = {
//   user: User | null;
//   loading: boolean;
//   error: string | null;
//   refetch: () => Promise<void>;
// };

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export const UserProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   const fetchUser = async () => {
//     try {
//       setLoading(true);
//       // const token = localStorage.getItem("token");
//       // const res = await axios.get<User>("http://localhost:8000/api/user", {
//       //   headers: {
//       //     Authorization: `Bearer ${token}`,
//       //   },
//       // });
//       // console.log("Fetched user:", res.data);
//       const user = localStorage.getItem("user");
//       setUser(user ? JSON.parse(user) : null);
//       setError(null);
//     } catch (err) {
//       setUser(null);
//       setError("Failed to fetch user");
//       localStorage.removeItem("token");
//       //   router.push("/login");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUser();
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, loading, error, refetch: fetchUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) throw new Error("useUser must be used within UserProvider");
//   return context;
// };

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

type User = {
  id: number;
  username: string;
  email: string;
  image: string;
  role: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);

      // ✅ Gọi API /api/user (cookie sẽ tự động được gửi kèm)
      const res = await axios.get<User>("http://localhost:8000/user/getuser", {
        withCredentials: true, // <-- quan trọng
      });

      setUser(res.data);
      setError(null);
    } catch (err) {
      setUser(null);
      setError("Không thể lấy thông tin user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
