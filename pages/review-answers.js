import BackButton from "@/Components/BackButton/BackButton";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import { useRouter } from "next/router";
import React from "react";
import StepsHeader from "@/layout/stepsHeader";

const mockAnswers = [
  { question: "Please select your age group", answer: "18-24" },
  { question: "What do you want to achieve through weight loss?", answer: "Build my strength and endurance" },
  { question: "How tall are you (in cm)?", answer: "125 cm" },
  { question: "What is your current weight (in kgs)?", answer: "78 kg" },
  { question: "Do you have any other conditions your practitioner should be aware of?", answer: "None" },
];

const ReviewAnswers = () => {
  const router = useRouter();

  const handleRestart = () => {
    router.push("/personal-details");
  };

  return (
    <>
      <StepsHeader />
      <FormWrapper percentage={"95"} heading="Your Answers">
        <PageAnimationWrapper>
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              {/* Q&A Summary */}
              <div className="space-y-6">
                {mockAnswers.map((item, index) => (
                  <div key={index}>
                    <p className="text-sm font-semibold text-black">{item.question}</p>
                    <p className="text-sm text-gray-700 mt-1">{item.answer}</p>
                    <hr className="mt-4 border-gray-200" />
                  </div>
                ))}
              </div>

              {/* Bottom Action Buttons */}
              <div className="mt-8 space-y-3">
                <BackButton label="Go back" onClick={() => router.push("/confirmation-summary")} />

                <NextButton label="Restart quiz" onClick={handleRestart} />
              </div>
            </div>
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
};

export default ReviewAnswers;
