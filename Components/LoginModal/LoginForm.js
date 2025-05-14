import TextField from "../TextField/TextField";
import NextButton from "../NextButton/NextButton";
import { useForm } from "react-hook-form"; // 🟢 ADD THIS
import BackButton from "../BackButton/BackButton";

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


      <div className="mt-2">
        <BackButton
          onClick={onForgot}
          label="Forgot Password?"
        />

      </div>
    </form>
  );
}
