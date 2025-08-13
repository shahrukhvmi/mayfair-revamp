import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FiUpload } from 'react-icons/fi';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import toast from 'react-hot-toast';
import useReorder from '@/store/useReorderStore';
import { ImageUplaodApi } from '@/api/ImageUploadApi';
import useCartStore from '@/store/useCartStore';
import useImageUploadStore from '@/store/useImageUploadStore ';
import GetImageIsUplaod from '@/api/GetImageIsUplaod';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from "framer-motion";
import NextButton from '@/Components/NextButton/NextButton';
import { FaCheckCircle } from "react-icons/fa";
import { useSearchParams } from 'next/navigation';

const PhotoUpload = () => {
    const GO = useRouter();
    // get Order id url to send photo uplaod api 
    const searchParams = useSearchParams();
    const [orderIdGetUrl, setOrderIdGetUrl] = useState(null)
    useEffect(() => {
        const param = searchParams.get("order_id");
        if (param) {
            const parsedId = parseInt(param, 10);
            if (!isNaN(parsedId)) {
                setOrderIdGetUrl(parsedId); // ✅ store in Zustand + localStorage
            }
        }
    }, [searchParams, setOrderIdGetUrl]);
    const { reorder } = useReorder();
    const { control, setValue, handleSubmit, watch } = useForm();
    const { orderId } = useCartStore();
    const frontPhoto = watch('frontPhoto');
    const sidePhoto = watch('sidePhoto');
    const [loading, setLoading] = useState(false);

    const [ImagesSend, setImagesSend] = useState(false)
    const { setImageUploaded, imageUploaded } = useImageUploadStore();
    useEffect(() => {
        const fetchImageStatus = async () => {
            try {
                const res = await GetImageIsUplaod({ order_id: orderId });
                console.log("Image Upload Response", res);

                setImageUploaded(res?.data?.status);
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
            reader.onload = () => resolve(reader.result.split(',')[1]); // remove `data:image/...;base64,`
            reader.onerror = reject;
        });
    const onSubmit = async (data) => {
        try {
            if (!data.frontPhoto || !data.sidePhoto) {
                toast.error("Please upload both images.");
                return;
            }
            setLoading(true); // Start loading
            const frontBase64 = await toBase64(data.frontPhoto);
            const sideBase64 = await toBase64(data.sidePhoto);

            const payload = {
                front: frontBase64,
                side: sideBase64,
                order_id: orderIdGetUrl ? orderIdGetUrl : orderId,
            };
            console.log(data, "datadatadatadata")

            await ImageUplaodApi(payload);



            // toast.success("Photos uploaded successfully!");
            // GO.push("/dashboard/");



        } catch (error) {

            if (error?.response?.data?.message === "Unauthenticated.") {
                toast.error("Failed to upload images. Please Login again."); GO.push("/login");
            }
        } finally {
            setLoading(false); // Stop loading
        }
    };

    console.log(ImagesSend, "ImagesSend");

    const [open, setOpen] = useState(false)
    console.log(imageUploaded, "imageUploaded")
    const handleAction = () => {
        // if (ImagesSend) {

        setOpen(true)
        // }
    }
    const renderUploadBox = (label, photo, type, placeholderUrl, suggestion) => (
        <div className="flex flex-col items-center w-full sm:w-1/2 px-3">
            <label className="w-full cursor-pointer">
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-5 hover:border-purple-500 hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center relative min-h-[260px]">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUpload(e, type)}
                        className="hidden"
                    />

                    {!photo && (
                        <div className="flex flex-col items-center justify-center mb-3">
                            {/* Upload Icon (Aqua Color) */}
                            <div className="bg-violet-100 rounded-full p-3 mb-2">
                                <FiUpload className="text-violet-700 w-8 h-8" />
                            </div>

                            {/* Upload Text */}
                            <p className="text-sm text-gray-500 font-medium">Drag files to upload</p>
                            <span className="text-xs text-gray-400">or click to browse</span>
                        </div>
                    )}


                    <img
                        src={photo ? URL.createObjectURL(photo) : placeholderUrl}
                        alt={`${label} preview`}
                        className="w-40 h-40 object-contain rounded-lg mb-3 transition-all"
                    />

                    <p className="text-base text-gray-800 font-medium">{label}</p>

                    {photo && (
                        <AiOutlineCheckCircle className="w-6 h-6 text-green-500 absolute top-3 right-3" />
                    )}
                </div>
            </label>

            {/* ✅ Suggestion Text */}
            <p className="text-xs text-gray-500 mt-2 text-center italic">
                {suggestion}
            </p>

            {photo && (
                <p className="text-green-600 mt-1 text-sm italic">
                    {label} uploaded successfully
                </p>
            )}
        </div>
    );


    return (
        <div className="my-14">
            <AnimatePresence>
                {open && ImagesSend && (
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
                                <FaCheckCircle className="text-primary" color='text-[#c9b2ed]' size={80} />
                            </motion.div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-center text-primary">
                                You’re All Set!
                            </h2>

                            {/* Message */}
                            <p className="text-md text-black text-center mt-3 mb-6 reg-font">
                                Your photos have been uploaded and are now under review by our
                                prescribers. We’ll approve your order once the review is complete
                                and notify you straight away.
                            </p>

                            {/* Button */}
                            <NextButton
                                label="Return to Dashboard"
                                onClick={() => GO.push("/dashboard")}
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
                className="max-w-5xl mx-auto my-auto px-6 py-10 bg-white shadow-2xl rounded-3xl border border-gray-100"
            >
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
                    Upload Your Full-Body Photos
                </h2>

                <p className="text-center text-gray-600 text-sm mb-10 leading-relaxed reg-font">
                    Upload a <strong className='bold-font text-gray-800'>front-facing</strong> and <strong className='bold-font text-gray-800'>side-facing</strong> full-body photo.
                    Ensure your <span className="text-purple-600 font-medium">height and weight</span> are accurate.<br />
                    {/* <span className="text-red-500 font-medium">Note: Images will not be saved if incomplete.</span> */}
                </p>


                <div className="flex flex-wrap sm:flex-nowrap justify-center gap-6 mb-8">
                    <Controller
                        name="frontPhoto"
                        control={control}
                        defaultValue={null}
                        render={() =>
                            renderUploadBox(
                                'Front Photo',
                                frontPhoto,
                                'frontPhoto',
                                '/images/front_image.png',
                                'Make sure your full body and arms are visible, facing forward.'
                            )
                        }
                    />

                    <Controller
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
                    />

                </div>

                <div className="flex flex-col items-center text-center">
                    <button
                        type="submit"
                        onClick={handleAction}
                        disabled={loading || !frontPhoto || !sidePhoto}
                        className={`px-6 py-3 rounded-full text-white bold-font text-sm transition-all duration-150 ease-in-out
      flex justify-center items-center cursor-pointer
      ${loading || !frontPhoto || !sidePhoto
                                ? "bg-gray-300 !cursor-not-allowed"
                                : "border-2 border-[#47317c] bg-[#47317c] hover:bg-[#3a2766]"}`}
                    >
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>

                    {(!frontPhoto || !sidePhoto) && (
                        <p className="text-xs text-gray-400 mt-2">
                            Please upload both images to enable this button
                        </p>
                    )}
                </div>

            </form>
        </div >
    );
};

export default PhotoUpload;
