import StepsHeader from "@/layout/stepsHeader";

const FormWrapper = ({ children, width }) => {
  return (
    <>
    
      <div className={`bg-white rounded-xl shadow-md w-full max-w-md ${width}`} >

        {children}
      </div>
    </>
  );
};

export default FormWrapper;
