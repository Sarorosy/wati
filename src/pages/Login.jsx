import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogInIcon, MailIcon } from "lucide-react";
import { useAuth } from "../utils/idb";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  

  const [logginIn, setLogginIn] = useState(false);
  const handleSubmit = async () => {
    
      if (!username) {
        toast.error("Pls Enter Username");
        return;
      }
      if (!password) {
        toast.error("Pls Enter Password");
        return;
      }
    

    try {
        setLogginIn(true);
      let payload = "";
      
        payload = { username, password };
      

      const response = await fetch("https://instacrm.rapidcollaborate.com/test/api/watilogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.status) {
        toast.success("Login success");
        login(data.user);
         navigate("/");
      } else {
        toast.error(data.message || "Invalid Username or Password" );
      }
    } catch (e) {
        console.log(e)
    }finally{
        setLogginIn(false)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f2f7ff] p-4">
      <form className="bg-white p-4 rounded shadow-md w-full max-w-sm space-y-3">
        <div className="flex justify-center border-b border-gray-300 pb-3">
          {/* <img src={logo} className="h-6 w-auto" /> */}
          <h2>Wati </h2>
        </div>
        <h2 className="text-[12px] text-gray-400 text-center">
          Sign into your account
        </h2>
        <div className="space-y-1 mb-4">
          {/* <label className="block text-[13px] font-medium">Email</label> */}
          <div className="relative">
            <input
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-2 py-1.5 text-[13px] border border-gray-300 rounded  
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                hover:border-gray-400 
                active:border-blue-600"
            />
            <div className="absolute inset-y-0 right-2 flex items-center text-gray-500">
             <MailIcon size={15}  />
            </div>
          </div>
        </div>

        <div className="space-y-1 relative">
          {/* <label className="block text-[13px] font-medium">Password</label> */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2 py-1.5 text-[13px] border border-gray-300 rounded  
         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
         hover:border-gray-400 
         active:border-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 cursor-pointer"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between mt-5">
          <div className="">
            {/* <button
              onClick={()=>{navigate('/forgot-password')}}
              type="button"
              className="text-[13px] text-green-600 hover:text-green-700  text-center transition cursor-pointer mx-auto"
            >
              Forgot Password ?
            </button> */}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault(); // prevent form submission
              handleSubmit();
            }}
            type="button"
            className="text-[13px] bg-green-600 text-white px-2 py-1.5 rounded hover:bg-green-700 transition cursor-pointer flex items-center gap-1 leading-none"
          >
            {logginIn ? "Logging.." : "Login"} <LogInIcon size={13} />
          </button>
        </div>

      </form>
    </div>
  );
};

export default Login;
