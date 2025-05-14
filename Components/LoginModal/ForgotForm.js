import TextField from "../TextField/TextField";
import NextButton from "../NextButton/NextButton";
import BackButton from "../BackButton/BackButton";

export default function ForgotForm({
  register,
  handleSubmit,
  errors,
  onSubmit,
  isLoading,
  isSuccess,
  onBack,
}) {
  return (
    <>
      {isSuccess ? (
        <div className="text-green-700 text-sm sm:text-base text-start my-4 space-y-2 reg-font leading-relaxed">
          <p>
            A password reset link has been sent to your email address.
          </p>

          <p className="text-gray-600 mt-2 reg-font">
            Didn’t receive the email? Check your spam or junk folder.
          </p>


        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <p className="paragraph reg-font">Enter your email address below and we will send you a password reset link.</p>
          <TextField
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email"
            register={register}
            required
            errors={errors}
          />
          <NextButton label="Send Password Reset Link" type="submit" disabled={isLoading} />

          <div className="mt-2">
            <BackButton
              onClick={onBack}
              label="Login"
            />

          </div>

        </form>
      )}
    </>
  );
}
