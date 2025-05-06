"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import useAuthService from "@/services/AuthService";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { setTokens } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useAlert } from "@/context/AlertContext";
import Spinner from "../ui/spinner/Spinner";

interface FormInterface {
  email: string,
  password: string
}

interface ErrMsgInterface {
  email: boolean,
  password: boolean
}

export default function SignInForm() {
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [form, setForm] = useState<FormInterface>({
    email: "",
    password: ""
  })
  const [showErrMsg, setShowErrMsg] = useState<ErrMsgInterface>({
    email: false,
    password: false
  })
  const { login } = useAuthService()
  const router = useRouter()

  const handleSubmitLogin = async(e: FormEvent) => {
    try {
      setLoading(true)
      e.preventDefault()
      console.log({form: form.email})
      if(form.email === "" || form.password === ""){
        if(form.email === ""){
          console.log("disini")
          setShowErrMsg({ ...showErrMsg, email: true})
        }
        if(form.password === ""){
          setShowErrMsg({ ...showErrMsg, password: true})
        }
        return
      }
      setShowErrMsg({ email: false, password: false})
      const response = await login(form)
      console.log("response login:", response)
      if(response?.status===201){
        setTokens(response.data.accessToken, response.data.refreshToken)
      }
      router.push("/")
      showAlert({
        variant: "success",
        title: "Sukses",
        message: "Selamat datang!",
    })
    } catch (error) {
      console.error(error)
    } finally{
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-1">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Login
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Silakan masuk ke akun Anda
            </p>
          </div>
          <div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
            </div>
            <form onSubmit={handleSubmitLogin}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    type="email" 
                    placeholder="Masukkan email yang terdaftar" 
                    defaultValue={form?.email} 
                    onChange={(e)=>{
                      setShowErrMsg({ ...showErrMsg, email: false})
                      setForm({...form, email: e.target.value})
                    }} 
                    className={`${ showErrMsg.email && "border-red-600"}`}
                  />
                  { showErrMsg.email && <Label className="text-red-600 font-light">Silakan masukkan email terlebih dahulu</Label>}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      defaultValue={form?.password}
                      onChange={(e)=>{
                        setShowErrMsg({ ...showErrMsg, password: false})
                        setForm({ ...form, password: e.target.value})
                      }}
                      className={`${ showErrMsg.password && "border-red-600"}`}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {showErrMsg.password && <Label className="text-red-600 font-light">Silakan masukkan password Anda</Label>}
                </div>
                <div className="flex items-center justify-between">
                  <Link
                    href="/reset-password"
                    className="text-sm text-blue-400 hover:text-blue-500 dark:text-blue-400"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div>
                  <Button disabled={loading} type="submit" className="w-full flex items-center gap-2 bg-primary1 dark:bg-gray-600 text-white py-3" size="sm">
                    { loading && <Spinner/> }
                    Login
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
