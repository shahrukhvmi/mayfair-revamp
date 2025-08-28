import TextField from "../TextField/TextField";
import NextButton from "../NextButton/NextButton";
import { useForm } from "react-hook-form"; // 🟢 ADD THIS
import BackButton from "../BackButton/BackButton";
import Link from "next/link";
import useLoginModalStore from "@/store/useLoginModalStore";

export default function LoginForm({ register, handleSubmit, errors, isLoading, onLogin, onForgot }) {
  const { closeLoginModal } = useLoginModalStore();
  return (
    <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
      <TextField
        label="Email Address"
        name="email"
        type="email"
        placeholder="Email"
        register={register}
        required
        errors={errors}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        placeholder="Password"
        register={register}
        required
        errors={errors}
      />
      <NextButton label="Login" type="submit" disabled={isLoading} />

      <p className="reg-font text-black text-sm text-center mt-5" >

        Are you a new patient? <Link href={"/acknowledgment"} onClick={closeLoginModal} className="text-primary underline block mt-1"> Get started with the consultation</Link>
      </p>
      <div className="mt-2">
        <BackButton
          onClick={onForgot}
          label="Forgot Password?"
        />

      </div>
    </form>
  );
}
