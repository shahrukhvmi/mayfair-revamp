import TextField from "../TextField/TextField";
import NextButton from "../NextButton/NextButton";

export default function ResetForm({
  register,
  handleSubmit,
  errors,
  onSubmit,
  isLoading,
}) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        label="New Password"
        name="password"
        type="password"
        placeholder="New Password"
        register={register}
        required
        errors={errors}
      />
      <TextField
        label="Confirm Password"
        name="password_confirmation"
        type="password"
        placeholder="Confirm Password"
        register={register}
        required
        errors={errors}
      />
      <NextButton label="Change Password" type="submit" disabled={isLoading} />
    </form>
  );
}
