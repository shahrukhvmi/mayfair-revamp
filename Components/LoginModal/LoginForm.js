import TextField from "../TextField/TextField";
import NextButton from "../NextButton/NextButton";
import { useForm } from "react-hook-form"; // 🟢 ADD THIS

export default function LoginForm({ register, handleSubmit, errors, isLoading, onLogin, onForgot }) {
    
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
      <p
        onClick={onForgot}
        className="text-sm reg-font text-blue-500 underline cursor-pointer text-center mt-2"
      >
        Forgot Password?
      </p>
    </form>
  );
}
