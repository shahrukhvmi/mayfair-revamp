import TextField from "@/Components/TextField/TextField";
import SectionWrapper from "./SectionWrapper";

const StepPersonalDetails = ({ register, errors }) => {
  return (
    <SectionWrapper>
      <h2 className="font-semibold text-lg mb-4 text-black">1. Personal details</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <TextField label="First name" name="firstName" register={register} required errors={errors} />
        <TextField label="Last name" name="lastName" register={register} required errors={errors} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <TextField label="Date of birth" name="dob" type="date" register={register} required errors={errors} />
        <TextField label="Mobile number" name="mobile" type="tel" register={register} required errors={errors} />
      </div>

      <TextField label="Email" name="email" type="email" register={register} required errors={errors} className="mt-4" />
      <TextField label="Password" name="password" type="password" register={register} required errors={errors} />
      <TextField label="Confirm Password" name="confirmPassword" type="password" register={register} required errors={errors} />
    </SectionWrapper>
  );
};

export default StepPersonalDetails;
