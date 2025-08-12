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

const PhotoUpload = () => {
    const GO = useRouter();

    const { reorder } = useReorder();
    const { control, setValue, handleSubmit, watch } = useForm();
    const { orderId } = useCartStore();
    const frontPhoto = watch('frontPhoto');
    const sidePhoto = watch('sidePhoto');
    const [loading, setLoading] = useState(false);


    const { setImageUploaded } = useImageUploadStore();
    useEffect(() => {
        const fetchImageStatus = async () => {
            try {
                const res = await GetImageIsUplaod({ order_id: orderId });
                console.log("Image Upload Response", res);

                setImageUploaded(res?.data?.status);
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
                order_id: orderId,
            };
            console.log(data, "datadatadatadata")

            await ImageUplaodApi(payload);



            toast.success("Photos uploaded successfully!");
            GO.push("/dashboard/");



        } catch (error) {

            if (error?.response?.data?.message === "Unauthenticated.") {
                toast.error("Failed to upload images. Please Login again."); GO.push("/login");
            }
        } finally {
            setLoading(false); // Stop loading
        }
    };

    console.log(reorder, "Reorder Status");

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

                <div className="text-center flex flex-col items-center">
                    <button
                        type="submit"
                        disabled={loading || !frontPhoto || !sidePhoto}
                        className={`px-6 py-2 rounded-lg text-white bold-font transition
    ${loading || !frontPhoto || !sidePhoto
                                ? 'bg-violet-300 cursor-not-allowed'
                                : 'bg-[#47317c] cursor-pointer'}`}
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
