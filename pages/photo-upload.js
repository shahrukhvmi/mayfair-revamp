import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import toast from "react-hot-toast";
import useReorder from "@/store/useReorderStore";
import { ImageUplaodApi } from "@/api/ImageUploadApi";
import useCartStore from "@/store/useCartStore";
import useImageUploadStore from "@/store/useImageUploadStore ";
import GetImageIsUplaod from "@/api/GetImageIsUplaod";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import NextButton from "@/Components/NextButton/NextButton";
import { FaCheck, FaCheckCircle } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import StepsHeader from "@/layout/stepsHeader";
import FullBody from "@/public/images/full-body-ok.png";
import HalfBodyX from "@/public/images/half-body-x.png";
import FaceX from "@/public/images/face-x.png";
import Image from "next/image";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import { GetIdVerification } from "@/api/IdVerificationApi";

const PhotoUpload = () => {
  const GO = useRouter();
  const [open, setOpen] = useState(false);
  // get Order id url to send photo uplaod api
  const searchParams = useSearchParams();
  const [orderIdGetUrl, setOrderIdGetUrl] = useState(null);

  const { reorder } = useReorder();
  const { control, setValue, handleSubmit, watch } = useForm();
  const { orderId } = useCartStore();
  const frontPhoto = watch("frontPhoto");
  const sidePhoto = watch("sidePhoto");
  const [loading, setLoading] = useState(false);
  const [ImagesSend, setImagesSend] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Return to Dashboard");

  const { imageUploaded, setImageUploaded } = useImageUploadStore();
  const { idVerificationUpload, setIdVerificationUpload } =
    useIdVerificationUploadStore();

  useEffect(() => {
    const param = searchParams.get("order_id");
    if (param) {
      const parsedId = parseInt(param, 10);
      if (!isNaN(parsedId)) {
        setOrderIdGetUrl(parsedId); // ✅ store in Zustand + localStorage
      }
    }
  }, [searchParams, setOrderIdGetUrl]);

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({ order_id: orderId });
        console.log("Image Upload Response", res);

        setImageUploaded(res?.data?.status);
        setImagesSend(res?.data?.status);
        console.log(res, "Image Upload Status");

        if (!idVerificationUpload) {
          setButtonLabel("Upload ID verification photo");
        } else {
          setButtonLabel("Return to Dashboard");
        }
      } catch (error) {
        console.error("Failed to fetch image status:", error);
      }
    };

    if (orderId) fetchImageStatus();
  }, [orderId]);

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetIdVerification({ order_id: orderId });
        console.log("Image Upload Response", res);
        setIdVerificationUpload(res?.data?.status);
        setImagesSend(res?.data?.status);
        console.log(res, "Image Upload Status");
      } catch (error) {
        console.error("Failed to fetch image status:", error);
      }
    };
    if (orderId) fetchImageStatus();
  }, [orderId]);

  const handleUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setValue(type, file);
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // remove `data:image/...;base64,`
      reader.onerror = reject;
    });

  const onSubmit = async (data) => {
    try {
      if (!data.frontPhoto) {
        toast.error("Please upload Front images.");
        return;
      }
      setLoading(true); // Start loading
      const frontBase64 = await toBase64(data.frontPhoto);

      const payload = {
        front: frontBase64,
        order_id: orderIdGetUrl ? orderIdGetUrl : orderId,
      };

      const res = await ImageUplaodApi(payload);

      if (res?.status === 200) {
        // toast.success("Photos uploaded successfully!");
        setOpen(true);

        if (!idVerificationUpload) {
          setButtonLabel("Upload id verification photo");
        } else {
          setButtonLabel("Return to Dashboard");
        }
        // GO.push("/dashboard/");
      }
    } catch (error) {
      console.log(error?.response?.data?.errors?.Order, "skdsksdljsdskdl");

      if (error?.response?.data?.message === "Unauthenticated.") {
        toast.error("Failed to upload images. Please Login again.");
        GO.push("/login");
      }

      if (error?.response?.data?.errors?.Order === "Order not found") {
        toast.error(error?.response?.data?.errors?.Order);
      }
    } finally {
      setLoading(false); // ✅ loading hamesha false hoga
    }
  };

  console.log(ImagesSend, "GDJSGHSFHDSHFBSDJFSDJFB");

  console.log(imageUploaded, "imageUploaded");

  const handleRedirect = () => {
    if (!idVerificationUpload) {
      GO.push("/id-verification");
    } else {
      GO.push("/dashboard");
    }
  };

  const renderUploadBox = (label, photo, type, placeholderUrl, suggestion) => {
    const handleDrop = (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];

        // ✅ Only allow images
        if (file.type.startsWith("image/")) {
          setValue(type, file);
        } else {
          toast.error("Only image files are allowed.");
        }
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    return (
      <>
        <div className="flex flex-col items-center w-full sm:w-1/3 px-3">
          <label className="w-full cursor-pointer">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-purple-400 rounded-2xl p-2R 
                   hover:border-purple-600 hover:shadow-md transition-all duration-300 ease-in-out
                   flex flex-col items-center justify-center text-center relative min-h-[140px] bg-white"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, type)}
                className="hidden"
              />

              {/* ✅ No photo → Show upload UI */}
              {!photo && (
                <div className="flex flex-col items-center justify-center">
                  <FiUpload className="text-purple-600 w-7 h-7 mb-3" />
                  <p className="text-gray-700 text-sm reg-font">
                    Click here
                    <br />
                    <span className="text-gray-400 text-xs">
                      or drag the image to upload
                    </span>
                  </p>
                </div>
              )}

              {/* ✅ With photo → Show preview */}
              {photo && (
                <div className="flex flex-col items-center">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`${label} preview`}
                    className="w-28 h-40 object-contain rounded-lg mb-3"
                  />
                  <AiOutlineCheckCircle className="w-6 h-6 text-green-500 absolute top-3 right-3" />
                </div>
              )}

              {/* Label */}
              {/* <p className="mt-2 text-gray-800 font-medium">{label}</p> */}
            </div>
          </label>

          {/* Suggestion / Helper text */}
          <p className="text-xs text-gray-500 mt-2 text-center italic">
            {suggestion}
          </p>

          {/* {photo && (
                    <p className="text-green-600 mt-1 text-sm italic">
                        {label} uploaded successfully
                    </p>
                )} */}
        </div>
      </>
    );
  };

  return (
    <>
      <StepsHeader />
      <MetaLayout canonical={`${meta_url}photo-upload/`} />
      <div className="my-14">
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 max-w-md w-full border border-white/30"
              >
                {/* Animated Check Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 250, damping: 15 }}
                  className="flex justify-center mb-4"
                >
                  <FaCheckCircle
                    className="text-primary"
                    color="text-[#c9b2ed]"
                    size={80}
                  />
                </motion.div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-primary">
                  You’re All Set!
                </h2>

                {/* Message */}
                <p className="text-md text-black text-center mt-3 mb-6 reg-font">
                  {!idVerificationUpload
                    ? "Your full body photo have been uploaded and are now under review by our prescribers. You need to complete the ID verification to proceed. Please click the button below to continue."
                    : "Your photos have been uploaded and are now under review by our prescribers. We’ll approve your order once the review is complete and notify you straight away."}
                </p>

                {/* Button */}
                <NextButton
                  label={buttonLabel}
                  onClick={handleRedirect}
                  className="w-full"
                  // disabled={loading || !frontPhoto || !sidePhoto}
                  // loading={loading}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-3xl mx-auto my-auto px-6 sm:px-32 py-10 bg-white shadow-2xl rounded-3xl border border-gray-100"
        >
          <div className="mb-8 max-w-2xl mx-auto text-left">
            {/* Heading */}
            {/* <h2 className="subHeading niba-semibold-font mb-2 border-b pb-3">
                            Please upload a <span className='niba-bold-font text-black' >full body</span> picture of yourself
                        </h2> */}

            <h2 className="subHeading !text-black bold-font mb-3 border-b pb-3">
              Submit your photo for prescriber review
            </h2>

            {/* Description */}
            <p className="text-gray-700 mb-1 reg-font">
              Please upload a <span className="bold-font">full body</span>{" "}
              picture of yourself.
            </p>

            {/* Bullet Points */}
            <ul className="list-disc pl-6 text-gray-800 text-sm space-y-2 font-normal font-sans pt-2 my-10 sm:my-0">
              <li>We will only ask for this once.</li>
              <li>
                We realise it's inconvenient, but this is a regulatory
                requirement designed for your safety and to prevent
                inappropriate use.
              </li>
            </ul>
          </div>

          {/* Example Images */}
          <div className="flex justify-center  sm:gap-4 mb-8">
            <div className="flex flex-col items-center bg-white shadow-sm rounded-md mx-0 sm:mx-3 border-1">
              <Image
                src={FullBody}
                alt="correct"
                className="w-28 h-40 object-cover rounded-lg"
              />
              {/* <span className="text-green-500 font-bold my-1"><FaCheck size={18} /></span> */}
            </div>
            <div className="flex flex-col items-center bg-white shadow-sm rounded-md mx-0 sm:mx-3 border-1">
              <Image
                src={FaceX}
                alt="incorrect"
                className="w-28 h-40 object-cover rounded-lg"
              />
              {/* <span className="text-red-500 font-bold my-1"><RxCross2 size={18} /></span> */}
            </div>
            <div className="flex flex-col items-center bg-white shadow-sm rounded-md mx-0 sm:mx-3 border-1">
              <Image
                src={HalfBodyX}
                alt="incorrect"
                className="w-28 h-40 object-cover rounded-lg"
              />
              {/* <span className="text-red-500 font-bold my-1"><RxCross2 size={18} /></span> */}
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap justify-center gap-6 mb-8">
            <Controller
              name="frontPhoto"
              control={control}
              defaultValue={null}
              render={() =>
                renderUploadBox(
                  "Front Photo",
                  frontPhoto,
                  "frontPhoto",
                  "/images/front_image.png"
                )
              }
            />

            {/* <Controller
                        name="sidePhoto"
                        control={control}
                        defaultValue={null}
                        render={() =>
                            renderUploadBox(
                                'Side Photo',
                                sidePhoto,
                                'sidePhoto',
                                '/images/side_image.png',
                                'Stand sideways with good posture and full body visible.'
                            )
                        }
                    /> */}
          </div>

          <div className="w-full flex justify-center">
            <button
              type="submit"
              disabled={loading || !frontPhoto}
              className={`reg-font px-6 py-3 rounded-full text-white font-semibold text-sm transition-all duration-150 ease-in-out
      flex items-center justify-center 
      ${
        loading || !frontPhoto
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-[#47317c] hover:bg-[#3a2766] border-2 border-[#47317c] cursor-pointer"
      }
    `}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PhotoUpload;
